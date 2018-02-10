from troposphere import (
    Parameter,
    Ref,
    Output,
    Tags,
    GetAtt,
    Join,
    cloudwatch,
    ec2,
    elasticache as ec,
    rds,
    route53 as r53
)

from utils.constants import (
    ELASTICACHE_INSTANCE_TYPES,
    POSTGRESQL,
    RDS_INSTANCE_TYPES,
    REDIS,
    VPC_CIDR
)

from majorkirby import StackNode


class DataPlane(StackNode):
    INPUTS = {
        'Tags': ['global:Tags'],
        'Region': ['global:Region'],
        'StackType': ['global:StackType'],
        'AvailabilityZones': ['global:AvailabilityZones',
                              'VPC:AvailabilityZones'],
        'RDSInstanceType': ['global:RDSInstanceType'],
        'RDSDbName': ['global:RDSDbName'],
        'RDSUsername': ['global:RDSUsername'],
        'RDSPassword': ['global:RDSPassword'],
        'ECInstanceType': ['global:ECInstanceType'],
        'PublicSubnets': ['global:PublicSubnets', 'VPC:PublicSubnets'],
        'PrivateSubnets': ['global:PrivateSubnets', 'VPC:PrivateSubnets'],
        'PublicHostedZoneName': ['global:PublicHostedZoneName'],
        'PrivateHostedZoneId': ['global:PrivateHostedZoneId',
                                'VPC:PrivateHostedZoneId'],
        'PrivateHostedZoneName': ['global:PrivateHostedZoneName'],
        'VpcId': ['global:VpcId', 'VPC:VpcId'],
        'GlobalNotificationsARN': ['global:GlobalNotificationsARN'],
    }

    DEFAULTS = {
        'Tags': {},
        'Region': 'us-east-1',
        'StackType': 'Staging',
        'RDSInstanceType': 'db.t2.micro',
        'RDSDbName': 'icp_bees',
        'RDSUsername': 'icp_bees',
        'RDSPassword': 'icp_bees',
        'ECInstanceType': 'cache.m1.small',
    }

    ATTRIBUTES = {'StackType': 'StackType'}

    def set_up_stack(self):
        super(DataPlane, self).set_up_stack()

        tags = self.get_input('Tags').copy()
        tags.update({'StackType': 'DataPlane'})

        self.default_tags = tags
        self.region = self.get_input('Region')

        self.add_description('Data plane stack for ICP')

        # Parameters
        self.availability_zones = self.add_parameter(Parameter(
            'AvailabilityZones', Type='CommaDelimitedList',
            Description='Comma delimited list of availability zones'
        ), 'AvailabilityZones')

        self.rds_instance_type = self.add_parameter(Parameter(
            'RDSInstanceType', Type='String', Default='db.t2.micro',
            Description='RDS instance type', AllowedValues=RDS_INSTANCE_TYPES,
            ConstraintDescription='must be a valid RDS instance type.'
        ), 'RDSInstanceType')

        self.rds_db_name = self.add_parameter(Parameter(
            'RDSDbName', Type='String', Description='Database name'
        ), 'RDSDbName')

        self.rds_username = self.add_parameter(Parameter(
            'RDSUsername', Type='String', Description='Database username'
        ), 'RDSUsername')

        self.rds_password = self.add_parameter(Parameter(
            'RDSPassword', Type='String', NoEcho=True,
            Description='Database password',
        ), 'RDSPassword')

        self.elasticache_instance_type = self.add_parameter(Parameter(
            'ECInstanceType', Type='String', Default='cache.m1.small',
            Description='ElastiCache instance type',
            AllowedValues=ELASTICACHE_INSTANCE_TYPES,
            ConstraintDescription='must be a valid ElastiCache instance type.'
        ), 'ECInstanceType')

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

        self.private_hosted_zone_id = self.add_parameter(Parameter(
            'PrivateHostedZoneId', Type='String',
            Description='Route 53 private hosted zone ID'
        ), 'PrivateHostedZoneId')

        self.private_hosted_zone_name = self.add_parameter(Parameter(
            'PrivateHostedZoneName', Type='String',
            Description='Route 53 private hosted zone name'
        ), 'PrivateHostedZoneName')

        self.vpc_id = self.add_parameter(Parameter(
            'VpcId', Type='String',
            Description='VPC ID'
        ), 'VpcId')

        self.notification_topic_arn = self.add_parameter(Parameter(
            'GlobalNotificationsARN', Type='String',
            Description='ARN for an SNS topic to broadcast notifications'
        ), 'GlobalNotificationsARN')

        rds_database, rds_database_security_group = self.create_rds_instance()
        self.create_rds_cloudwatch_alarms(rds_database)

        ec_group, ec_security_group \
            = self.create_elasticache_replication_group()
        self.create_elasticache_cloudwatch_alarms(ec_group)

        self.create_dns_records(rds_database, ec_group)

        self.add_output(Output('DatabaseSecurityGroup',
                               Value=Ref(rds_database_security_group)))
        self.add_output(Output('CacheSecurityGroup',
                               Value=Ref(ec_security_group)))

    def create_rds_instance(self):
        rds_security_group_name = 'sgDatabaseServer'
        rds_security_group = self.add_resource(ec2.SecurityGroup(
            rds_security_group_name,
            GroupDescription='Enables access to database servers',
            VpcId=Ref(self.vpc_id),
            SecurityGroupIngress=[
                ec2.SecurityGroupRule(
                    IpProtocol='tcp', CidrIp=VPC_CIDR, FromPort=p, ToPort=p
                )
                for p in [POSTGRESQL]
            ],
            SecurityGroupEgress=[
                ec2.SecurityGroupRule(
                    IpProtocol='tcp', CidrIp=VPC_CIDR, FromPort=p, ToPort=p
                )
                for p in [POSTGRESQL]
            ],
            Tags=self.get_tags(Name=rds_security_group_name)
        ))

        rds_subnet_group_name = 'dbsngDatabaseServer'
        rds_subnet_group = self.add_resource(rds.DBSubnetGroup(
            rds_subnet_group_name,
            DBSubnetGroupDescription='Private subnets for the RDS instances',
            SubnetIds=Ref(self.private_subnets),
            Tags=self.get_tags(Name=rds_subnet_group_name)
        ))

        rds_parameter_group = self.add_resource(rds.DBParameterGroup(
            'dbpgDatabaseServer',
            Family='postgres9.4',
            Description='Parameter group for the RDS instances',
            Parameters={'log_min_duration_statement': '500'}
        ))

        rds_database_name = 'DatabaseServer'
        rds_database = self.add_resource(rds.DBInstance(
            rds_database_name,
            AllocatedStorage=128,
            AllowMajorVersionUpgrade=False,
            AutoMinorVersionUpgrade=True,
            BackupRetentionPeriod=30,
            DBInstanceClass=Ref(self.rds_instance_type),
            DBName=Ref(self.rds_db_name),
            DBParameterGroupName=Ref(rds_parameter_group),
            DBSubnetGroupName=Ref(rds_subnet_group),
            Engine='postgres',
            EngineVersion='9.4.15',
            MasterUsername=Ref(self.rds_username),
            MasterUserPassword=Ref(self.rds_password),
            MultiAZ=True,
            PreferredBackupWindow='04:00-04:30',  # 12:00AM-12:30AM ET
            PreferredMaintenanceWindow='sun:04:30-sun:05:30',  # NOQA SUN 12:30AM-01:30AM ET
            StorageType='gp2',
            VPCSecurityGroups=[Ref(rds_security_group)],
            Tags=self.get_tags(Name=rds_database_name)
        ))

        return rds_database, rds_security_group

    def create_rds_cloudwatch_alarms(self, rds_database):
        self.add_resource(cloudwatch.Alarm(
            'alarmDatabaseServerCPUUtilization',
            AlarmDescription='Database server CPU utilization',
            AlarmActions=[Ref(self.notification_topic_arn)],
            Statistic='Average',
            Period=300,
            Threshold='75',
            EvaluationPeriods=1,
            ComparisonOperator='GreaterThanThreshold',
            MetricName='CPUUtilization',
            Namespace='AWS/RDS',
            Dimensions=[
                cloudwatch.MetricDimension(
                    'metricDatabaseServerName',
                    Name='DBInstanceIdentifier',
                    Value=Ref(rds_database)
                )
            ],
        ))

        self.add_resource(cloudwatch.Alarm(
            'alarmDatabaseServerDiskQueueDepth',
            AlarmDescription='Database server disk queue depth',
            AlarmActions=[Ref(self.notification_topic_arn)],
            Statistic='Average',
            Period=60,
            Threshold='10',
            EvaluationPeriods=1,
            ComparisonOperator='GreaterThanThreshold',
            MetricName='DiskQueueDepth',
            Namespace='AWS/RDS',
            Dimensions=[
                cloudwatch.MetricDimension(
                    'metricDatabaseServerName',
                    Name='DBInstanceIdentifier',
                    Value=Ref(rds_database)
                )
            ],
        ))

        self.add_resource(cloudwatch.Alarm(
            'alarmDatabaseServerFreeStorageSpace',
            AlarmDescription='Database server free storage space',
            AlarmActions=[Ref(self.notification_topic_arn)],
            Statistic='Average',
            Period=60,
            Threshold=str(int(5.0e+09)),  # 5GB in bytes
            EvaluationPeriods=1,
            ComparisonOperator='LessThanThreshold',
            MetricName='FreeStorageSpace',
            Namespace='AWS/RDS',
            Dimensions=[
                cloudwatch.MetricDimension(
                    'metricDatabaseServerName',
                    Name='DBInstanceIdentifier',
                    Value=Ref(rds_database)
                )
            ],
        ))

        self.add_resource(cloudwatch.Alarm(
            'alarmDatabaseServerFreeableMemory',
            AlarmDescription='Database server freeable memory',
            AlarmActions=[Ref(self.notification_topic_arn)],
            Statistic='Average',
            Period=60,
            Threshold=str(int(1.28e+08)),  # 128MB in bytes
            EvaluationPeriods=1,
            ComparisonOperator='LessThanThreshold',
            MetricName='FreeableMemory',
            Namespace='AWS/RDS',
            Dimensions=[
                cloudwatch.MetricDimension(
                    'metricDatabaseServerName',
                    Name='DBInstanceIdentifier',
                    Value=Ref(rds_database)
                )
            ],
        ))

    def create_elasticache_replication_group(self):
        elasticache_security_group_name = 'sgCacheCluster'
        elasticache_security_group = self.add_resource(ec2.SecurityGroup(
            elasticache_security_group_name,
            GroupDescription='Enables access to the cache cluster',
            VpcId=Ref(self.vpc_id),
            SecurityGroupIngress=[
                ec2.SecurityGroupRule(
                    IpProtocol='tcp', CidrIp=VPC_CIDR, FromPort=p, ToPort=p
                )
                for p in [REDIS]
            ],
            SecurityGroupEgress=[
                ec2.SecurityGroupRule(
                    IpProtocol='tcp', CidrIp=VPC_CIDR, FromPort=p, ToPort=p
                )
                for p in [REDIS]
            ],
            Tags=self.get_tags(Name=elasticache_security_group_name)
        ))

        elasticache_subnet_group = self.add_resource(ec.SubnetGroup(
            'ecsngCacheCluster',
            Description='Private subnets for the ElastiCache instances',
            SubnetIds=Ref(self.private_subnets)
        ))

        elasticache_parameter_group = self.add_resource(ec.ParameterGroup(
            'ecpgCacheCluster',
            CacheParameterGroupFamily='redis2.8',
            Description='Parameter group for the ElastiCache instances',
            Properties={'maxmemory-policy': 'allkeys-lru'}
        ))

        elasticache_group = self.add_resource(ec.ReplicationGroup(
            'CacheReplicationGroup',
            AutomaticFailoverEnabled=True,
            AutoMinorVersionUpgrade=True,
            CacheNodeType=Ref(self.elasticache_instance_type),
            CacheParameterGroupName=Ref(elasticache_parameter_group),
            CacheSubnetGroupName=Ref(elasticache_subnet_group),
            Engine='redis',
            EngineVersion='2.8.24',
            NotificationTopicArn=Ref(self.notification_topic_arn),
            NumCacheClusters=2,
            PreferredCacheClusterAZs=Ref(self.availability_zones),
            PreferredMaintenanceWindow='sun:05:00-sun:06:00',  # NOQA SUN 01:00AM-02:00AM ET
            ReplicationGroupDescription='Redis replication group',
            SecurityGroupIds=[Ref(elasticache_security_group)],
            SnapshotRetentionLimit=30,
            SnapshotWindow='04:00-05:00'  # 12:00AM-01:00AM ET
        ))

        return elasticache_group, elasticache_security_group

    def create_elasticache_cloudwatch_alarms(self, elasticache_cache_cluster):
        for index in [1, 2]:
            self.add_resource(cloudwatch.Alarm(
                'alarmCacheCluster{0:0>3}CPUUtilization'.format(index),
                AlarmDescription='Cache cluster CPU utilization',
                AlarmActions=[Ref(self.notification_topic_arn)],
                Statistic='Average',
                Period=300,
                Threshold='75',
                EvaluationPeriods=1,
                ComparisonOperator='GreaterThanThreshold',
                MetricName='CPUUtilization',
                Namespace='AWS/ElastiCache',
                Dimensions=[
                    cloudwatch.MetricDimension(
                        'metricCacheClusterName',
                        Name='CacheClusterId',
                        Value=Join('-',
                                   [Ref(elasticache_cache_cluster),
                                    '{0:0>3}'.format(index)])
                    )
                ],
            ))

            self.add_resource(cloudwatch.Alarm(
                'alarmCacheCluster{0:0>3}FreeableMemory'.format(index),
                AlarmDescription='Cache cluster freeable memory',
                AlarmActions=[Ref(self.notification_topic_arn)],
                Statistic='Average',
                Period=60,
                Threshold=str(int(5e+06)),  # 5MB in bytes
                EvaluationPeriods=1,
                ComparisonOperator='LessThanThreshold',
                MetricName='FreeableMemory',
                Namespace='AWS/ElastiCache',
                Dimensions=[
                    cloudwatch.MetricDimension(
                        'metricCacheClusterName',
                        Name='CacheClusterId',
                        Value=Join('-',
                                   [Ref(elasticache_cache_cluster),
                                    '{0:0>3}'.format(index)])
                    )
                ],
            ))

    def create_dns_records(self, rds_database, elasticache_group):
        self.add_resource(r53.RecordSetGroup(
            'dnsPrivateRecords',
            HostedZoneId=Ref(self.private_hosted_zone_id),
            RecordSets=[
                r53.RecordSet(
                    'dnsDatabaseServer',
                    Name=Join('', ['database.service.',
                                   Ref(self.private_hosted_zone_name), '.']),
                    Type='CNAME',
                    TTL='10',
                    ResourceRecords=[
                        GetAtt(rds_database, 'Endpoint.Address')
                    ]
                ),
                r53.RecordSet(
                    'dnsCacheServer',
                    Name=Join('', ['cache.service.',
                                   Ref(self.private_hosted_zone_name), '.']),
                    Type='CNAME',
                    TTL='10',
                    ResourceRecords=[
                        GetAtt(elasticache_group, 'PrimaryEndPoint.Address')
                    ]
                )
            ]
        ))

    def get_tags(self, **kwargs):
        """Helper method to return Troposphere tags + default tags

        Args:
          **kwargs: arbitrary keyword arguments to be used as tags
        """
        kwargs.update(self.default_tags)
        return Tags(**kwargs)
