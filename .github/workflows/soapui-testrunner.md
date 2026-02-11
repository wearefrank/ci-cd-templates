# SoapUI TestRunner
Runs tests in a SoapUI and generates a report with the test results.

The application/environment under test can be brought up with a 'Setup' script and cleaned up afterwards with a 'Teardown' script.
After the 'Setup' script has been executed, the workflow will wait for the container's health endpoint to report 'Healthy'. Once the container is heathy, the SoapUI TestRunner will be executed.

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

Warning: It is very important that the Docker image built in CI is used. The 'Setup' script should never build the Docker Image. The environment variables `IMAGE_ID` and/or `IMAGE_REF` are available in the 'Setup' script depending on which one(s) is/are provided to this workflow. "image-ref" with a digest is recommended to ensure the correct image is used.

In the 'Teardown' script, the environment variables `CONTAINER_ID`, `IMAGE_ID` and/or `IMAGE_REF` are made available for stopping/cleaning up the used container afterwards.

The most reliable way to ensure the Docker Image from CI is used:

Docker Compose:
```yaml
image: ${IMAGE_ID:-${IMAGE_REF:-<registry>/<organisation>/<image-name>}} 
```

Docker:
```bash
docker run -d ${IMAGE_ID:-${IMAGE_REF:-<registry>/<organisation>/<image-name>}} 
```

Example 'Setup' scripts:

Docker Compose:
```bash
  docker compose -f 'compose.frank.yaml' -f 'compose.frank.ci.yaml' up -d
```

Docker:
```bash
  docker run -d ${IMAGE_ID:-${IMAGE_REF:-<registry>/<organisation>/<image-name>}}
```

Example 'Teardown' scripts:

Docker Compose:
```bash
  docker compose -f 'compose.frank.yaml' -f 'compose.frank.ci.yaml' down -v
```

Docker:
```bash
  docker stop ${CONTAINER_ID}
  docker rm --volumes ${CONTAINER_ID}
```

