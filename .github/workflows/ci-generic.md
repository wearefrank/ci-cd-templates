# Continuous Integration Generic Workflow
A generic continuous integration workflow that updates the instance BuildInfo.properties and builds and tests an image with the `docker-ci-generic` workflow. It supports two methods for sharing the image artifact between jobs: 'gh-artifacts' (using GitHub artifact storage) and 'registry' (copying from a source registry).

Tests:
**Dockerfile - Chekov Linter** -> Checkov is a static code analysis tool for scanning infrastructure as code (IaC) files for misconfigurations that may lead to security or compliance problems.
**Image - Run Frank Till Healthy** -> Runs the container and waits for a 'HEALTHY' health-endpoint status. This is more meant as a fallback if no proper tests are executed (SoapUI, Larva, etc). It will atleast validate that the adapters are able to start without errors. This test should be disabled with `run-frank-till-healthy-enabled: false` if other tests are done that require running the container.

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
When using "image-artifact-backend" `gh-artifacts`, the image is exported with the filename provided in "image-artifact-file"(default: `image.tar`) and uploaded as a GitHub artifact with the name provided in "image-artifact-name"(default: `build-docker-image`).

When using "image-artifact-backend" `registry`, the image is pushed to the specified registry.

#### Multi-architecture build
This workflow builds for `linux/amd64, linux/arm64` when using "image-artifact-backend" `registry`, but only for `linux/amd64` when using "image-artifact-backend" `gh-artifacts` due to technical limitations of the Tarball exporter. The "docker-release-generic" workflow will build for both architectures though, as it can immediately push them to a registry. If testing all architecture in CI is required, use "image-artifact-backend" `registry`.

## Provenance and SBOM
A SBOM(Software Bill Of Materials) and provenance information that describes how and by who an image is built and what it contains, are automatically generated and published when using "image-artifact-backend" `registry`. Due to technical limitation of the Tarball exporter, this information is lost when using "image-artifact-backend" `gh-artifacts`. The "docker-release-generic" workflow partially rebuilds the image to generate this information on release.

### Requirements
- This workflow only requires a version or reference to be available before calling this workflow.

- A GitHub PAT is NOT required as token. Using the default "secrets.GITHUB_TOKEN" with `package: write`, `content: read` permission is recommended.

## Usage
``` yaml
ci:
  uses: wearefrank/ci-cd-templates/.github/workflows/ci-generic.yml@1
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

    # Name of the artifact to upload to GitHub Actions Storage, that contains the exported Docker Image Tarball.
    # Only required when `image-artifact-backend: 'gh-artifacts'`.
    # Default: 'build-docker-image'
    image-artifact-name: 'build-docker-image'

    # Path and filename of the exported Docker Image Tarball, that is to be uploaded to GitHub Actions Storage.
    # Only required when `image-artifact-backend: 'gh-artifacts'`.
    # Default: 'image.tar'
    image-artifact-file: 'image.tar'

    # Image registry prefix (e.g. ghcr.io, docker.io).
    # Default: 'ghcr.io'
    image-registry: 'ghcr.io'

    # Image repository (e.g. wearefrank, my-github-username).
    # Default: GitHub repository owner/organisation.
    image-repo: 'wearefrank'

    # Image name (e.g. zaakbrug, frankframework).
    # Default: GitHub repository name.
    image-name: 'zaakbrug'

    # Semvers string. If empty, the ref/tag will be used (if on.tag trigger).
    version: '1.0.0'

    # Upload Sarif reports to Github Security dashboard.
    # Default: false
    upload-sarif-to-security: false

    # Run Chekov Linter.
    # Default: true
    chekov-linter-enabled: true

    # Run Frank till the health endpoints returns 'HEALTHY'.
    # Default: true
    run-frank-till-healthy-enabled: true
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
| bake-file | JSON structure | Image bake-file definition |
| docker-meta-tags | JSON array | Docker meta tags of the built docker image |
| docker-meta-labels | JSON object | Docker meta labels of the built docker image |