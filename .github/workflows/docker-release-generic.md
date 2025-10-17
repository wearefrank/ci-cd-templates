# Docker Release Generic Workflow
A generic release workflow for Docker that primarily publishes the built Docker image to an image repository. Because of the technical restrictions with exporting multi-architecture builds, this workflow publishes the previously built image for `linux/amd64` from the GitHub cache and builds the remaining architectures before publishing.

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
Because of the technical restrictions with exporting multi-architecture builds, this workflow publishes the previously built image for `linux/amd64` from the GitHub cache and builds the remaining architectures before publishing.

By default Docker images are build and published for the following architectures:
- linux/amd64
- linux/arm64

## Provenance and SBOM
A SBOM(Software Bill Of Materials) and provenance information that describes how and by who an image is built and what it contains, are automatically generated and published.

### Requirements
- This workflow only requires a version or reference to be available before calling this workflow.

- DockerHub credentials with read/write permission

## Usage
``` yaml
docker-release:
  uses: wearefrank/ci-cd-templates/.github/workflows/docker-release-generic.yml@1
  secrets:
    # GitHub token to be used. The default '${{ secrets.GITHUB_TOKEN }}' or '${{ secrets.GH_TOKEN }}' is enough.
    token: ${{ secrets.GITHUB_TOKEN }}

    # registry username with read/write to login to the registry.
    registry-username: ${{ secrets.dockerhub-username }}

    # registry token with read/write to login to the registry.
    registry-token: ${{ secrets.dockerhub-token }}
  with:

    # Docker image registry prefix.
    # Default: 'ghcr.io/'
    # Example: 'docker.io/' for Docker Hub.
    # Example: 'ghcr.io/' for GitHub Container Registry. (default)
    registry-prefix: 'docker.io/'
    
    # Docker image repository without 'docker.io/' for example.
    # Default: GitHub repository owner/organisation.
    docker-image-repo: 'wearefrank'

    # Docker image name.
    # Default: GitHub repository name.
    docker-image-name: 'zaakbrug'

    # Semvers string or reference.
    version: '1.0.0'

    # ${{ github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master' || startsWith(github.ref, 'refs/tags/') }}
    latest-tag: true
```

## Scenario's
 [Analyze semantic commits, run Docker CI workflow and publish Docker image](#analyze-semantic-commits-run-docker-ci-workflow-and-publish-docker-image)

### Analyze semantic commits, run Docker CI workflow and publish Docker image
``` yaml
analyze-commits:
  runs-on: ubuntu-latest
  outputs:
    version-next: ${{ steps.next-version.outputs.release-version }}
    version-next-tag: ${{ steps.next-version.outputs.release-tag }}
    version-next-type: ${{ steps.next-version.outputs.release-type }}
  steps:
    - uses: step-security/harden-runner@63c24ba6bd7ba022e95695ff85de572c04a18142 # v2.7.0
      with:
        disable-sudo: true
        egress-policy: audit
        allowed-endpoints: >
          github.com:443

    - name: Checkout
      uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 #4.1.1
    
    - name: Setup Node
      uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8 #4.0.2
      with:
        node-version: 24
    
    - name: Install dependencies
      run: yarn global add semantic-release @semantic-release/changelog @semantic-release/git @semantic-release/github @semantic-release/exec @semantic-release/release-notes-generator @semantic-release/commit-analyzer conventional-changelog-conventionalcommits
    
    - name: Get next version
      id: next-version
      run: semantic-release --dryRun
      env:
        GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
        GH_TOKEN: ${{ secrets.GH_TOKEN }}

ci:
  uses: wearefrank/ci-cd-templates/.github/workflows/ci-generic.yml@1
  needs:
    - analyze-commits
  secrets:
    token: ${{ secrets.GITHUB_TOKEN }}
  with:
    version: ${{ needs.analyze-commits.outputs.version-next }}

docker-release:
  uses: wearefrank/ci-cd-templates/.github/workflows/docker-release-generic.yml@1
  needs: 
    - ci
  secrets:
    token: ${{ secrets.GITHUB_TOKEN }}
    dockerhub-username: ${{ secrets.dockerhub-username }}
    dockerhub-token: ${{ secrets.dockerhub-token }}
  with:
    version: ${{ needs.analyze-commits.outputs.version-next }}
```

## Outputs
| Name | Value | Description |
|------|----------|----------------------------------|
| image-id | sha:4564sdf54sdf44sdf4sdf4ds4f4sdf | Image id of the built docker image |
| image-digest | sha:4564sdf54sdf44sdf4sdf4ds4f4sdf | Image digest of the built docker image |
| image-metadata | JSON structure | Image metadata of the built docker image |