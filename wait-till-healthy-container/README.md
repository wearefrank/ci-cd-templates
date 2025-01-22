# Wait Till Docker Healthy Container
Waits till Docker container's health endpoint returns 'HEALTHY'.
Every 5 seconds a `docker inspect` is executed to check for a "HEALTHY" status.

Container Id is the easiest method. If not known, the image-id or image-name can be provided.
A `docker ps` is done to find the last created container that has the image-id or image-name as ancestor.

Note: The container must have a health probe defined.

## Usage
``` yaml
- uses: wearefrank/ci-cd-templates/wait-till-healthy-container@1
  with:
    # Docker container id of the container to wait for.
    #
    # Note: The Docker container needs to be created and available already.
    container-id: '8f50c5fe8ebd7ed30950620b622ef1ed4ecd5938127100ad813dfbb49af6161f'

    # Docker image id used by the container to wait for.
    #
    # The Docker container needs to be created and available already.
    image-id: 'sha256:a5d0ce49aa801d475da48f8cb163c354ab95cab073cd3c138bd458fc8257fbf1'

    # Docker image name of the loaded image to use. For example: 'wearefrank/zaakbrug'.
    #
    # The Docker container needs to be created and available already.
    image-name: 'wearefrank/zaakbrug'

    # Maximum duration to wait for a healthy container.
    #
    # Default: 300
    timeout-sec: '300'
```

## Scenario's
 [Container Id From Docker Run](#container-id-from-docker-run)

### Container Id From Docker Run
```yaml
- name: Run ZaakBrug
  id: docker-run
  run: |
    CONTAINER_ID=$(docker run -d wearefrank/zaakbrug:latest sleep)

    # Set GitHub output variable 'container-id' with 'CONTAINER_ID returned by Docker run'.
    echo "container-id=$CONTAINER_ID" >> $GITHUB_OUTPUT

- name: Wait Till Docker Container Healthy
  uses: wearefrank/ci-cd-templates/wait-till-healthy-container@1
  with:
    container-id: ${{ steps.docker-run.outputs.container-id }}
```