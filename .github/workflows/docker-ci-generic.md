# Docker Continuous Integration Generic Workflow
A generic continuous integration workflow for Docker that builds the Docker image and executes several tests. The Checkov Linter is ran on the Dockerfile to check for security issues and enforces Dockerfile best practices. The built image is also tested by running it and waiting for the Frank!Framework health endpoint to signal that all adapters started successfully.

#### Download pre-build and build GitHub artifacts
Before the Docker image is build, all GitHub artifacts from the current ci/cd run that satisfy the filters `pre-build-*` and `build-*` are downloaded after the Git checkout is done. This allows for assets produced during the ci/cd run, to be included in the Docker build.

The GitHub upload action does not retain the relative path of the file(s) in the artifact, unless you add a '*' wildcard in the path during upload. 

#### Tags, Labels and Metadata
Tags, labels and other metadata is automatically generated before building the image. If `latest-tag` is not explicitly set, it will be decided based on git ref.

Example tags with version 1.2.3:
- wearefrank/zaakbrug:1
- wearefrank/zaakbrug:1.2
- wearefrank/zaakbrug:1.2.3
- wearefrank/zaakbrug:latest (if git ref is main/master or tag)

Example tags when on pull-request and no version:
- wearefrank/zaakbrug:pr-\<pr-number\>

#### Build artifact
The Docker image is exported as `./image.tar` an uploaded as a GitHub artifact named `build-docker-image`.

#### Multi-architecture build
 Currently this workflow only builds for `linux/amd64` architecture because multi-architecture builds can't be exported to a Tarball. Multi-architecture builds are still made possible by building for multiple architectures during publishing in the `docker-release-generic` workflow and leveraging the GitHub cache to make this efficient. 

This workflow only requires a version or reference to be available before calling this workflow.

A GitHub PAT is not required as token.

## Usage
``` yaml
ci:
  uses: wearefrank/ci-cd-templates/.github/workflows/docker-ci-generic.yml@1
  secrets:
    # GitHub token to be used. The default '${{ secrets.GITHUB_TOKEN }}' or '${{ secrets.GH_TOKEN }}' is enough.
    token: ${{ secrets.GITHUB_TOKEN }}
  with:
    # Docker image repository without 'docker.io/' for example.
    # Default: Repository owner/organisation
    docker-image-repo: 'wearefrank'

    # Docker image name.
    # Default: Repository name
    docker-image-name: 'zaakbrug'

    # Semvers string or reference.
    version: '1.0.0'

    # ${{ github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master' || startsWith(github.ref, 'refs/tags/') }}
    latest-tag: true

    # Upload Sarif reports to Github Security dashboard.
    # Default: false
    upload-sarif-to-security: false

    # Run Chekov Linter.
    # Default: true
    chekov-linter-enabled: false

    # Run Frank till the health endpoints returns 'HEALTHY'.
    # Default: true
    run-frank-till-healthy-enabled: false
```

## Scenario's
 [Create reference for pull_request and run ci](#create-reference-for-pull_request-and-run-ci)

### Create reference for pull_request and run ci
``` yaml
version-next:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    outputs:
      version-next: ${{ steps.reference.outputs.next-reference }}
      version-next-strict: ${{ steps.reference.outputs.next-reference }}
    steps:
      - uses: step-security/harden-runner@63c24ba6bd7ba022e95695ff85de572c04a18142 # v2.7.0
        with:
          disable-sudo: true
          egress-policy: block
          allowed-endpoints: >
            github.com:443

      - name: Checkout
        uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 #4.1.1

      - name: Next Reference
        id: reference
        uses: wearefrank/ci-cd-templates/next-reference@1

  ci:
    uses: wearefrank/ci-cd-templates/.github/workflows/ci-generic.yml@1
    needs:
      - version-next
    secrets:
      token: ${{ secrets.GITHUB_TOKEN }}
    with:
      version: ${{ needs.version-next.outputs.version-next }}
```

## Outputs
| Name | Value | Description |
|------|----------|----------------------------------|
| image-id | sha:4564sdf54sdf44sdf4sdf4ds4f4sdf | Image id of the built docker image |
| image-digest | sha:4564sdf54sdf44sdf4sdf4ds4f4sdf | Image digest of the built docker image |
| image-metadata | JSON structure | Image metadata of the built docker image |