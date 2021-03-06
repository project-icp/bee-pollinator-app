# Releases

## Release Branch

First, create a release branch for the version about to be released:

```bash
$ git flow release start X.Y.Z
$ git flow release publish X.Y.Z
```

Once published, disable the `develop` job in Jenkins, and enable the `release` job:

- http://civicci01.internal.azavea.com/view/icp/job/bee-pollinator-develop/
- http://civicci01.internal.azavea.com/view/icp/job/bee-pollinator-release/

Next, trigger a build using the "Build Now" link.

## Release AMIs

Once the `release` job completes successfully, it should kick off two additional jobs:

- http://civicci01.internal.azavea.com/view/icp/job/bee-pollinator-packer-app-and-worker/

Once those two jobs complete successfully, a `staging-deployment` job will be kicked off:

- http://civicci01.internal.azavea.com/view/icp/job/bee-pollinator-staging-deployment/

As that is happening, login to the Bee Pollinator staging AWS account and locate the newly created AMIs within the AWS console under:

> `EC2 > Images > AMIs`

If you cannot see columns for `Branch`, `Environment`, and `Service`, use the gear icon above the AMI listing to enable them.

## Release Testing

After the `staging-deployment` job completes, `staging.app.beescape.org` and `staging.app.pollinationmapper.org` should reflect the current release. Be sure to run any outstanding database migrations or data imports.

## AMI Promotion

Select one AMI for each `Service` built using the `release/X.Y.Z` branch. Once selected, use the `Tags` tab to `Add/Edit Tags` for the `Environment` key. Ensure that its value is changed from `Staging` to `Production`.

## Dark Stack Launch

Ensure that the `production` section of `default.yml` reflects the desired state of your new stack (instance types, instance counts, etc.). Then, launch a new stack using the opposite color that is currently deployed:

```bash
$ ./icp_stack.py launch-stacks --aws-profile icp-prd \
                               --icp-config-path default.yml \
                               --icp-profile production \
                               --stack-color blue
```

This will launch a new Application`, and `Worker` stack namespaced by `stack-color`.

## Database Snapshot

Before applying any outstanding migrations, take a snapshot of the RDS database using the RDS console. Ensure that it is labeled with something that represents the current release.

After the snapshot creation process is complete, execute any outstanding migrations using the instructions in `MIGRATIONS.md`.

## Test via Elastic Load Balancer (ELB) endpoint; Cut over DNS

Using the newly created ELB endpoint, try to interact with the dark application stack:

> `EC2 > Load Balancing > Load Balancers`

If everything looks good, use the following command to cut over DNS to the new ELB endpoint:

```bash
$ ./icp_stack.py launch-stacks --aws-profile icp-prd \
                               --icp-config-path default.yml \
                               --icp-profile production \
                               --stack-color blue \
                               --activate-dns
```

Within 60 seconds, `app.beescape.org` and `app.pollinationmapper.org` should reflect the current release.

## Repository & Jenkins Cleanup

Disable the `release` job in Jenkins, and enable the `develop` job:

- http://civicci01.internal.azavea.com/view/icp/job/bee-pollinator-develop/
- http://civicci01.internal.azavea.com/view/icp/job/bee-pollinator-release/

Execute the following commands to reconcile the release branch:

```bash
$ git flow release finish X.Y.Z
$ git push origin develop
$ git checkout master && git push origin master
$ git push --tags
```

## Remove Old Stack

Lastly, use the following command to remove the now dark stack:

```bash
$ ./icp_stack.py remove-stacks --aws-profile icp-prd \
                               --icp-config-path default.yml \
                               --icp-profile production \
                               --stack-color green
```
