# Docker Continuous Integration Generic Workflow
A generic continuous integration workflow for Docker that builds the Docker image and executes several tests. It supports two methods for sharing the image artifact: 'gh-artifacts' (exporting to a tarball and uploading to GitHub artifacts) and 'registry' (pushing to a container registry). The Checkov Linter is run on the Dockerfile to check for security issues and enforces Dockerfile best practices. The built image is also tested by running it and waiting for the Frank!Framework health endpoint to signal that all adapters started successfully.

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

- Target registry credentials with read/write permission (e.g., DockerHub or GitHub Container Registry). When using GHCR, it is recommended to use the GITHUB_TOKEN if it has the correct permissions. Only required if "image-artifact-backend" `registry`.

## Usage
``` yaml
ci:
  uses: wearefrank/ci-cd-templates/.github/workflows/docker-ci-generic.yml@1
  secrets:
    # GitHub token with permissions to access the repository.
    # Default: GitHub token (secrets.GITHUB_TOKEN)
    token: ${{ secrets.GITHUB_TOKEN }}

    # Username for the registry.
    # Only required when `image-artifact-backend: 'registry'`.
    # default: GitHub actor username (github.actor).
    registry-username: ${{ secrets.dockerhub-username }}

    # Token for the registry
    # Only required when `image-artifact-backend: 'registry'`.
    registry-token: ${{ secrets.dockerhub-token }}
  with:
    # The method used for sharing the image artifact between jobs.
    # The 'gh-artifacts' method downloads and loads an exported Docker Image Tarball, that was uploaded to GitHub Actions Storage in a previous CI job. 
    # The 'registry' method pulls the image from an (snapshot) image registry, that was pushed to the registry in a previous CI job.
    # Options:
    # - 'gh-artifacts': Share the image artifact as Tarball, uploaded/downloaded via Github Artifact Storage. When this option is used, both `image-build-artifact-name` and `image-tarball-file` are used.
    # - 'registry': Share the image artifact via a (snapshot) registry. When this option is used, both `registry-username`, `registry-token` need to be provided or alternatively `token` can be used when the registry is `ghcr.io` and the token has appropriate permissions.
    # default: 'registry'
    image-artifact-backend: 'registry'

    # Name of the artifact to upload to GitHub Actions Storage, that contains the exported Docker Image Tarball.
    # Only required when `image-artifact-backend: 'gh-artifacts'`.
    # Default: 'build-docker-image'
    image-artifact-name: 'build-docker-image'

    # Path and filename of the exported Docker Image Tarball, that is to be uploaded to GitHub Actions Storage.
    # Only required when `image-artifact-backend: 'gh-artifacts'`.
    # Default: 'image.tar'
    image-artifact-file: 'image.tar'

    # Image registry prefix (e.g. ghcr.io, docker.io)
    # Default: 'ghcr.io'
    image-registry: 'ghcr.io'

    # Image repository(e.g. wearefrank, my-github-username). Default -> GitHub repository owner/organisation.
    # default -> GitHub repository owner/organisation.
    image-repo: 'wearefrank'

    # Image name(e.g. zaakbrug, frankframework).
    # default -> GitHub repository name.
    image-name: 'zaakbrug'

    # Semvers string. If empty, the ref/tag will be used (if on.tag trigger).
    version: '1.0.0'

    # Add latest flavor
    # default: true if on main/master or tag
    latest-tag: true

    # Upload Sarif reports to Github Security dashboard
    # Default: false
    upload-sarif-to-security: false

    # Run Chekov Linter
    # Default: true
    chekov-linter-enabled: true

    # Run Frank till the health endpoints returns 'HEALTHY'
    # Default: true
    run-frank-till-healthy-enabled: true
```

## Scenario's
 [Run CI Using A Registry For Storing Image Artifacts](#run-ci-using-a-registry-for-storing-image-artifacts)
 [Run CI Using GitHub Artifact Storage For Storing Image Artifacts](#run-ci-using-github-artifact-storage-for-storing-image-artifacts)

### Run CI Using A Registry For Storing Image Artifacts
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
  uses: wearefrank/ci-cd-templates/.github/workflows/docker-ci-generic.yml@1
  needs:
    - version-next
  secrets:
    token: ${{ secrets.GITHUB_TOKEN }}
  with:
    image-artifact-backend: 'registry'
    image-registry: 'ghcr.io'
    image-repo: ${{ github.repository_owner }}
    image-name: ${{ github.event.repository.name }}
    version: ${{ needs.version-next.outputs.version-next }}

extra-test:
  runs-on: ubuntu-latest
  permissions:
    contents: read
    packages: read
  needs:
    - ci
  steps:
    - uses: step-security/harden-runner@63c24ba6bd7ba022e95695ff85de572c04a18142 # v2.7.0
      with:
        disable-sudo: true
        egress-policy: block
        allowed-endpoints: >
          github.com:443

    - name: Checkout
      uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 #4.1.1

    - name: Login to Container Registry
      uses: docker/login-action@5e57cd118135c172c3672efd75eb46360885c0ef # 3.6.0
      with:
        registry: 'ghcr.io'
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Pull Image From Registry
      shell: bash
      env:
        IMAGE_REF: ghcr.io/${{ github.repository_owner }}/${{ github.event.repository.name }}-staging@${{ needs.ci.outputs.image-digest}}
      run: |
        echo "Pulling image from registry with ref: [${IMAGE_REF}]"
        docker pull "${IMAGE_REF}"
```

### Run CI Using GitHub Artifact Storage For Storing Image Artifacts
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
  uses: wearefrank/ci-cd-templates/.github/workflows/docker-ci-generic.yml@1
  needs:
    - version-next
  secrets:
    token: ${{ secrets.GITHUB_TOKEN }}
  with:
    image-artifact-backend: 'gh-artifact'
    image-artifact-name: 'build-docker-image'
    image-artifact-file: 'image.tar'

    version: ${{ needs.version-next.outputs.version-next }}

extra-test:
  runs-on: ubuntu-latest
  permissions:
    contents: read
  needs:
    - ci
  steps:
    - uses: step-security/harden-runner@63c24ba6bd7ba022e95695ff85de572c04a18142 # v2.7.0
      with:
        disable-sudo: true
        egress-policy: block
        allowed-endpoints: >
          github.com:443

    - name: Checkout
      uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 #4.1.1

    - name: Download Image Tarball Artifact
      uses: actions/download-artifact@37930b1c2abaa49bbe596cd826c3c89aef350131 #7.0.0
      with:
        name: 'build-docker-image'

    - name: Load Docker Tarball
      shell: bash
      run: |
        docker load --input image.tar
        docker images -a --digests
```

## Outputs
| Name | Value | Description |
|------|----------|----------------------------------|
| image-id | sha:4564sdf54sdf44sdf4sdf4ds4f4sdf | Image id of the built docker image |
| image-digest | sha:4564sdf54sdf44sdf4sdf4ds4f4sdf | Image digest of the built docker image |
| image-metadata | JSON structure | Image metadata of the built docker image |
| docker-meta-tags | string | Docker meta tags |
| docker-meta-labels | string | Docker meta labels |