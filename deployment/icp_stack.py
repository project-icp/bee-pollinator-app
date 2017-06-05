#!/usr/bin/env python
"""Commands for setting up the Bee Pollinator stack on AWS"""

import argparse
import os

from cfn.stacks import build_stacks, destroy_stacks, get_config
from ec2.amis import prune
from packer.driver import run_packer


current_file_dir = os.path.dirname(os.path.realpath(__file__))


def launch_stacks(icp_config, aws_profile, **kwargs):
    build_stacks(icp_config, aws_profile, **kwargs)


def remove_stacks(icp_config, aws_profile, **kwargs):
    destroy_stacks(icp_config, aws_profile, **kwargs)


def create_ami(icp_config, aws_profile, machine_type, **kwargs):
    run_packer(icp_config, machine_type, aws_profile=aws_profile)


def prune_amis(icp_config, aws_profile, machine_type, keep, **kwargs):
    prune(icp_config, machine_type, keep, aws_profile=aws_profile)


def main():
    """Parse args and run desired commands"""
    common_parser = argparse.ArgumentParser(add_help=False)
    common_parser.add_argument('--aws-profile', default='default',
                               help='AWS profile to use for launching stack '
                                    'and other resources')
    common_parser.add_argument('--icp-config-path',
                               default=os.path.join(current_file_dir,
                                                    'default.yml'),
                               help='Path to ICP stack config')
    common_parser.add_argument('--icp-profile', default='default',
                               help='ICP stack profile to use for launching '
                                    'stacks')

    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(title='Bee Pollinator Stack '
                                             'Commands')

    icp_stacks = subparsers.add_parser('launch-stacks',
                                       help='Launch ICP Stack',
                                       parents=[common_parser])
    icp_stacks.add_argument('--stack-color', type=str,
                            choices=['green', 'blue'],
                            default=None,
                            help='One of "green", "blue"')
    icp_stacks.add_argument('--activate-dns', action='store_true',
                            default=False,
                            help='Activate DNS for current stack color')
    icp_stacks.set_defaults(func=launch_stacks)

    icp_remove_stacks = subparsers.add_parser('remove-stacks',
                                              help='Remove ICP Stack',
                                              parents=[common_parser])
    icp_remove_stacks.add_argument('--stack-color', type=str,
                                   choices=['green', 'blue'],
                                   required=True,
                                   help='One of "green", "blue"')
    icp_remove_stacks.set_defaults(func=remove_stacks)

    icp_ami = subparsers.add_parser('create-ami', help='Create AMI for Model '
                                                       'My Watershed Stack',
                                    parents=[common_parser])
    icp_ami.add_argument('--machine-type', type=str,
                         nargs=argparse.ONE_OR_MORE,
                         choices=['icp-app', 'icp-worker',
                                  'icp-monitoring'],
                         default=None, help='Machine type to create AMI')
    icp_ami.set_defaults(func=create_ami)

    icp_prune_ami = subparsers.add_parser('prune-ami',
                                          help='Prune stale Model My '
                                               'Watershed AMIs',
                                          parents=[common_parser])
    icp_prune_ami.add_argument('--machine-type', type=str, required=True,
                               nargs=argparse.ONE_OR_MORE,
                               choices=['icp-app', 'icp-worker',
                                        'icp-monitoring'],
                               help='AMI type to prune')
    icp_prune_ami.add_argument('--keep', type=int, default=10,
                               help='Number of AMIs to keep')
    icp_prune_ami.set_defaults(func=prune_amis)

    args = parser.parse_args()
    icp_config = get_config(args.icp_config_path, args.icp_profile)
    args.func(icp_config=icp_config, **vars(args))

if __name__ == '__main__':
    main()
