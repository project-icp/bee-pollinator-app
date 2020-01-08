# bee-pollinator

## URLs

Staging:

- https://staging.app.beescape.org
- https://staging.app.pollinationmapper.org

Production:

- https://app.beescape.org
- https://app.pollinationmapper.org

## Local Development

A combination of Vagrant 2.1+ and Ansible 2.6+ is used to setup the development environment for this project. Running `vagrant box update` is recommended so you're on the latest version of the `ubuntu/trusty64` box.

The project consists of the following virtual machines:

- `app`
- `services`
- `worker`

The `app` virtual machine contains an instance of the Django application, `services` contains:

- PostgreSQL
- Redis
- Logstash
- Kibana
- Graphite
- Statsite

`worker` contains:

- Celery

### Getting Started

First, ensure that you have a set of Amazon Web Services (AWS) credentials with access to Azavea's pre-processed NLCD data set. This setup generally needs to happen on the virtual machine host using the [AWS CLI](https://aws.amazon.com/cli/):

```bash
$ aws configure --profile icp-stg
```

Next, ensure you have the CDL raster data available to the worker machine.  This can be done, on your host:
* Get the file `cdl_reclass_lzw_5070.tif` off of a USB stick
* Copy the file to `/opt/icp-crop-data/cdl_reclass_lzw_5070.tif`, or
* Add the `cdl_reclass_lzw_5070.tif` file at a directory of your choosing, and set an environment variable `ICP_DATA_DIR` to it.

Then, use the following command to bring up a local development environment:

```bash
$ vagrant up
```

