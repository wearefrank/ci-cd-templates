# Continuous Integration Generic Workflow
A generic continuous integration workflow that updates the instance BuildInfo.properties and builds and tests a Docker container with the `docker-ci-generic` workflow. This workflow only requires a version or reference to be available before calling this workflow.

A GitHub PAT is not required as token.

## Usage
``` yaml
ci:
  uses: wearefrank/ci-cd-templates/.github/workflows/ci-generic.yml@1
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