## Usage
```yaml
- uses: wearefrank/ci-cd-templates/.github/workflows/soapui-testrunner@1
  secrets:
    # GitHub token to be used. The default '${{ secrets.GITHUB_TOKEN }}' or '${{ secrets.GH_TOKEN }}' is enough.
    token: ${{ secrets.GITHUB_TOKEN }}

    # Username for the registry.
    # Only required when `image-artifact-backend: 'registry'`.
    # Default: GitHub actor username (github.actor).
    registry-username: ${{ secrets.registry-username }}

    # Token for the registry.
    # Only required when `image-artifact-backend: 'registry'`.
    registry-token: ${{ secrets.registry-token }}
  with:
    # The method used for sharing the image artifact between jobs.
    # Options: 'gh-artifacts', 'registry'
    # Default: 'registry'
    image-artifact-backend: 'registry'

    # Name of the artifact uploaded to GitHub Actions Storage, that contains the exported Docker Image Tarball.
    # Only required when `image-artifact-backend: 'gh-artifacts'`.
    # Default: 'build-docker-image'
    image-build-artifact-name: 'build-docker-image'

    # Path and filename of the exported Docker Image Tarball, that was uploaded to GitHub Actions Storage.
    # Only required when `image-artifact-backend: 'gh-artifacts'`.
    # Default: 'image.tar'
    image-tarball-file: 'image.tar'

    # Absolute path to project folder.
    # Default: ${PWD}
    project-dir: '${PWD}'

    # Filename of the SoapUI project file.
    # Warning: It is very strongly recommended to have the SoapUI project file at the root of the project.
    soapui-project: 'soapui-project.xml'

    # Directory relative to project directory for writing test reports to.
    # Default: soapui-reports
    reports-dir: 'soapui-reports'

    # Path to an optional properties file relative to the project folder. Properties should be formatted as a <key>=<value> per line.
    # Properties will be loaded as 'Global' properties, which can be references within the project by `${<key>}`, `${#Global#<key>}` or `${#System#<key>}`.
    # Default: soapui.ci.properties
    properties-file: 'soapui.ci.properties'

    # Command-line option arguments for SoapUI. '-f' is already provided by `reports-dir`.
    # Refer to [TestRunner Command-Line Arguments](https://www.soapui.org/docs/test-automation/running-from-command-line/functional-tests/)
    # for all the available arguments.
    # Note: Many arguments, in particular report format related arguments, seem to not work.
    # Default: -a -A -j -r
    soapui-cmd-options-args: '-a -A -j -r'

    # SoapUI version.
    # Default: latest
    soapui-version: 'latest'

    # Image registry (e.g. ghcr.io, docker.io).
    # Default: 'ghcr.io'
    image-registry: 'ghcr.io'

    # Image id of the application under test.
    # Note: An image id is the hash of the local image json configuration and may differ across environments and runs.
    image-id: 'sha256:667d08a5e18f23330da019bcdc9ac0a3c61b713a68943d9c503b6cfd7e082074'

    # Image reference of the application under test according to the [OCI Image Reference Format](https://docs.docker.com/reference/compose-file/services/#image) as `[<registry>/][<project>/]<image>[:<tag>|@<digest>]`.
    # For example: 'ghcr.io/wearefrank/zaakbrug:@sha256:667d08a5e18f23330da019bcdc9ac0a3c61b713a68943d9c503b6cfd7e082074'.
    # Warning: Using `image-ref` without a digest could resolve to an already released image if the CI built image is not available in the local Docker engine.
    image-ref: 'ghcr.io/wearefrank/zaakbrug:@sha256:667d08a5e18f23330da019bcdc9ac0a3c61b713a68943d9c503b6cfd7e082074'

    # A 'Setup' script to bring up the application/environment under test. The script must be non-blocking.
    # Examples:
    # Docker Compose(with `service.image: ${IMAGE_ID:-${IMAGE_REF:-<registry>/<organisation>/<image-name>}}`):
    # ```bash
    #   docker compose -f 'compose.frank.yaml' -f 'compose.frank.ci.yaml' up -d
    # ```
    # Docker:
    # ```bash
    #   docker run -d ${IMAGE_ID:-${IMAGE_REF:-<registry>/<organisation>/<image-name>}}
    # ```
    # Warning: It is very important that the Docker image built in CI is used. The 'Setup' script should never build the Docker Image.
    # The environment variables `IMAGE_ID` and/or `IMAGE_REF` are available in the 'Setup' script depending on which one(s) is/are provided to
    # this workflow. "image-ref" with a digest is recommended to ensure the correct image is used.
    setup-script: |
      docker compose -f compose.frank.yaml -f compose.frank.ci.yaml up -d

    # A 'Teardown' script to stop and cleanup up the application/environment under test. The script must be non-blocking.
    # The environment variables `CONTAINER_ID`,`IMAGE_ID` and/or `IMAGE_REF` are made available for stopping/cleaning up the used container afterwards.
    # Examples:
    # Docker Compose:
    # ```bash
    #   docker compose -f compose.frank.yaml -f compose.frank.ci.yaml down -v
    # ```
    # Docker:
    # ```bash
    #   docker stop ${CONTAINER_ID}
    #   docker rm --volumes ${CONTAINER_ID}
    # ```
    teardown-script: |
      docker compose -f 'compose.frank.yaml' -f 'compose.frank.ci.yaml' down -v

    # When 'true', the SoapUI reports will be uploaded as a GitHub Artifact
    # Default: true
    upload-reports-artifact: true

    # Name of the GitHub Artifact the SoapUI reports should be uploaded under.
    # Default: reports-soapui-testreports
    reports-artifact-name: 'reports-soapui-testreports'
```

## Scenario's
 [Run SoapUI TestRunner Using Docker Compose With GitHub Artifacts Storage Backend](#run-soapui-testrunner-using-docker-compose-with-github-artifacts-storage-backend)
 [Run SoapUI TestRunner Using Docker Compose With Registry Artifact Storage Backend](#run-soapui-testrunner-using-docker-compose-with-registry-artifact-storage-backend)

### Run SoapUI TestRunner Using Docker Compose With GitHub Artifacts Storage Backend
```yaml
ci:
  uses: wearefrank/ci-cd-templates/.github/workflows/ci-generic.yml@1
  secrets:
    token: ${{ secrets.GITHUB_TOKEN }}
  with:
    version: 'pr-x'
    image-repo: 'wearefrank'
    image-name: 'zaakbrug'
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
    image-artifact-backend: 'gh-artifacts'
    image-build-artifact-name: 'build-docker-image'
    image-tarball-file: 'image.tar'
    image-ref: ghcr.io/wearefrank/zaakbrug@${{ needs.ci.outputs.image-digest }}
    setup-script: |
      docker compose -f compose.frank.yaml -f compose.frank.ci.yaml -f compose.frank.postgres.yaml up -d
    teardown-script: |
      docker compose -f compose.frank.yaml -f compose.frank.ci.yaml -f compose.frank.postgres.yaml down -v

```
### Run SoapUI TestRunner Using Docker Compose With Registry Artifact Storage Backend
```yaml
ci:
  uses: wearefrank/ci-cd-templates/.github/workflows/ci-generic.yml@1
  secrets:
    token: ${{ secrets.GITHUB_TOKEN }}
  with:
    version: 'pr-x'
    image-registry: 'ghcr.io'
    image-repo: 'wearefrank'
    image-name: 'zaakbrug'
    upload-sarif-to-security: false
    run-frank-till-healthy-enabled: false

soapui-testrunner:
  uses: wearefrank/ci-cd-templates/.github/workflows/soapui-testrunner.yml@1
  needs:
    - ci
  secrets:
    token: ${{ secrets.GITHUB_TOKEN }}
    registry-username: ${{ github.actor }}
    registry-token: ${{ secrets.GITHUB_TOKEN }}
  with:
    soapui-project: 'soapui-project.xml'
    image-artifact-backend: 'registry'
    image-ref: ghcr.io/wearefrank/zaakbrug@${{ needs.ci.outputs.image-digest }}
    image-id: ${{needs.ci.outputs.image-id}}
    setup-script: |
      docker compose -f compose.frank.yaml -f compose.frank.ci.yaml -f compose.frank.postgres.yaml up -d
    teardown-script: |
      docker compose -f compose.frank.yaml -f compose.frank.ci.yaml -f compose.frank.postgres.yaml down -v
```