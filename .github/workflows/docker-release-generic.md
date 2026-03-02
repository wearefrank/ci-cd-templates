# Docker Release Generic Workflow
A generic release workflow for Docker that publishes the built Docker image to an image repository. It supports two methods for sharing the image artifact between jobs: 'gh-artifacts' (using GitHub artifact storage) and 'registry' (copying from a source registry).

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

#### Multi-architecture build
Images are always built for the `linux/amd64` and `linux/arm64` architectures on release.

Because of the technical restrictions with exporting multi-architecture builds, sbom and provenance data, this workflow rebuilds the previously built image for `linux/amd64` from the GitHub cache and builds the remaining architectures before publishing.

By default images are build and published for the following architectures:
- linux/amd64
- linux/arm64

## Provenance and SBOM
A SBOM(Software Bill Of Materials) and provenance information that describes how and by who an image is built and what it contains, are automatically generated and published.

### Requirements
- This workflow only requires a version or reference to be available before calling this workflow.

- Target registry credentials with read/write permission (e.g., DockerHub or GitHub Container Registry). When using GHCR, it is recommended to use the GITHUB_TOKEN if it has the correct permissions.

- Source registry credentials with read/write permission (e.g., DockerHub or GitHub Container Registry). When using GHCR, it is recommended to use the GITHUB_TOKEN if it has the correct permissions. Only required if `image-artifact-backend: 'registry'`

## Usage
``` yaml
docker-release:
  uses: wearefrank/ci-cd-templates/.github/workflows/docker-release-generic.yml@1
  secrets:
    # GitHub token with permissions to access the repository.
    # Default: GitHub token (secrets.GITHUB_TOKEN)
    token: ${{ secrets.GITHUB_TOKEN }}

    # Username for the target image registry to push the image to.
    # Default -> GitHub actor username (github.actor).
    registry-username: ${{ github.actor }}

    # Token for the target image registry to push the image to.
    # Default -> If the registry is `ghcr.io`, 'secrets.token' is used.
    registry-token: ${{ secrets.GITHUB_TOKEN }}

    # Username for the source image registry to copy the image.
    # Only required when `image-artifact-backend: 'registry'`.
    # default: GitHub actor username (github.actor).
    source-registry-username: ${{ github.actor }}

    # Token for the source image registry to copy the image.
    # Only required when `image-artifact-backend: 'registry'`.
    # Default -> If the registry is `ghcr.io`, 'secrets.token' is used.
    source-registry-token: ${{ secrets.GITHUB_TOKEN }}
  with:
    # The method used for sharing the image artifact between jobs.
    # The 'gh-artifacts' method downloads and loads an exported Docker Image Tarball, that was uploaded to GitHub Actions Storage in a previous CI job.
    # The 'registry' method **copies** the image from a source image registry to the target registry if a source registry is configured. Otherwise builds from cache.
    # Options:
    # - 'gh-artifacts': Share the image artifact as Tarball, uploaded/downloaded via Github Artifact Storage.
    # - 'registry': Share the image artifact via a source registry. When this option is used, all 'source-*' inputs params need to be provided. Also both 'source-registry-username', 'source-registry-token' need to be provided or alternatively 'token' can be used when the registry is `ghcr.io` and the token has appropriate permissions.
    # default: 'registry'
    image-artifact-backend: 'registry'

    # Target image registry prefix (e.g. ghcr.io, docker.io)
    # Default: 'ghcr.io'
    image-registry: 'ghcr.io'

    # Target image repository(e.g. wearefrank, my-github-username).
    # Default -> GitHub repository owner/organisation ('github.repository_owner').
    image-repo: 'wearefrank'

    # Target image name(e.g. zaakbrug, frankframework).
    # default -> GitHub repository name ('github.event.repository.name').
    image-name: 'zaakbrug'

    # Source image registry prefix (e.g. ghcr.io, docker.io)
    # Default: 'ghcr.io'
    source-image-registry: 'ghcr.io'

    # Source image repository(e.g. wearefrank, my-github-username).
    # Default -> GitHub repository owner/organisation ('github.repository_owner').
    source-image-repo: 'wearefrank'

    # Source image name(e.g. zaakbrug, frankframework).
    # default -> GitHub repository name ('github.event.repository.name') + '-staging'.
    source-image-name: 'zaakbrug-staging'

    # Semvers string. If empty, the ref/tag will be used (if on.tag trigger).
    version: '1.0.0'

    # Add latest flavor
    latest-tag: true
```

## Scenario's
 [Run Docker CI Workflow With Registry Backend And Copy Image From Source To Target Registry](#run-docker-ci-workflow-with-registry-backend-and-copy-image-from-source-to-target-registry)
 [Run Docker CI Workflow With GitHub Artifacts Backend And Publish To Target Registry](#run-docker-ci-workflow-with-github-artifacts-backend-and-publish-to-target-registry)

### Run Docker CI Workflow With Registry Backend And Copy Image From Source To Target Registry
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
        GITHUB_TOKEN: ${{ secrets.PAT }}
        GH_TOKEN: ${{ secrets.PAT }}

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
  with:
    version: ${{ needs.analyze-commits.outputs.version-next }}
```

### Run Docker CI Workflow With GitHub Artifacts Backend
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
    image-artifact-backend: 'gh-artifacts'
    version: ${{ needs.analyze-commits.outputs.version-next }}

docker-release:
  uses: wearefrank/ci-cd-templates/.github/workflows/docker-release-generic.yml@1
  needs: 
    - ci
  secrets:
    token: ${{ secrets.GITHUB_TOKEN }}
  with:
    image-artifact-backend: 'gh-artifacts'
    version: ${{ needs.analyze-commits.outputs.version-next }}
```

## Outputs
| Name | Value | Description |
|------|----------|----------------------------------|
| image-id | sha:4564sdf54sdf44sdf4sdf4ds4f4sdf | Image id of the built docker image |
| image-digest | sha:4564sdf54sdf44sdf4sdf4ds4f4sdf | Image digest of the built docker image |
| image-metadata | JSON structure | Image metadata of the built docker image |
| bake-file | JSON structure | Image bake-file definition |
| docker-meta-tags | string | Docker meta tags |
| docker-meta-labels | string | Docker meta labels |