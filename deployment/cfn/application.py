from troposphere import (
    Parameter,
    Ref,
    Output,
    Tags,
    GetAtt,
    Join,
    Base64,
    ec2,
    autoscaling as asg,
    elasticloadbalancing as elb,
    cloudwatch as cw
)

from utils.cfn import get_recent_ami
from utils.constants import (
    ALLOW_ALL_CIDR,
    EC2_INSTANCE_TYPES,
    GRAPHITE,
    HTTP,
    HTTPS,
    POSTGRESQL,
    REDIS,
    RELP,
    SSH,
    STATSITE,
    VPC_CIDR
)

from majorkirby import StackNode, MKUnresolvableInputError


class Application(StackNode):
    INPUTS = {
        'Tags': ['global:Tags'],
        'Region': ['global:Region'],
        'StackType': ['global:StackType'],
        'StackColor': ['global:StackColor'],
        'KeyName': ['global:KeyName'],
        'AvailabilityZones': ['global:AvailabilityZones',
                              'VPC:AvailabilityZones'],
        'RDSPassword': ['global:RDSPassword', 'DataPlane:RDSPassword'],
        'AppServerInstanceType': ['global:AppServerInstanceType'],
        'AppServerAMI': ['global:AppServerAMI'],
        'AppServerInstanceProfile': ['global:AppServerInstanceProfile'],
        'AppServerAutoScalingDesired': ['global:AppServerAutoScalingDesired'],
        'AppServerAutoScalingMin': ['global:AppServerAutoScalingMin'],
        'AppServerAutoScalingMax': ['global:AppServerAutoScalingMax'],
        'AppServerAutoScalingScheduleStartCapacity': ['global:AppServerAutoScalingScheduleStartCapacity'],  # NOQA
        'AppServerAutoScalingScheduleStartRecurrence': ['global:AppServerAutoScalingScheduleStartRecurrence'],  # NOQA
        'AppServerAutoScalingScheduleEndCapacity': ['global:AppServerAutoScalingScheduleEndCapacity'],  # NOQA
        'AppServerAutoScalingScheduleEndRecurrence': ['global:AppServerAutoScalingScheduleEndRecurrence'],  # NOQA
        'SSLCertificateARN': ['global:SSLCertificateARN'],
        'PublicSubnets': ['global:PublicSubnets', 'VPC:PublicSubnets'],
        'PrivateSubnets': ['global:PrivateSubnets', 'VPC:PrivateSubnets'],
        'PublicHostedZoneName': ['global:PublicHostedZoneName'],
        'VpcId': ['global:VpcId', 'VPC:VpcId'],
        'GlobalNotificationsARN': ['global:GlobalNotificationsARN'],
        'RollbarServerSideAccessToken':
        ['global:RollbarServerSideAccessToken'],
        'BeekeepersDataBucket': ['global:BeekeepersDataBucket'],
    }

    DEFAULTS = {
        'Tags': {},
        'Region': 'us-east-1',
        'StackType': 'Staging',
        'StackColor': 'Green',
        'KeyName': 'icp-stg',
        'AppServerInstanceType': 't2.micro',
        'AppServerInstanceProfile': 'AppServerInstanceProfile',
        'AppServerAutoScalingDesired': '1',
        'AppServerAutoScalingMin': '1',
        'AppServerAutoScalingMax': '1',
    }

    ATTRIBUTES = {
        'StackType': 'StackType',
        'StackColor': 'StackColor',
    }

    def set_up_stack(self):
        super(Application, self).set_up_stack()

        tags = self.get_input('Tags').copy()
        tags.update({'StackType': 'Application'})

        self.default_tags = tags
        self.region = self.get_input('Region')

        self.add_description('Application server stack for ICP')

        # Parameters
        self.color = self.add_parameter(Parameter(
            'StackColor', Type='String',
            Description='Stack color', AllowedValues=['Blue', 'Green']
        ), 'StackColor')

        self.keyname = self.add_parameter(Parameter(
            'KeyName', Type='String',
            Description='Name of an existing EC2 key pair'
        ), 'KeyName')

        self.availability_zones = self.add_parameter(Parameter(
            'AvailabilityZones', Type='CommaDelimitedList',
            Description='Comma delimited list of availability zones'
        ), 'AvailabilityZones')

        self.rds_password = self.add_parameter(Parameter(
            'RDSPassword', Type='String', NoEcho=True,
            Description='Database password',
        ), 'RDSPassword')

        self.app_server_instance_type = self.add_parameter(Parameter(
            'AppServerInstanceType', Type='String', Default='t2.micro',
            Description='Application server EC2 instance type',
            AllowedValues=EC2_INSTANCE_TYPES,
            ConstraintDescription='must be a valid EC2 instance type.'
        ), 'AppServerInstanceType')

        self.app_server_ami = self.add_parameter(Parameter(
            'AppServerAMI', Type='String',
            Default=self.get_recent_app_server_ami(),
            Description='Application server AMI'
        ), 'AppServerAMI')

        self.app_server_instance_profile = self.add_parameter(Parameter(
            'AppServerInstanceProfile', Type='String',
            Default='AppServerInstanceProfile',
            Description='Application server instance profile'
        ), 'AppServerInstanceProfile')

        self.app_server_auto_scaling_desired = self.add_parameter(Parameter(
            'AppServerAutoScalingDesired', Type='String', Default='1',
            Description='Application server AutoScalingGroup desired'
        ), 'AppServerAutoScalingDesired')

        self.app_server_auto_scaling_min = self.add_parameter(Parameter(
            'AppServerAutoScalingMin', Type='String', Default='1',
            Description='Application server AutoScalingGroup minimum'
        ), 'AppServerAutoScalingMin')

        self.app_server_auto_scaling_max = self.add_parameter(Parameter(
            'AppServerAutoScalingMax', Type='String', Default='1',
            Description='Application server AutoScalingGroup maximum'
        ), 'AppServerAutoScalingMax')

        self.app_server_auto_scaling_schedule_start_recurrence = self.add_parameter(  # NOQA
            Parameter(
                'AppServerAutoScalingScheduleStartRecurrence', Type='String',
                Default='0 13 * * 1-5',
                Description='Application server ASG schedule start recurrence'
            ), 'AppServerAutoScalingScheduleStartRecurrence')

        self.app_server_auto_scaling_schedule_start_capacity = self.add_parameter(  # NOQA
            Parameter(
                'AppServerAutoScalingScheduleStartCapacity', Type='String',
                Default='1',
                Description='Application server ASG schedule start capacity'
            ), 'AppServerAutoScalingScheduleStartCapacity')

        self.app_server_auto_scaling_schedule_end_recurrence = self.add_parameter(  # NOQA
            Parameter(
                'AppServerAutoScalingScheduleEndRecurrence', Type='String',
                Default='0 23 * * *',
                Description='Application server ASG schedule end recurrence'
            ), 'AppServerAutoScalingScheduleEndRecurrence')

        self.app_server_auto_scaling_schedule_end_capacity = self.add_parameter(  # NOQA
            Parameter(
                'AppServerAutoScalingScheduleEndCapacity', Type='String',
                Default='1',
                Description='Application server ASG schedule end capacity'
            ), 'AppServerAutoScalingScheduleEndCapacity')

        self.ssl_certificate_arn = self.add_parameter(Parameter(
            'SSLCertificateARN', Type='String',
            Description='ARN for a SSL certificate stored in IAM'
        ), 'SSLCertificateARN')

        self.public_subnets = self.add_parameter(Parameter(
            'PublicSubnets', Type='CommaDelimitedList',
            Description='A list of public subnets'
        ), 'PublicSubnets')

        self.private_subnets = self.add_parameter(Parameter(
            'PrivateSubnets', Type='CommaDelimitedList',
            Description='A list of private subnets'
        ), 'PrivateSubnets')

        self.public_hosted_zone_name = self.add_parameter(Parameter(
            'PublicHostedZoneName', Type='String',
            Description='Route 53 public hosted zone name'
        ), 'PublicHostedZoneName')

        self.vpc_id = self.add_parameter(Parameter(
            'VpcId', Type='String',
            Description='VPC ID'
        ), 'VpcId')

        self.notification_topic_arn = self.add_parameter(Parameter(
            'GlobalNotificationsARN', Type='String',
            Description='ARN for an SNS topic to broadcast notifications'
        ), 'GlobalNotificationsARN')

        app_server_lb_security_group, \
            app_server_security_group = self.create_security_groups()
        app_server_lb = self.create_load_balancers(
            app_server_lb_security_group)

        self.create_auto_scaling_resources(app_server_security_group,
                                           app_server_lb)

        self.create_cloud_watch_resources(app_server_lb)

        self.add_output(Output('AppServerLoadBalancerEndpoint',
                               Value=GetAtt(app_server_lb, 'DNSName')))
        self.add_output(Output('AppServerLoadBalancerHostedZoneNameID',
                               Value=GetAtt(app_server_lb,
                                            'CanonicalHostedZoneNameID')))

    def get_recent_app_server_ami(self):
        try:
            app_server_ami_id = self.get_input('AppServerAMI')
        except MKUnresolvableInputError:
            filters = {'name': 'icp-app-*',
                       'architecture': 'x86_64',
                       'block-device-mapping.volume-type': 'gp2',
                       'root-device-type': 'ebs',
                       'virtualization-type': 'hvm',
                       'tag:Environment': self.get_input('StackType')}

            app_server_ami_id = get_recent_ami(self.aws_profile,
                                               filters=filters)

        return app_server_ami_id

    def create_security_groups(self):
        app_server_lb_security_group_name = 'sgAppServerLoadBalancer'
        app_server_lb_security_group = self.add_resource(ec2.SecurityGroup(
            app_server_lb_security_group_name,
            GroupDescription='Enables access to application servers via a '
                             'load balancer',
            VpcId=Ref(self.vpc_id),
            SecurityGroupIngress=[
                ec2.SecurityGroupRule(
                    IpProtocol='tcp', CidrIp=ALLOW_ALL_CIDR, FromPort=p,
                    ToPort=p
                )
                for p in [HTTP, HTTPS]
            ],
            SecurityGroupEgress=[
                ec2.SecurityGroupRule(
                    IpProtocol='tcp', CidrIp=VPC_CIDR, FromPort=p, ToPort=p
                )
                for p in [HTTP]
            ],
            Tags=self.get_tags(Name=app_server_lb_security_group_name)
        ))

        app_server_security_group_name = 'sgAppServer'
        app_server_security_group = self.add_resource(ec2.SecurityGroup(
            app_server_security_group_name,
            DependsOn='sgAppServerLoadBalancer',
            GroupDescription='Enables access to application servers',
            VpcId=Ref(self.vpc_id),
            SecurityGroupIngress=[
                ec2.SecurityGroupRule(
                    IpProtocol='tcp', CidrIp=VPC_CIDR, FromPort=p, ToPort=p
                )
                for p in [SSH, HTTP]
            ] + [
                ec2.SecurityGroupRule(
                    IpProtocol='tcp', SourceSecurityGroupId=Ref(sg),
                    FromPort=HTTP, ToPort=HTTP
                )
                for sg in [app_server_lb_security_group]
            ],
            SecurityGroupEgress=[
                ec2.SecurityGroupRule(
                    IpProtocol='tcp', CidrIp=VPC_CIDR, FromPort=p, ToPort=p
                )
                for p in [GRAPHITE, POSTGRESQL, REDIS, STATSITE, RELP]
            ] + [
                ec2.SecurityGroupRule(
                    IpProtocol='udp', CidrIp=VPC_CIDR, FromPort=p, ToPort=p
                )
                for p in [STATSITE]
            ] + [
                ec2.SecurityGroupRule(
                    IpProtocol='tcp', CidrIp=ALLOW_ALL_CIDR, FromPort=p,
                    ToPort=p
                )
                for p in [HTTP, HTTPS]
            ],
            Tags=self.get_tags(Name=app_server_security_group_name)
        ))

        return app_server_lb_security_group, app_server_security_group

    def create_load_balancers(self, app_server_lb_security_group):
        app_server_lb_name = 'elbAppServer'
        return self.add_resource(elb.LoadBalancer(
            app_server_lb_name,
            ConnectionDrainingPolicy=elb.ConnectionDrainingPolicy(
                Enabled=True,
                Timeout=300,
            ),
            CrossZone=True,
            SecurityGroups=[Ref(app_server_lb_security_group)],
            Listeners=[
                elb.Listener(
                    LoadBalancerPort='80',
                    InstancePort='80',
                    Protocol='HTTP',
                ),
                elb.Listener(
                    LoadBalancerPort='443',
                    InstancePort='80',
                    Protocol='HTTPS',
                    SSLCertificateId=Ref(self.ssl_certificate_arn)
                )
            ],
            HealthCheck=elb.HealthCheck(
                Target='HTTP:80/health-check/',
                HealthyThreshold='3',
                UnhealthyThreshold='2',
                Interval='30',
                Timeout='5',
            ),
            Subnets=Ref(self.public_subnets),
            Tags=self.get_tags(Name=app_server_lb_name)
        ))

    def create_auto_scaling_resources(self, app_server_security_group,
                                      app_server_lb):
        app_server_launch_config = self.add_resource(
            asg.LaunchConfiguration(
                'lcAppServer',
                ImageId=Ref(self.app_server_ami),
                IamInstanceProfile=Ref(self.app_server_instance_profile),
                InstanceType=Ref(self.app_server_instance_type),
                KeyName=Ref(self.keyname),
                SecurityGroups=[Ref(app_server_security_group)],
                UserData=Base64(
                    Join('', self.get_cloud_config()))
            ))

        app_server_auto_scaling_group = self.add_resource(
            asg.AutoScalingGroup(
                'asgAppServer',
                AvailabilityZones=Ref(self.availability_zones),
                Cooldown=300,
                DesiredCapacity=Ref(self.app_server_auto_scaling_desired),
                HealthCheckGracePeriod=600,
                HealthCheckType='ELB',
                LaunchConfigurationName=Ref(app_server_launch_config),
                LoadBalancerNames=[Ref(app_server_lb)],
                MaxSize=Ref(self.app_server_auto_scaling_max),
                MinSize=Ref(self.app_server_auto_scaling_min),
                NotificationConfigurations=[
                    asg.NotificationConfigurations(
                        TopicARN=Ref(self.notification_topic_arn),
                        NotificationTypes=[
                            asg.EC2_INSTANCE_LAUNCH,
                            asg.EC2_INSTANCE_LAUNCH_ERROR,
                            asg.EC2_INSTANCE_TERMINATE,
                            asg.EC2_INSTANCE_TERMINATE_ERROR
                        ]
                    )
                ],
                VPCZoneIdentifier=Ref(self.private_subnets),
                Tags=[asg.Tag('Name', 'AppServer', True)])
        )

        self.add_resource(
            asg.ScheduledAction(
                'schedTileServerAutoScalingStart',
                AutoScalingGroupName=Ref(app_server_auto_scaling_group),
                DesiredCapacity=Ref(
                    self.app_server_auto_scaling_schedule_start_capacity),
                Recurrence=Ref(
                    self.app_server_auto_scaling_schedule_start_recurrence)
            )
        )

        self.add_resource(
            asg.ScheduledAction(
                'schedTileServerAutoScalingEnd',
                AutoScalingGroupName=Ref(app_server_auto_scaling_group),
                DesiredCapacity=Ref(
                    self.app_server_auto_scaling_schedule_end_capacity),
                Recurrence=Ref(
                    self.app_server_auto_scaling_schedule_end_recurrence)
            )
        )

    def get_cloud_config(self):
        return ['#cloud-config\n',
                '\n',
                'write_files:\n',
                '  - path: /etc/icp.d/env/ICP_STACK_COLOR\n',
                '    permissions: 0750\n',
                '    owner: root:icp\n',
                '    content: ', Ref(self.color), '\n',
                '  - path: /etc/icp.d/env/ICP_STACK_TYPE\n',
                '    permissions: 0750\n',
                '    owner: root:icp\n',
                '    content: ', self.get_input('StackType'), '\n',
                '  - path: /etc/icp.d/env/ICP_DB_PASSWORD\n',
                '    permissions: 0750\n',
                '    owner: root:icp\n',
                '    content: ', Ref(self.rds_password), '\n',
                '  - path: /etc/icp.d/env/ROLLBAR_SERVER_SIDE_ACCESS_TOKEN\n',
                '    permissions: 0750\n',
                '    owner: root:icp\n',
                '    content: ', self.get_input('RollbarServerSideAccessToken'), '\n',  # NOQA
                '  - path: /etc/icp.d/env/AWS_BEEKEEPERS_DATA_BUCKET\n',
                '    permissions: 0750\n',
                '    owner: root:icp\n',
                '    content: ', self.get_input('BeekeepersDataBucket'), '\n'
                ]

    def create_cloud_watch_resources(self, app_server_lb):
        self.add_resource(cw.Alarm(
            'alarmAppServerBackend4XX',
            AlarmDescription='Application server backend 4XXs',
            AlarmActions=[Ref(self.notification_topic_arn)],
            Statistic='Sum',
            Period=300,
            Threshold='20',
            EvaluationPeriods=1,
            ComparisonOperator='GreaterThanThreshold',
            MetricName='HTTPCode_Backend_4XX',
            Namespace='AWS/ELB',
            Dimensions=[
                cw.MetricDimension(
                    'metricLoadBalancerName',
                    Name='LoadBalancerName',
                    Value=Ref(app_server_lb)
                )
            ],
        ))

        self.add_resource(cw.Alarm(
            'alarmAppServerBackend5XX',
            AlarmDescription='Application server backend 5XXs',
            AlarmActions=[Ref(self.notification_topic_arn)],
            Statistic='Sum',
            Period=60,
            Threshold='0',
            EvaluationPeriods=1,
            ComparisonOperator='GreaterThanThreshold',
            MetricName='HTTPCode_Backend_5XX',
            Namespace='AWS/ELB',
            Dimensions=[
                cw.MetricDimension(
                    'metricLoadBalancerName',
                    Name='LoadBalancerName',
                    Value=Ref(app_server_lb)
                )
            ],
        ))

    def get_tags(self, **kwargs):
        """Helper method to return Troposphere tags + default tags

        Args:
          **kwargs: arbitrary keyword arguments to be used as tags
        """
        kwargs.update(self.default_tags)
        return Tags(**kwargs)
