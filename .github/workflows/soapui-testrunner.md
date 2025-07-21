# SoapUI TestRunner
Runs tests in a SoapUI and generates a report with the test results.

The application/environment under test can be brought up with a 'Setup' script and cleaned up afterwards with a 'Teardown' script.
After the 'Setup' script has been executed, the workflow will wait for the container's health endpoint to report 'Healthy'. Once 
the container is heathy, the SoapUI TestRunner will be executed.

Warning: Is is very strongly recommended to have the SoapUI project file at the root of the project. SoapUI uses the project 
file location as project root. Placing it in a subfolder will require all relative paths to resource within the project to 
offset back to the actual project root.

### Properties
Optionally a .properties file can be provided to 
set CI specific property values. Properties should be formatted as a <key>=<value> per line. Properties will be loaded 
as 'Global' properties, which can be references within the project by `${<key>}`, `${#Global#<key>}` or `${#System#<key>}`.

### Setup & Teardown
A 'Setup' and 'Teardown's script need to be provided to bring up the application/environment under test and to clean it 
up afterwards. Both scripts need to be non-blocking, so run in detached mode when using Docker for example. 

When using Docker it is recommended to create a Docker Compose file for CI/CD. This can either be a stand-alone Docker Compose 
for CI/CD or an override Docker Compose file that is used together with with a the development environment Docker Compose. 

Warning: It is very important that the Docker image built in CI is used. The 'Setup' script should never build the Docker Image.
The environment variables `IMAGE_ID` and/or `IMAGE_TAG` are available in the 'Setup' script depending on which one is provided to
this workflow. Alternatively `<organisation>/<image-name>` without a version should resolve to the only image with that name that
is available in the CI/CD runner. The last method is somewhat less reliable, as it will simply pull the latest already released image 
from the Image Repository if the Docker image built in CI is not made available to this job for some reason.

In the 'Teardown' script, the environment variable `CONTAINER_ID` is made available for stopping/cleaning up the used container afterwards.

The most reliable way to ensure the Docker Image from CI is used:

Docker Compose:
```yaml
image: ${IMAGE_ID:-${IMAGE_TAG:-<organisation>/<image-name>}} 
```

Docker:
```bash
docker run -d ${IMAGE_ID:-${IMAGE_TAG:-<organisation>/<image-name>}} 
```

Example 'Setup' scripts:

Docker Compose:
```bash
  docker compose -f 'compose.frank.yaml' -f 'compose.frank.ci.yaml' up -d
```

Docker:
```bash
  docker run -d ${IMAGE_ID:-${IMAGE_TAG:-<organisation>/<image-name>}}
```

Example 'Teardown' scripts:

Docker Compose:
```bash
  docker compose -f 'compose.frank.yaml' -f 'compose.frank.ci.yaml' down
```

Docker:
```bash
  docker stop ${IMAGE_ID:-${IMAGE_TAG:-<organisation>/<image-name>}}
```

### Sub-workflows/actions

