# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.require_version ">= 2.1"

ANSIBLE_GROUPS = {
  "app-servers" => [ "app" ],
  "services" => [ "services" ],
  "workers" => [ "worker" ],
  "monitoring-servers" => [ "services" ],
}

if !ENV["VAGRANT_ENV"].nil? && ENV["VAGRANT_ENV"] == "TEST"
  ANSIBLE_ENV_GROUPS = {
    "test:children" => [
      "app-servers", "services", "workers",
    ]
  }
  VAGRANT_NETWORK_OPTIONS = { auto_correct: true }
else
  ANSIBLE_ENV_GROUPS = {
    "development:children" => [
      "app-servers", "services", "monitoring-servers", "workers",
    ]
  }
  VAGRANT_NETWORK_OPTIONS = { auto_correct: false }
end

ANSIBLE_VERSION = "2.8.*"

Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-16.04"

  # Wire up package caching:
  if Vagrant.has_plugin?("vagrant-cachier")
    config.cache.scope = :machine
  end

  config.vm.define "services" do |services|
    services.vm.hostname = "services"
    services.vm.network "private_network", ip: ENV.fetch("ICP_SERVICES_IP", "33.33.34.30")
    services.vm.synced_folder "~/.aws", "/home/vagrant/.aws"

    # Graphite Web
    services.vm.network "forwarded_port", **{
      guest: 8080,
      host: 8080
    }.merge(VAGRANT_NETWORK_OPTIONS)
    # Kibana
    services.vm.network "forwarded_port", **{
      guest: 5601,
      host: 5601
    }.merge(VAGRANT_NETWORK_OPTIONS)
    # PostgreSQL
    services.vm.network "forwarded_port", **{
      guest: 5432,
      host: 5432
    }.merge(VAGRANT_NETWORK_OPTIONS)
    # Redis
    services.vm.network "forwarded_port", **{
      guest: 6379,
      host: 6379
    }.merge(VAGRANT_NETWORK_OPTIONS)

    services.vm.provider "virtualbox" do |v|
      v.memory = 1024
    end

    services.vm.provision "ansible_local" do |ansible|
      ansible.compatibility_mode = "2.0"
      ansible.install = true
      ansible.install_mode = "pip_args_only"
      ansible.pip_install_cmd = "curl https://bootstrap.pypa.io/pip/2.7/get-pip.py | sudo python"
      ansible.pip_args = "ansible==#{ANSIBLE_VERSION}"
      ansible.playbook = "deployment/ansible/services.yml"
      ansible.galaxy_role_file = "deployment/ansible/roles.yml"
      ansible.galaxy_roles_path = "deployment/ansible/roles"
      ansible.galaxy_command = "sudo pip install urllib3[secure]==1.22.* --ignore-installed" \
                               " && ansible-galaxy install --role-file=%{role_file} --roles-path=%{roles_path} --force"
      ansible.groups = ANSIBLE_GROUPS.merge(ANSIBLE_ENV_GROUPS)
    end
  end

  config.vm.define "worker" do |worker|
    worker.vm.hostname = "worker"
    worker.vm.network "private_network", ip: ENV.fetch("ICP_WORKER_IP", "33.33.34.20")

    worker.vm.synced_folder "src/icp", "/opt/app/"

    worker.vm.provider "virtualbox" do |v|
      v.memory = 2048
    end

    if ENV["VAGRANT_ENV"].nil? || ENV["VAGRANT_ENV"] != "TEST"
      data_dir = ENV['ICP_DATA_DIR'] || "/opt/icp-crop-data"
      worker.vm.synced_folder data_dir, "/opt/icp-crop-data"
    end

    worker.vm.provision "ansible_local" do |ansible|
      ansible.compatibility_mode = "2.0"
      ansible.install = true
      ansible.install_mode = "pip_args_only"
      ansible.pip_args = "ansible==#{ANSIBLE_VERSION}"
      ansible.pip_install_cmd = "curl https://bootstrap.pypa.io/pip/2.7/get-pip.py | sudo python"
      ansible.playbook = "deployment/ansible/workers.yml"
      ansible.galaxy_role_file = "deployment/ansible/roles.yml"
      ansible.galaxy_roles_path = "deployment/ansible/roles"
      ansible.galaxy_command = "sudo pip install urllib3[secure]==1.22.* --ignore-installed" \
                               " && ansible-galaxy install --role-file=%{role_file} --roles-path=%{roles_path} --force"
      ansible.groups = ANSIBLE_GROUPS.merge(ANSIBLE_ENV_GROUPS)
      ansible.extra_vars = {
        services_ip: ENV.fetch("ICP_SERVICES_IP", "33.33.34.30")
      }
    end

    worker.vm.provision "shell", inline: "service celeryd restart >> /dev/null 2>&1", run: "always"
  end

  config.vm.define "app" do |app|
    app.vm.hostname = "app"
    app.vm.network "private_network", ip: ENV.fetch("ICP_APP_IP", "33.33.34.10")

    app.vm.synced_folder "~/.aws", "/home/vagrant/.aws", type: "rsync"
    app.vm.synced_folder "~/.aws", "/var/lib/icp/.aws", type: "rsync"

    if Vagrant::Util::Platform.windows? || Vagrant::Util::Platform.cygwin?
      app.vm.synced_folder "src/icp", "/opt/app/", type: "rsync", rsync__exclude: ["node_modules/", "apps/"]
      app.vm.synced_folder "src/icp/apps", "/opt/app/apps"
    else
      app.vm.synced_folder "src/icp", "/opt/app/"
    end

    # Django via Nginx/Gunicorn
    app.vm.network "forwarded_port", **{
      guest: 80,
      host: 8000
    }.merge(VAGRANT_NETWORK_OPTIONS)
    # Livereload server
    app.vm.network "forwarded_port", **{
      guest: 35729,
      host: 35729,
    }.merge(VAGRANT_NETWORK_OPTIONS)
    # Testem server
    app.vm.network "forwarded_port", **{
      guest: 7358,
      host: 7358
    }.merge(VAGRANT_NETWORK_OPTIONS)

    app.ssh.forward_x11 = true

    app.vm.provider "virtualbox" do |v|
      v.memory = 1024
    end

    app.vm.provision "ansible_local" do |ansible|
      ansible.compatibility_mode = "2.0"
      ansible.install = true
      ansible.install_mode = "pip_args_only"
      ansible.pip_install_cmd = "curl https://bootstrap.pypa.io/pip/2.7/get-pip.py | sudo python"
      ansible.pip_args = "ansible==#{ANSIBLE_VERSION}"
      ansible.playbook = "deployment/ansible/app-servers.yml"
      ansible.galaxy_role_file = "deployment/ansible/roles.yml"
      ansible.galaxy_roles_path = "deployment/ansible/roles"
      ansible.galaxy_command = "sudo pip install urllib3[secure]==1.22.* --ignore-installed" \
                               " && ansible-galaxy install --role-file=%{role_file} --roles-path=%{roles_path} --force"
      ansible.groups = ANSIBLE_GROUPS.merge(ANSIBLE_ENV_GROUPS)
      ansible.extra_vars = {
        services_ip: ENV.fetch("ICP_SERVICES_IP", "33.33.34.30")
      }
    end
  end
end
