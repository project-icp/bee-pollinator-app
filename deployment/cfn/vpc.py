from troposphere import (
    Parameter,
    Ref,
    Output,
    Tags,
    GetAtt,
    Join,
    ec2,
    route53 as r53
)

from utils.cfn import (
    get_availability_zones,
    get_recent_ami,
    get_subnet_cidr_block
)

from utils.constants import (
    AMAZON_S3_VPC_ENDPOINT,
    ALLOW_ALL_CIDR,
    EC2_INSTANCE_TYPES,
    GRAPHITE,
    GRAPHITE_WEB,
    HTTP,
    HTTPS,
    KIBANA,
    POSTGRESQL,
    REDIS,
    RELP,
    SSH,
    STATSITE,
    VPC_CIDR
)

from majorkirby import StackNode, MKUnresolvableInputError


cidr_generator = get_subnet_cidr_block()


class VPC(StackNode):
    INPUTS = {
        'Tags': ['global:Tags'],
        'Region': ['global:Region'],
        'StackType': ['global:StackType'],
        'KeyName': ['global:KeyName'],
        'IPAccess': ['global:IPAccess'],
        'AvailabilityZones': ['global:AvailabilityZones'],
        'BastionHostInstanceType': ['global:BastionHostInstanceType'],
        'BastionHostAMI': ['global:BastionHostAMI'],
        'BastionInstanceProfile': ['global:BastionInstanceProfile'],
        'PublicHostedZoneName': ['global:PublicHostedZoneName'],
        'PrivateHostedZoneName': ['global:PrivateHostedZoneName'],
    }

    DEFAULTS = {
        'Tags': {},
        'Region': 'us-east-1',
        'StackType': 'Staging',
        'KeyName': 'icp-stg',
        'IPAccess': ALLOW_ALL_CIDR,
        'AvailabilityZones': 'us-east-1b,us-east-1d',
        'BastionHostInstanceType': 't2.nano',
        'BastionInstanceProfile': 'BastionInstanceProfile',
    }

    ATTRIBUTES = {'StackType': 'StackType'}

    PUBLIC_SUBNETS = []
    PRIVATE_SUBNETS = []
    PRIVATE_ROUTE_TABLES = []

    def set_up_stack(self):
        super(VPC, self).set_up_stack()

        tags = self.get_input('Tags').copy()
        tags.update({'StackType': 'VPC'})

        self.default_tags = tags
        self.region = self.get_input('Region')
        self.availability_zones = get_availability_zones(self.aws_profile)

        self.add_description('VPC stack for ICP')

        # Parameters
        self.keyname = self.add_parameter(Parameter(
            'KeyName', Type='String',
            Description='Name of an existing EC2 key pair'
        ), 'KeyName')

        self.ip_access = self.add_parameter(Parameter(
            'IPAccess', Type='String', Default=self.get_input('IPAccess'),
            Description='CIDR for allowing SSH access'
        ), 'IPAccess')

        self.bastion_instance_type = self.add_parameter(Parameter(
            'BastionHostInstanceType', Type='String', Default='t2.nano',
            Description='Bastion host EC2 instance type',
            AllowedValues=EC2_INSTANCE_TYPES,
            ConstraintDescription='must be a valid EC2 instance type.'
        ), 'BastionHostInstanceType')

        self.bastion_host_ami = self.add_parameter(Parameter(
            'BastionHostAMI', Type='String',
            Default=self.get_recent_bastion_ami(),
            Description='Bastion host AMI'
        ), 'BastionHostAMI')

        self.bastion_instance_profile = self.add_parameter(Parameter(
            'BastionInstanceProfile', Type='String',
            Default='BastionInstanceProfile',
            Description='Bastion server instance profile'
        ), 'BastionInstanceProfile')

        self.public_hosted_zone_name = self.add_parameter(Parameter(
            'PublicHostedZoneName', Type='String',
            Description='Route 53 public hosted zone name'
        ), 'PublicHostedZoneName')

        self.private_hosted_zone_name = self.add_parameter(Parameter(
            'PrivateHostedZoneName', Type='String',
            Description='Route 53 private hosted zone name'
        ), 'PrivateHostedZoneName')

        self.create_vpc()
        self.create_vpc_endpoint()
        bastion_host, bastion_security_group = self.create_bastion()

        privte_hosted_zone = self.create_dns_records(bastion_host)

        self.add_output(Output('PrivateHostedZoneId',
                               Value=Ref(privte_hosted_zone)))
        self.add_output(Output('BastionSecurityGroup',
                               Value=Ref(bastion_security_group)))
        self.add_output(Output('AvailabilityZones',
                               Value=','.join(self.default_azs)))
        self.add_output(Output(
            'PrivateSubnets',
            Value=Join(',', map(Ref, self.default_private_subnets))))
        self.add_output(Output(
            'PublicSubnets',
            Value=Join(',', map(Ref, self.default_public_subnets))))

    def get_recent_bastion_ami(self):
        try:
            bastion_ami_id = self.get_input('BastionHostAMI')
        except MKUnresolvableInputError:
            filters = {'name': 'icp-monitoring-*',
                       'architecture': 'x86_64',
                       'block-device-mapping.volume-type': 'gp2',
                       'root-device-type': 'ebs',
                       'virtualization-type': 'hvm'}

            bastion_ami_id = get_recent_ami(self.aws_profile, filters,
                                            region=self.region)

        return bastion_ami_id

    def create_vpc(self):
        vpc_name = 'ICPVPC'
        self.vpc = self.create_resource(ec2.VPC(
            vpc_name,
            CidrBlock=VPC_CIDR,
            EnableDnsSupport=True,
            EnableDnsHostnames=True,
            Tags=self.get_tags(Name=vpc_name)
        ), output='VpcId')

        self.public_route_table = self.create_routing_resources()
        self.create_subnets()

    def create_vpc_endpoint(self):
        self.create_resource(ec2.VPCEndpoint(
            'S3VPCEndpoint',
            RouteTableIds=[Ref(prt)
                           for prt in self.PRIVATE_ROUTE_TABLES],
            ServiceName=AMAZON_S3_VPC_ENDPOINT,
            VpcId=Ref(self.vpc))
        )

    def create_routing_resources(self):
        gateway = self.create_resource(
            ec2.InternetGateway(
                'InternetGateway',
                Tags=self.get_tags()
            )
        )

        gateway_attachment = self.create_resource(
            ec2.VPCGatewayAttachment(
                'VPCGatewayAttachment',
                VpcId=Ref(self.vpc),
                InternetGatewayId=Ref(gateway)
            )
        )

        public_route_table = self.create_resource(
            ec2.RouteTable(
                'PublicRouteTable',
                VpcId=Ref(self.vpc))
        )

        self.create_resource(
            ec2.Route(
                'PublicRoute',
                RouteTableId=Ref(public_route_table),
                DestinationCidrBlock=ALLOW_ALL_CIDR,
                DependsOn=gateway_attachment.title,
                GatewayId=Ref(gateway)
            )
        )

        return public_route_table

    def create_subnets(self):
        self.default_azs = []
        self.default_private_subnets = []
        self.default_public_subnets = []

        for num, availability_zone in enumerate(self.availability_zones):
            public_subnet_name = '{}PublicSubnet'.format(
                availability_zone.cfn_name)
            public_subnet = self.create_resource(ec2.Subnet(
                public_subnet_name,
                VpcId=Ref(self.vpc),
                CidrBlock=cidr_generator.next(),
                AvailabilityZone=availability_zone.name,
                Tags=self.get_tags(Name=public_subnet_name)
            ), output=public_subnet_name)

            self.create_resource(ec2.SubnetRouteTableAssociation(
                '{}PublicRouteTableAssociation'.format(public_subnet.title),
                SubnetId=Ref(public_subnet),
                RouteTableId=Ref(self.public_route_table)
            ))

            private_subnet_name = '{}PrivateSubnet'.format(
                availability_zone.cfn_name)
            private_subnet = self.create_resource(ec2.Subnet(
                private_subnet_name,
                VpcId=Ref(self.vpc),
                CidrBlock=cidr_generator.next(),
                AvailabilityZone=availability_zone.name,
                Tags=self.get_tags(Name=private_subnet_name)
                ), output=private_subnet_name)

            private_route_table_name = '{}PrivateRouteTable'.format(
                availability_zone.cfn_name)
            private_route_table = self.create_resource(ec2.RouteTable(
                private_route_table_name,
                VpcId=Ref(self.vpc),
                Tags=self.get_tags(Name=private_route_table_name)
            ))

            self.PRIVATE_ROUTE_TABLES.append(private_route_table)

            self.create_resource(ec2.SubnetRouteTableAssociation(
                '{}PrivateSubnetRouteTableAssociation'.format(
                    private_subnet.title),
                SubnetId=Ref(private_subnet),
                RouteTableId=Ref(private_route_table)
            ))

            self.PUBLIC_SUBNETS.append(public_subnet)
            self.PRIVATE_SUBNETS.append(private_subnet)

            if availability_zone.name in self.get_input('AvailabilityZones'):
                self.create_nat_gateway(availability_zone, public_subnet,
                                        private_route_table)
                self.default_azs.append(availability_zone.name)
                self.default_private_subnets.append(private_subnet)
                self.default_public_subnets.append(public_subnet)

    def create_nat_gateway(self, availability_zone, public_subnet,
                           private_route_table):
        nat_eip = self.create_resource(ec2.EIP(
            '{}NATIP'.format(availability_zone.cfn_name),
            Domain="vpc",
        ))

        nat_gateway = self.create_resource(ec2.NatGateway(
            '{}NATGateway'.format(availability_zone.cfn_name),
            AllocationId=GetAtt(nat_eip, 'AllocationId'),
            SubnetId=Ref(public_subnet),
        ))

        self.create_resource(ec2.Route(
            '{}PrivateRoute'.format(availability_zone.cfn_name),
            RouteTableId=Ref(private_route_table),
            DestinationCidrBlock=ALLOW_ALL_CIDR,
            NatGatewayId=Ref(nat_gateway))
        )

    def create_bastion(self):
        bastion_security_group_name = 'sgBastion'
        bastion_security_group = self.add_resource(ec2.SecurityGroup(
            bastion_security_group_name,
            GroupDescription='Enables access to the BastionHost',
            VpcId=Ref(self.vpc),
            SecurityGroupIngress=[
                ec2.SecurityGroupRule(IpProtocol='tcp',
                                      CidrIp=Ref(self.ip_access),
                                      FromPort=p, ToPort=p)
                for p in [GRAPHITE_WEB, KIBANA, SSH]
            ] + [
                ec2.SecurityGroupRule(IpProtocol='tcp',
                                      CidrIp=VPC_CIDR,
                                      FromPort=p, ToPort=p)
                for p in [GRAPHITE, RELP, STATSITE]
            ] + [
                ec2.SecurityGroupRule(IpProtocol='udp', CidrIp=VPC_CIDR,
                                      FromPort=p, ToPort=p)
                for p in [STATSITE]
            ],
            SecurityGroupEgress=[
                ec2.SecurityGroupRule(IpProtocol='tcp',
                                      CidrIp=VPC_CIDR,
                                      FromPort=p, ToPort=p)
                for p in [POSTGRESQL, REDIS, SSH]
            ] + [
                ec2.SecurityGroupRule(IpProtocol='tcp',
                                      CidrIp=ALLOW_ALL_CIDR,
                                      FromPort=p, ToPort=p)
                for p in [HTTP, HTTPS]
            ],
            Tags=self.get_tags(Name=bastion_security_group_name)
        ))

        bastion_host_name = 'BastionHost'
        bastion_host = self.add_resource(ec2.Instance(
            bastion_host_name,
            BlockDeviceMappings=[
                {
                    "DeviceName": "/dev/sda1",
                    "Ebs": {
                        "VolumeType": "gp2",
                        "VolumeSize": "256"
                    }
                }
            ],
            InstanceType=Ref(self.bastion_instance_type),
            KeyName=Ref(self.keyname),
            IamInstanceProfile=Ref(self.bastion_instance_profile),
            ImageId=Ref(self.bastion_host_ami),
            NetworkInterfaces=[
                ec2.NetworkInterfaceProperty(
                    Description='ENI for BastionHost',
                    GroupSet=[Ref(bastion_security_group)],
                    SubnetId=Ref(self.PUBLIC_SUBNETS[0]),
                    AssociatePublicIpAddress=True,
                    DeviceIndex=0,
                    DeleteOnTermination=True
                )
            ],
            Tags=self.get_tags(Name=bastion_host_name)
        ))

        return bastion_host, bastion_security_group

    def create_dns_records(self, bastion_host):
        private_hosted_zone = self.add_resource(r53.HostedZone(
            'dnsPrivateHostedZone',
            Name=Join('', [Ref(self.private_hosted_zone_name), '.']),
            VPCs=[r53.HostedZoneVPCs(
                VPCId=Ref(self.vpc),
                VPCRegion=self.region
            )]
        ))

        self.add_resource(r53.RecordSetGroup(
            'dnsPublicRecords',
            HostedZoneName=Join('', [Ref(self.public_hosted_zone_name), '.']),
            RecordSets=[
                r53.RecordSet(
                    'dnsMonitoringServer',
                    Name=Join('', ['monitoring.',
                              Ref(self.public_hosted_zone_name), '.']),
                    Type='A',
                    TTL='300',
                    ResourceRecords=[GetAtt(bastion_host, 'PublicIp')]
                )
            ]
        ))

        self.add_resource(r53.RecordSetGroup(
            'dnsPrivateRecords',
            HostedZoneId=Ref(private_hosted_zone),
            RecordSets=[
                r53.RecordSet(
                    'dnsBastionHost',
                    Name=Join('', ['monitoring.service.',
                              Ref(self.private_hosted_zone_name), '.']),
                    Type='A',
                    TTL='10',
                    ResourceRecords=[GetAtt(bastion_host, 'PrivateIp')]
                )
            ]
        ))

        return private_hosted_zone

    def create_resource(self, resource, output=None):
        """Helper method to attach resource to template and return it

        This helper method is used when adding _any_ CloudFormation resource
        to the template. It abstracts out the creation of the resource, adding
        it to the template, and optionally adding it to the outputs as well

        Args:
          resource: Troposphere resource to create
          output: Name of output to return this value as
        """
        resource = self.add_resource(resource)

        if output:
            cloudformation_output = Output(
                output,
                Value=Ref(resource)
            )

            self.add_output(cloudformation_output)

        return resource

    def get_tags(self, **kwargs):
        """Helper method to return Troposphere tags + default tags

        Args:
          **kwargs: arbitrary keyword arguments to be used as tags
        """
        kwargs.update(self.default_tags)
        return Tags(**kwargs)
