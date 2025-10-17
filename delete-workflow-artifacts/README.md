# Delete Workflow Artifacts
Deletes artifacts produced by the given workflow run, matching the provided artifact names or patterns. Artifact names can contain '?' for single character wildcards and '*' for multiple character wildcards.

The primary use for this action is to cleanup large artifacts produced in workflow runs, that are only used to pass data between jobs. These large artifacts count towards the artifact storage quota the longer they are kept.

## Required Permissions
Contents: read
Actions: write

## Usage
``` yaml
- uses: wearefrank/ci-cd-templates/delete-workflow-artifactsy@1
  with:
    # Comma-seperated list of artifact names uploaded in the target workflow run that should be deleted.
    # Supports wildcard patterns using `*` and `?` (e.g. `report-?, build-*`).
    artifact-names: 'pre-build-*, build-*'

    # Workflow run id of the workflow run that produced the artifacts to be deleted.
    workflow-run-id: '18588871822'

    # GitHub Token with permissions to delete artifacts in the target repository.
    #
    # Default: ${github.token}
    token: ${github.token}
```

## Scenario's
 [Cleanup Workflow Artifacts After Workflow Completion](#cleanup-workflow-artifacts-after-workflow-completion)

### Cleanup Workflow Artifacts After Workflow Completion
IMPORTANT: When using any workflow trigger that is triggered in some way by another workflow, extra care must be taken with tokens. The workflow **MUST** always use the token that is passed down from the triggering workflow. This is to prevent intentionally permissionless workflow runs to gain permissions indirectly via the triggered workflow. 

For example: When an external party creates a PR via a fork, the CI workflow would run with a permissionless token to prevent a malicious party to execute any code they want via the PR changes. If the triggered workflow uses a token with permissions, the malicious code would then have access to this token anyways once the triggered workflow runs. Not using the token passed down from the triggering workflow is comparable to just handing a token with near full permission to a malicious party. **ALWAYS** use `${{ github.token }}` and limit permissions to the bare minimum required with the `permissions` section of a job.
``` yaml
name: Post-run Cleanup 

on:
  workflow_run:
    workflows: [Continuous Integration, Release]
    types:
      - completed

jobs:
  delete-artifacts:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      actions: write
    steps:
      - name: Delete Artifacts
        uses: wearefrank/ci-cd-templates/delete-workflow-artifacts@v1
        with:
          token: ${{ github.token }}
          artifact-names: 'pre-build-*, build-*'
          workflow-run-id: ${{ github.event.workflow_run.id }}
```