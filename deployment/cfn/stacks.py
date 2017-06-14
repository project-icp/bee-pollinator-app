from majorkirby import GlobalConfigNode

from vpc import VPC
from data_plane import DataPlane
from application import Application
from worker import Worker
from public_hosted_zone import PublicHostedZone

from boto import cloudformation as cfn

import ConfigParser
import sys


def get_config(icp_config_path, profile):
    """Parses a configuration file

    Arguments
    :param icp_config_path: Path to the config file
    :param profile: Config profile to read
    """
    icp_config = ConfigParser.ConfigParser()
    icp_config.optionxform = str
    icp_config.read(icp_config_path)

    try:
        section = icp_config.items(profile)
    except ConfigParser.NoSectionError:
        sys.stderr.write('There is no section [{}] in the configuration '
                         'file\n'.format(profile))
        sys.stderr.write('you specified. Did you specify the correct file?')
        sys.exit(1)

    return {k: v.strip('"').strip("'") for k, v in section}


def build_graph(icp_config, aws_profile, **kwargs):
    """
    Builds graphs for all of the ICP stacks
    Args:
      icp_config (dict): dictionary representation of `default.yml`
      aws_profile (str): name of AWS profile to use for authentication
    """

    if kwargs['stack_color'] is not None:
        icp_config['StackColor'] = kwargs['stack_color'].capitalize()

    global_config = GlobalConfigNode(**icp_config)
    vpc = VPC(globalconfig=global_config, aws_profile=aws_profile)
    data_plane = DataPlane(globalconfig=global_config, VPC=vpc,
                           aws_profile=aws_profile)
    application = Application(globalconfig=global_config, VPC=vpc,
                              DataPlane=data_plane,
                              aws_profile=aws_profile)
    worker = Worker(globalconfig=global_config, VPC=vpc,
                    DataPlane=data_plane, aws_profile=aws_profile)
    public_hosted_zone = PublicHostedZone(globalconfig=global_config,
                                          Application=application,
                                          aws_profile=aws_profile)

    return data_plane, application, worker, public_hosted_zone


def build_stacks(icp_config, aws_profile, **kwargs):
    """Trigger actual building of graphs"""
    data_plane_graph, application_graph, worker_graph, \
        public_hosted_zone_graph = build_graph(icp_config, aws_profile,
                                               **kwargs)
    data_plane_graph.go()

    if kwargs['stack_color'] is not None:
        application_graph.go()
        worker_graph.go()

    if kwargs['activate_dns']:
        public_hosted_zone_graph.go()


def destroy_stacks(icp_config, aws_profile, **kwargs):
    """Destroy stacks that are associated with stack_color"""
    region = icp_config['Region']
    stack_type = icp_config['StackType']
    stack_color = kwargs['stack_color']

    cfn_conn = cfn.connect_to_region(region, profile_name=aws_profile)
    stack_tag = ('StackType', stack_type)
    color_tag = ('StackColor', stack_color.capitalize())

    [stack.delete() for stack in cfn_conn.describe_stacks()
     if color_tag in stack.tags.items() and stack_tag in stack.tags.items()]
