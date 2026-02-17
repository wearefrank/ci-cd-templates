# Run Docker Till Healthy
Runs the container till the health endpoint returns 'HEALTHY', indicating that the database and adapters are all correctly started.

The application/environment under test can be brought up with a 'Setup' script and cleaned up afterwards with a 'Teardown' script.
After the 'Setup' script has been executed, the workflow will wait for the container's health endpoint to report 'Healthy'. Once the container is healthy, the workflow will report success and 'Teardown' will be executed.

Refer to [Wait Till Healthy Container](../wait-till-healthy-container/README.md) for more details on the interal workings.

Note: The container must have a health probe defined.

## Usage
``` yaml
- uses: wearefrank/ci-cd-templates/frank-run-till-healthy@1
  with:
    # Image id of the application under test.
    #
    # Note: An image id is the hash of the local image json configuration and may differ across environments and runs.
    # Note: The Image needs to be available to the local Docker runtime already.
    image-id: 'sha256:f08b3b82c9586dc2ea89011b896a071f7b573d2d331c8f175f565d3559c73842'

    # Image reference of the application under test according to the [OCI Image Reference Format](https://docs.docker.com/reference/compose-file/services/#image) as `[<registry>/][<project>/]<image>[:<tag>|@<digest>]`.
    # For example: 'docker.io/wearefrank/zaakbrug:1.2.0'.
    #
    # Note: The Image needs to be available to the local Docker runtime already.
    # Warning: Using `image-ref` without a digest could resolve to an already released image if the CI built image is not available in the local Docker engine.
    image-ref: 'ghcr.io/wearefrank/zaakbrug@sha256:30be35b605fb70ef46d9ee662973c9539aeca88dbad50c4ccc1de139795ff743'

    # A 'Setup' script to bring up the application/environment under test. The script must be non-blocking.
    #
    # Examples:
    # Docker Compose(with `service.image: ${IMAGE_ID:-${IMAGE_REF:-<registry>/<organisation>/<image-name>}}`):
    # ```bash
    # docker compose -f 'compose.frank.yaml' -f 'compose.frank.ci.yaml' up -d
    # ```
    # Docker:
    # ```bash
    # docker run -d ${IMAGE_ID:-${IMAGE_REF:-<registry>/<organisation>/<image-name>}}
    # ```
    #
    # Warning: It is very important that the image built in CI is used. The 'Setup' script should never build the Docker Image.
    # The environment variables `IMAGE_ID` and/or `IMAGE_REF` are available in the 'Setup' script depending on which one is provided to this workflow.
    # Warning: Using `image-ref` without a digest could resolve to an already released image if the CI built image is not available in the local Docker engine.
    setup-script: |
      set -x
      docker run -p 8080:8080 -e dtap.stage=LOC -d ${IMAGE_ID:-${IMAGE_REF}}

    # A 'Teardown' script to stop and cleanup up the application/environment under test. The script must be non-blocking.
    #
    # The environment variables `IMAGE_ID` and `IMAGE_REF` are available to the script depending on which one is provided to
    # this workflow, aswell as `CONTAINER_ID` for stopping/cleaning up the used container afterwards.
    #
    # Examples:
    # Docker Compose:
    # ```bash
    # docker compose -f 'compose.frank.yaml' -f 'compose.frank.ci.yaml' down -v
    # ```
    # Docker:
    # ```bash
    # docker stop ${CONTAINER_ID}
    # docker rm --volumes ${CONTAINER_ID}
    # ```
    teardown-script: |
      docker stop ${CONTAINER_ID}
      docker rm --volumes ${CONTAINER_ID}
```

## Scenario's
 [Load From Tarball](#load-from-tarball)
 [Pull Image From Registry](#pull-image-from-registry)

### Load From Tarball
``` yaml
- name: Load Docker Tarball
  id: docker-load
  run: |
    LOADED=$(docker load --input busybox.tar)

    # Extract tag from 'docker load' output and pipe to GitHub output 'image-ref'.
    echo "image-ref=${LOADED##*Loaded image: }" >> $GITHUB_OUTPUT

- name: Run Till Healthy
  uses: wearefrank/ci-cd-templates/frank-run-till-healthy@latest
  with:
    image-ref: ${{ steps.docker-load.outputs.image-ref }}
```

### Pull Image From Registry
``` yaml
- name: Login To Container Registry
  uses: docker/login-action@5e57cd118135c172c3672efd75eb46360885c0ef # 3.6.0
  with:
    registry: 'ghcr.io'
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

- name: Pull Image From Registry
  shell: bash
  env:
    IMAGE_REF: ${{ env.image-ref }}
  run: |
    echo "Pulling image from registry with ref: [${IMAGE_REF}]"
    docker pull $(echo "${IMAGE_REF}")

- name: Run Till Healthy
  uses: wearefrank/ci-cd-templates/frank-run-till-healthy@latest
  with:
    image-ref: ${{ env.image-ref }}
```