# Larva Testrunner
Runs Larva testcases and generates a report with the test results. A Markdown version of the Larva test report is also generated and output as GitHub Actions run summary.

## Usage
``` yaml
- uses: wearefrank/ci-cd-templates/larva-testrunner@1
  with:
    # Container id of the running container with the application under test.
    #
    # Note: The Image needs to be available to the local Docker runtime already.
    #
    # Required: true
    container-id: '<container-id>'

    # When 'true', the Larva testreport will be uploaded as a GitHub Artifact
    #
    # Default: true
    upload-larva-testreport-artifact: true

    # Name of the GitHub Artifact the Larva testreport should be uploaded under.
    #
    # Default: reports-larva-testreport
    larva-testreport-artifact-name: 'reports-larva-testreport'

    # When 'true', the Larva testreport will be printed to the GitHub Actions Summary.
    #
    # Default: true
    larva-testreport-to-actions-summary: true

    # Log level for Larva test execution.
    #
    # Default: WRONG_PIPELINE_MESSAGES_PREPARED_FOR_DIFF
    larva-loglevel: 'WRONG_PIPELINE_MESSAGES_PREPARED_FOR_DIFF'

    # Path to the directory containing the Larva scenarios to be executed, relative to the container's filesystem.
    #
    # Default: /opt/frank/testtool
    larva-execution-target: '/opt/frank/testtool'
```

## Scenario's
 [Docker Run And Wait For Healthy Container Before Running Larva](#docker-run-and-wait-for-healthy-container-before-running-larva)

### Docker Run And Wait For Healthy Container Before Running Larva
``` yaml
- name: Checkout
  uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 #4.2.2
  with:
    token: ${{ github.token }}

- name: Load Docker tar
  shell: bash
  run: |
    docker load --input image.tar

- name: Setup Test Environment
  id: setup-script
  shell: bash
  env:
    IMAGE_ID: ${{inputs.image-id}}
  run: |
    CONTAINER_ID=$(docker run -d $IMAGE_ID)
    echo "container-id=$CONTAINER_ID" >> $GITHUB_OUTPUT

- name: Wait Till Healthy
  uses: wearefrank/ci-cd-templates/wait-till-healthy-container@1
  with:
    image-id: ${{inputs.image-id}}

- name: Larva Testrunner
  uses: wearefrank/ci-cd-templates/larva-testrunner@1
  timeout-minutes: 5
  with:
    container-id: ${{steps.setup-script.outputs.container-id}}

- name: Teardown Test Environment
  shell: bash
  env:
    CONTAINER_ID: ${{steps.setup-script.outputs.container-id}}
  run: |
    docker stop $CONTAINER_ID
    docker rm -v $CONTAINER_ID
```