The application will now be running at [http://localhost:8000](http://localhost:8000).

After significant changes, you may need to run the following two commands to apply database migrations and rebuild JavaScript assets:

```bash
$ ./scripts/manage.sh migrate
$ ./scripts/bundle.sh
```

To load or reload data, from an `app` server, run

```bash
$ /vagrant/scripts/aws/setupdb.sh
```

Note that if you receive out of memory errors while loading the data, you may want to increase the RAM on your `services` VM (1512 MB may be all that is necessary).

See debug messages from the web app server:

```bash
$ ./scripts/debugserver.sh
```

Watch the JavaScript and SASS files for changes:

```bash
$ ./scripts/bundle.sh --debug --watch
```

When creating new JavaScript or SASS files, you may need to stop and restart the bundle script.

If you add a JS dependency and want it to be included in the `vendor.js` bundle, you will need to update the `JS_DEPS` array in `bundle.sh` accordingly.

If changes were made to the one of the VM's configuration or requirements since the last time you provisioned, you'll need to reprovision.

```bash
$ vagrant provision <VM name>
```

After provisioning is complete, you can execute Django management commands with:

```bash
$ ./scripts/manage.sh test
```

**Note**: If you get an error that resembles the following, try logging into the `app` virtual machine again for the group permissions changes to take effect:

```
envdir: fatal: unable to switch to directory /etc/icp.d/env: access denied
```

### Ports

The Vagrant configuration maps the following host ports to services running in the virtual machines.

Service                | Port | URL
---------------------- | -----| ------------------------------------------------
Django Web Application | 8000 | [http://localhost:8000](http://localhost:8000)
Graphite Dashboard     | 8080 | [http://localhost:8080](http://localhost:8080)
Kibana Dashboard       | 5601 | [http://localhost:5601](http://localhost:5601)
PostgreSQL             | 5432 | `psql -h localhost`
Redis                  | 6379 | `redis-cli -h localhost 6379`
Testem                 | 7357 | [http://localhost:7357](http://localhost:7357)

### Caching

In order to speed up things up, you may want to consider leveraging the `vagrant-cachier` plugin. If installed, it is automatically used by Vagrant.

### Test Mode

In order to run the app in test mode, which simulates the production static asset bundle, reprovision with `VAGRANT_ENV=TEST vagrant provision`.

### Testing

Run all the tests:

```bash
$ ./scripts/test.sh
```

##### Python

To run all the tests on the Django app:

```bash
$ ./scripts/manage.sh test
```

Or just for a specific app:

```bash
$ ./scripts/manage.sh test apps.app_name.tests
```

More info [here](https://docs.djangoproject.com/en/1.8/topics/testing/).

##### JavaScript

When creating new tests or debugging old tests, it may be easier to open the testem page, which polls for changes to the test bundle and updates the test state dynamically.

First, start the testem process.

```bash
$ ./scripts/testem.sh
```
Then view the test runner page at [http://localhost:7357](http://localhost:7357).

To enable livereload, [download the browser extension](http://livereload.com/extensions/)
and start the livereload server with the following command:

```bash
./scripts/npm.sh run livereload
```

### Bundling static assets

The `bundle.sh` script runs browserify, node-sass, and othe pre-processing
tasks to generate static assets.

The vendor bundle is not created until you run this command with the
`--vendor` flag. This bundle will be very large if combined with `--debug`.

Test bundles are not created unless the `--tests` flag is used.

In general, you should be able to combine `--vendor`, `--tests`, `--debug`,
and `--watch` and have it behave as you would expect.

You can also minify bundles by using the `--minify` flag. This operation is
not fast, and also disables source maps.

The `--list` flag displays module dependencies and does not actually generate
any bundles. It doesn't make sense to combine this with `--watch`.
This flag is for troubleshooting purposes only.

    > bundle.sh -h
    bundle.sh [OPTION]...

    Bundle JS and CSS static assets.

     Options:
      --watch      Listen for file changes
      --debug      Generate source maps
      --minify     Minify bundles (**SLOW**); Disables source maps
      --tests      Generate test bundles
      --list       List browserify dependencies
      --vendor     Generate vendor bundle and copy assets
      -h, --help   Display this help text

### Adding JS dependencies

To add a new JS depenency, update the `JS_DEPS` array in `bundle.sh`, and `package.json` accordingly.
Because our dependencies are shrinkwrapped, follow the [instructions](https://docs.npmjs.com/cli/shrinkwrap#building-shrinkwrapped-packages) for adding a dependency to a shrinkwrapped package.
Rebuild the vendor bundle using `./scripts/bundle.sh --vendor`.
`npm` commands can be run using `./scripts/npm.sh`.

### Updating the crop yield model

The latest crop yield model is installed every time the worker is provisioned:

`vagrant provision worker`

If you make changes to the model, and would like to reinstall it on the app without provisioning the worker, you can run:

`vagrant ssh worker -c "cd /opt/app/pollinator && sudo python setup.py install"`


## Updating the Crop Data Layer (CDL)

### Updating Data
- If you received a new `cdl_data.csv`, it should go in `src/icp/pollinator/src/pollinator/data/cdl_data.csv`
- If you received a new raster, it should go in `/opt/icp-crop-data/cdl_5070.tif`

1. Navigate on the worker VM to the processing scripts

    ```
    vagrant ssh worker
    cd /vagrant/src/icp/pollinator/src/pollinator/reclass/
    ```
1. Group the raw CDL CSV `ID` values together based on the CSV's `Attributes` column. To keep a particular crop distinct from its attribute group, change that record's `Attribute` value. For example, `Almonds` was initially part of `Orchard`, but was given a new `Attribute` of `Almonds` so that it would have a distinct row in the output group CSV

    `python group_cdl_data.py`
1. Copy the resulting file `cdl_data_grouped.csv` into `src/icp/pollinator/src/pollinator/data/`
1. Reclassify the raster to use the newly grouped CSV values

    `python reclassify_cdl.py`
1. Write the grouped CSV values to `cropTypes.json` for the frontend's lookup

    `python write_crop_type_json.py`
1. So that the legend in the app doesn't have extraneous entries, remove any enhancement/cover crop rows from `cropTypes.json`. They aren't part of the actual raster. Move the file to `src/icp/js/src/core/cropTypes.json`

1. Update the `value` keys (crop ids) in `/src/icp/js/src/core/modificationConfig.json` to their most current values in `cdl_data_group.csv`/`cropTypes.json`

1. Update the app's colors and SVGs

    `python /vagrant/scripts/colors/update.py`
1. If you are authorized to update the staging/production accounts, you can update the deployed raster by logging into AWS and completing the following:
   - Create a new volume
   - Create a new EC2 instance, and mount the volume
   - Upload the updated raster to the volume
   - Take a snapshot of the volume
   - Replace the worker `snapshot_id` in `deployment/packer/template.js` with the new snapshot's id
   - Clean up by destroying the EC2 instance you created

### Updating Crop Colors

1. Update the desired RGB crop colors in `src/icp/pollinator/src/pollinator/reclass/cdl_colormap.py`
2. To recolor the raster without running the reclassify script over again

    ```
    vagrant ssh worker
    cd /vagrant/src/icp/pollinator/src/pollinator/reclass/
    python recolor_cdl.py
    ```
3. Update the app's colors and SVGs

    `python /vagrant/scripts/colors/update.py`


# Beekeepers App

Beekeepers is a separate front-end app that takes advantage of the API infrastructure of the Pollination Mapper, but uses a new, modern tech stack. Discussion about its architecture can be found [here](./doc/phase-2/000_project_architecture_adr.md).

The app can be viewed at [http://localhost:8000/?beekeepers](http://localhost:8000/?beekeepers).

## AWS Credentials
Raster data used by Beekeeper is stored and accessed from a private s3 bucket. To authenticate your requests, get your own IAM credentials and add them under an `icp-bees` profile to `~/.aws/credentials`. Ensure your `~/.aws/credentials` file has at least read permissions, else run `chmod -R 644 ~/.aws`. Provision your VM to mount the AWS credentials with Ansible.

To build the Beekeepers App, run:

```bash
$ ./scripts/beekeepers.sh build
```

For development with hot module reloading enabled, run:

```bash
$ ./scripts/beekeepers.sh start
```

Now any changes made to the front-end within `src/icp/apps/beekeepers` will be reflected immediately.

**Note**: After running `start`, `build` must be run again to enable the front-end. This is because the template reads the `apps/beekeepers/.webpack.stats.json` file to decide which JavaScript files to include, which are generated and stored in the static files directory with `build`. However, `start` serves those files from its own port, which is no longer active when it is shut down, so we must run `build` again to generate the static files.

The [`beekeepers.sh`](./scripts/beekeepers.sh) script just SSH's in to the `app` VM and runs [`yarn.sh`](./src/icp/apps/beekeepers/yarn.sh), so it can take any `yarn` parameters.

## Apiary Score raster layers
The raster data layers read by the application are hosted in the icp-bees AWS account and
are used by dev, staging and production (there is only read-only access). The data layers
are provided in pairs, one each at 3km and 5km focal operations. Additionally, each layer
is provided per state and the file naming scheme represents this as:

`[STATE_ABBR]_[INDICATOR]_[FORAGE_RADIUS].tif`

This results in files named like `PA_nesting_3km.tif`.

In order to support multiple states that come as discrete files, a VRT per layer/radius pair
has been created using the following steps:

```bash
gdalbuildvrt nesting_3km.vrt PA_nesting_3km.tif IL_nesting_3km.tif
```

A convenience script has been added to `scripts/make-vrts.sh` which contains the `gdalbuildvrt`
commands used to generate the existing VRTs.  It can be modified to regenerate
with additional states in the future.
Once a VRT has been created for each layer/radius, both VRT and tifs are uploaded
to the data bucket under a folder indicating 3km or 5km.