## Usage
```yaml
- uses: wearefrank/ci-cd-templates/.github/workflows/soapui-testrunner@1
  with:
    # Name of the build artifact uploaded in a previous job that contains the exported Tarball of the built Docker Image.
    #
    # When loading the image from a Tarball the `image-tarball-file` also needs to be provided.
    image-build-artifact-name: 'build-docker-image'

    # Path and filename of exported Docker Image Tarball uploaded in a previous job.
    #
    # When loading the image from a Tarball the `image-build-artifact-name` also needs to be provided.
    image-tarball-file: 'image.tar'

    # Image id of the newly built Docker Image in CI. This is the most reliable way to make sure the 
    # correct Docker Image is used. This usually returned as output variable from a Docker build job.
    #
    # Only one of `image-id` or `image-name` is required, but both are allowed.
    image-id: 'sha256:667d08a5e18f23330da019bcdc9ac0a3c61b713a68943d9c503b6cfd7e082074'

    # Image name of the newly built Docker Image in CI. This needs to be in the format `<organisation>/<image>` 
    # without a version. This is used in a `docker ps --latest -aqf ancestor=<image-name> --no-trunc` to obtain
    # the container id of the application under test.
    #
    # Only one of `image-id` or `image-name` is required, but both are allowed.
    image-name: 'wearefrank/zaakbrug'

    # A 'Setup' script to bring up the application/environment under test. The script must be non-blocking.
    #
    # Examples:
    # Docker Compose(with `service.image: ${IMAGE_ID:-${IMAGE_TAG:-<organisation>/<image-name>}}`):
    # ```bash
    #   docker compose -f 'compose.frank.yaml' -f 'compose.frank.ci.yaml' up -d
    # ```
    # Docker:
    # ```bash
    #   docker run -d ${IMAGE_ID:-${IMAGE_TAG:-<organisation>/<image-name>}}
    # ```
    #
    # Warning: It is very important that the Docker image built in CI is used. The 'Setup' script should never build the Docker Image.
    # The environment variables `IMAGE_ID` and/or `IMAGE_TAG` are available in the 'Setup' script depending on which one is provided to
    # this workflow. Alternatively `<organisation>/<image-name>` without a version should resolve to the only image with that name that
    # is available in the CI/CD runner.
    setup-script: |
      docker compose -f compose.frank.yaml -f compose.frank.ci.yaml up -d

    # A 'Teardown' script to stop and cleanup up the application/environment under test. The script must be non-blocking.
    #
    # The environment variable `CONTAINER_ID` is made available for stopping/cleaning up the used container afterwards.
    #
    # Examples:
    # Docker Compose:
    # ```bash
    #   docker compose -f compose.frank.yaml -f compose.frank.ci.yaml down -v
    # ```
    # Docker:
    # ```bash
    #   docker stop ${IMAGE_ID:-${IMAGE_TAG:-<organisation>/<image-name>}}
    # ```
    teardown-script: |
      docker compose -f 'compose.frank.yaml' -f 'compose.frank.ci.yaml' down -v

    # Absolute path to project folder.
    #
    # Default: ${PWD}
    project-dir: '${PWD}'

    # Filename of the SoapUI project file.
    #
    # Warning: Is is very strongly recommended to have the SoapUI project file at the root of the project.
    soapui-project: 'soapui-project.xml'

    # Directory relative to project directory for writing test reports to.
    #
    # Default: <project-dir>/soapui-reports
    reports-dir: 'soapui-reports'

    # Path to optional properties file relative to the project folder. Properties should be formatted as a <key>=<value> per line.
    # Properties will be loaded as 'Global' properties, which can be references within the project by `${<key>}`, `${#Global#<key>}` or `${#System#<key>}`.
    #
    # Default: <project-dir>/soapui.ci.properties
    properties-file: 'soapui.ci.properties'

    # Command-line option arguments for SoapUI. '-f' is already provided by `reports-dir`.
    # Refer to [TestRunner Command-Line Arguments](https://www.soapui.org/docs/test-automation/running-from-command-line/functional-tests/)
    # for all the available arguments.
    #
    # Note: Many arguments, in particular report format related arguments, seem to not work.
    # Default: -a -A -j -r
    soapui-cmd-options-args: '-a -A -j -r'

    # SoapUI version.
    #
    # Default: latest
    soapui-version: 'latest'

    # When 'true', the SoapUI reports will be uploaded as a GitHub Artifact
    #
    # Default: true
    upload-reports-artifact: true

    # Name of the GitHub Artifact the SoapUI reports should be uploaded under.
    #
    # Default: reports-soapui-testreports
    reports-artifact-name: 'reports-soapui-testreports'
```

## Scenario's
 [Run SoapUI TestRunner Against Test Environment With Docker Compose](#run-soapui-testrunner-against-test-environment-with-docker-compose)

### Run SoapUI TestRunner Against Test Environment With Docker Compose
```yaml
ci:
  uses: wearefrank/ci-cd-templates/.github/workflows/ci-generic.yml@1
  secrets:
    token: ${{ secrets.GITHUB_TOKEN }}
  with:
    version: 'pr-x'
    docker-image-repo: 'wearefrank'
    docker-image-name: 'zaakbrug'
    upload-sarif-to-security: false
    run-frank-till-healthy-enabled: false

soapui-testrunner:
  uses: wearefrank/ci-cd-templates/.github/workflows/soapui-testrunner.yml@1
  needs:
    - ci
  secrets:
    token: ${{ secrets.GITHUB_TOKEN }}
  with:
    soapui-project: 'soapui-project.xml'
    image-id: ${{needs.ci.outputs.image-id}}
    setup-script: |
      docker compose -f compose.frank.yaml -f compose.frank.ci.yaml -f compose.frank.postgres.yaml up -d
    teardown-script: |
      docker compose -f compose.frank.yaml -f compose.frank.ci.yaml -f compose.frank.postgres.yaml down -v
```