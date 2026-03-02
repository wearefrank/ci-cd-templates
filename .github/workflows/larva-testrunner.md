# Larva Test Runner
Runs Larva testcases and generates a report with the test results. A Markdown version of the Larva test report is also generated and output as GitHub Actions run summary.

The application/environment under test can be brought up with a 'Setup' script and cleaned up afterwards with a 'Teardown' script.
After the 'Setup' script has been executed, the workflow will wait for the container's health endpoint to report 'Healthy'. Once the container is healthy, the Larva Test runner will be executed.

### Setup & Teardown
A 'Setup' and 'Teardown' script need to be provided to bring up the application/environment under test and to clean it 
up afterwards. Both scripts need to be non-blocking, so run in detached mode when using Docker for example. 

When using Docker it is recommended to create a Docker Compose file for CI/CD. This can either be a stand-alone Docker Compose 
for CI/CD or an override Docker Compose file that is used together with the development environment Docker Compose. 

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
- uses: wearefrank/ci-cd-templates/.github/workflows/larva-testrunner@1
  secrets:
    # GitHub token to be used. The default '${{ secrets.GITHUB_TOKEN }}' or '${{ secrets.GH_TOKEN }}' is enough.
    token: ${{ secrets.GITHUB_TOKEN }}

    # Username for the registry.
    # Only required when `image-artifact-backend: 'registry'`.
    # Default: GitHub actor username (github.actor).
    registry-username: ${{ github.actor }}

    # Token for the registry.
    # Only required when `image-artifact-backend: 'registry'`.
    registry-token: ${{ secrets.GITHUB_TOKEN }}
  with:
    # The method used for sharing the image artifact between jobs.
    # Options: 'gh-artifacts', 'registry'
    # Default: 'registry'
    image-artifact-backend: 'registry'

    # Name of the artifact uploaded to GitHub Actions Storage, that contains the exported Docker Image Tarball.
    # Only required when `image-artifact-backend: 'gh-artifacts'`.
    # Default: 'build-docker-image'
    image-artifact-name: 'build-docker-image'

    # Path and filename of the exported Docker Image Tarball, that was uploaded to GitHub Actions Storage.
    # Only required when `image-artifact-backend: 'gh-artifacts'`.
    # Default: 'image.tar'
    image-artifact-file: 'image.tar'

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

    # When 'true', the Larva testreport will be uploaded as a GitHub Artifact
    # Default: true
    upload-larva-testreport-artifact: true

    # Name of the GitHub Artifact the Larva testreport should be uploaded under.
    # Default: reports-larva-testreport
    larva-testreport-artifact-name: 'reports-larva-testreport'

    # When 'true', the Larva testreport will be printed to the GitHub Actions Summary.
    # Default: true
    larva-testreport-to-actions-summary: true

    # Log level for Larva test execution.
    # Default: WRONG_PIPELINE_MESSAGES_PREPARED_FOR_DIFF
    larva-loglevel: 'WRONG_PIPELINE_MESSAGES_PREPARED_FOR_DIFF'

    # Path to the directory containing the Larva scenarios to be executed, relative to the container's filesystem.
    # Default: /opt/frank/testtool
    larva-execution-target: '/opt/frank/testtool'
```

## Scenario's
 [Run Larva TestRunner Using Docker Compose With GitHub Artifacts Storage Backend](#run-larva-testrunner-using-docker-compose-with-github-artifacts-storage-backend)
 [Run Larva TestRunner Using Docker Compose With Registry Artifact Storage Backend](#run-larva-testrunner-using-docker-compose-with-registry-artifact-storage-backend)

### Run Larva TestRunner Using Docker Compose With GitHub Artifacts Storage Backend
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

larva-testrunner:
  uses: wearefrank/ci-cd-templates/.github/workflows/larva-testrunner.yml@1
  needs:
    - ci
  secrets:
    token: ${{ secrets.GITHUB_TOKEN }}
  with:
    image-artifact-backend: 'gh-artifacts'
    image-artifact-name: 'build-docker-image'
    image-artifact-file: 'image.tar'
    image-ref: ghcr.io/wearefrank/zaakbrug@${{ needs.ci.outputs.image-digest }}
    setup-script: |
      docker compose -f compose.frank.yaml -f compose.frank.ci.yaml -f compose.frank.postgres.yaml up -d
    teardown-script: |
      docker compose -f compose.frank.yaml -f compose.frank.ci.yaml -f compose.frank.postgres.yaml down -v

```
### Run Larva TestRunner Using Docker Compose With Registry Artifact Storage Backend
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

larva-testrunner:
  uses: wearefrank/ci-cd-templates/.github/workflows/larva-testrunner.yml@1
  needs:
    - ci
  secrets:
    token: ${{ secrets.GITHUB_TOKEN }}
    registry-username: ${{ github.actor }}
    registry-token: ${{ secrets.GITHUB_TOKEN }}
  with:
    image-artifact-backend: 'registry'
    image-ref: ghcr.io/wearefrank/zaakbrug@${{ needs.ci.outputs.image-digest }}
    setup-script: |
      docker compose -f compose.frank.yaml -f compose.frank.ci.yaml -f compose.frank.postgres.yaml up -d
    teardown-script: |
      docker compose -f compose.frank.yaml -f compose.frank.ci.yaml -f compose.frank.postgres.yaml down -v
```
