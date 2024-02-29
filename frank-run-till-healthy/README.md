# Run Docker image till healthy
Runs the Docker container till the health endpoint returns 'HEALTHY', indicating that the database and adapters are all correctly started.

The container is started in detached mode. Every 15 seconds a `docker inspect` is executed to check for a "HEALTHY" status.

Note: The container must have a health probe defined.

## Usage
``` yaml
- uses: wearefrank/ci-cd-templates/frank-run-till-healthy@1
  with:
    # Docker image id of the loaded image to use.
    #
    # Note that the Docker image needs to be available to the Docker runtime already.
    image-id: ''

    # Docker image tag of the loaded image to use. For example: 'wearefrank/zaakbrug:1.2.0'.
    #
    # Note that the Docker image needs to be available to the Docker runtime already.
    docker-image-tag: ''
```

## Scenario's
 [Load from Tarball](#load-from-tarball)

### Load from Tarball
``` yaml
- name: Load Docker Tarball
  id: docker-load
  run: |
    LOADED=$(docker load --input busybox.tar)

    # Extract tag from 'docker load' output and pipe to GitHub output 'image-tag'.
    echo "image-tag=${LOADED##*Loaded image: }" >> $GITHUB_OUTPUT

- name: Run till healthy
  uses: wearefrank/ci-cd-templates/frank-run-till-healthy@1
  with:
    docker-image-tag: ${{ steps.docker-load.outputs.image-tag }}
```