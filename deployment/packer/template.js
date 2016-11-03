{
    "variables": {
        "version": "",
        "branch": "",
        "aws_region": "",
        "aws_ubuntu_ami": "",
        "stack_type": ""
    },
    "builders": [
        {
            "name": "icp-app",
            "type": "amazon-ebs",
            "region": "{{user `aws_region`}}",
            "availability_zone": "us-east-1a",
            "source_ami": "{{user `aws_ubuntu_ami`}}",
            "instance_type": "t2.large",
            "ssh_username": "ubuntu",
            "ami_name": "icp-app-{{timestamp}}-{{user `version`}}",
            "run_tags": {
                "PackerBuilder": "amazon-ebs"
            },
            "tags": {
                "Name": "icp-app",
                "Version": "{{user `version`}}",
                "Branch": "{{user `branch`}}",
                "Created": "{{ isotime }}",
                "Service": "Application",
                "Environment": "{{user `stack_type`}}"
            },
            "associate_public_ip_address": true
        },
        {
            "name": "icp-worker",
            "type": "amazon-ebs",
            "region": "{{user `aws_region`}}",
            "availability_zone": "us-east-1a",
            "source_ami": "{{user `aws_ubuntu_ami`}}",
            "instance_type": "t2.large",
            "ssh_username": "ubuntu",
            "ami_name": "icp-worker-{{timestamp}}-{{user `version`}}",
            "ami_block_device_mappings": [
                {
                    "device_name": "/dev/sdf",
                    "snapshot_id": "snap-4a764b4a",
                    "volume_type": "gp2",
                    "delete_on_termination": true
                }
            ],
            "run_tags": {
                "PackerBuilder": "amazon-ebs"
            },
            "tags": {
                "Name": "icp-worker",
                "Version": "{{user `version`}}",
                "Branch": "{{user `branch`}}",
                "Created": "{{ isotime }}",
                "Service": "Worker",
                "Environment": "{{user `stack_type`}}"
            },
            "associate_public_ip_address": true
        },
        {
            "name": "icp-monitoring",
            "type": "amazon-ebs",
            "region": "{{user `aws_region`}}",
            "availability_zone": "us-east-1a",
            "source_ami": "{{user `aws_ubuntu_ami`}}",
            "instance_type": "t2.large",
            "ssh_username": "ubuntu",
            "ami_name": "icp-monitoring-{{timestamp}}-{{user `version`}}",
            "run_tags": {
                "PackerBuilder": "amazon-ebs"
            },
            "tags": {
                "Name": "icp-monitoring",
                "Version": "{{user `version`}}",
                "Branch": "{{user `branch`}}",
                "Created": "{{ isotime }}",
                "Service": "Monitoring",
                "Environment": "{{user `stack_type`}}"
            },
            "associate_public_ip_address": true
        }
    ],
    "provisioners": [
        {
            "type": "shell",
            "inline": [
                "sleep 5",
                "sudo apt-get update -qq",
                "sudo apt-get install python-pip python-dev -y",
                "sudo pip install paramiko==1.16.0",
                "sudo pip install ansible==2.0.1.0",
                "sudo /bin/sh -c 'echo {{user `version`}} > /srv/version.txt'"
            ]
        },
        {
            "type": "ansible-local",
            "playbook_file": "ansible/app-servers.yml",
            "playbook_dir": "ansible",
            "inventory_file": "ansible/inventory/packer-app-server",
            "extra_arguments": [
                "--user 'ubuntu' --extra-vars 'app_deploy_branch={{user `version`}}'"
            ],
            "only": [
                "icp-app"
            ]
        },
        {
            "type": "ansible-local",
            "playbook_file": "ansible/workers.yml",
            "playbook_dir": "ansible",
            "inventory_file": "ansible/inventory/packer-worker-server",
            "extra_arguments": [
                "--user 'ubuntu' --extra-vars 'app_deploy_branch={{user `version`}}'"
            ],
            "only": [
                "icp-worker"
            ]
        },
        {
            "type": "ansible-local",
            "playbook_file": "ansible/monitoring-servers.yml",
            "playbook_dir": "ansible",
            "inventory_file": "ansible/inventory/packer-monitoring-server",
            "extra_arguments": [
                "--user 'ubuntu'"
            ],
            "only": [
                "icp-monitoring"
            ]
        }
    ]
}
