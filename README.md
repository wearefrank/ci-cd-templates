# CI/CD reusable workflows & GitHub actions

The purpose of these workflows an actions is to provide a maintainable way to reuse common ci/cd functionality.

## GitHub actions
- [delete-workflow-artifacts](./delete-workflow-artifacts/README.md)
    Deletes artifacts produced by the given workflow run, matching the provided artifact names or patterns. Artifact names can contain '?' for single character wildcards and '*' for multiple character wildcards.

- [frank-run-till-healthy](./frank-run-till-healthy/README.md)
    Runs the Docker container till the health endpoint returns 'HEALTHY', indicating that the database and adapters are all correctly started.

- [next-reference](./next-reference/README.md)
    Generates a reference to use for when a version is not available or appropriate.

- [update-buildinfo](./update-buildinfo/README.md)
    Updates the BuildInfo.properties file with the new version and datetime. The file needs to be already present in order to update the content.

- [soapui-testrunner](./soapui-testrunner/README.md)
    Runs tests in a SoapUI and generates a report with the test results. Optionally a .properties file can be provided to set CI specific property values.

- [wait-till-healthy-container](./wait-till-healthy-container/README.md)
    A more robust and flexible alternative to the **frank-run-till-healthy** action. Starting the container is left to other parts of the workflow with whatever method is prefered. This action simply waits till a Docker container running on the Docker host, returns a 'HEALTHY' health probe result.

## GitHub reusable workflows
- [ci-generic](./.github/workflows/ci-generic.md)
    A generic continuous integration workflow that updates the instance BuildInfo.properties and builds and tests a Docker container with the `docker-ci-generic` workflow. This workflow only requires a version or reference to be available before calling this workflow.

- [docker-ci-generic](./.github/workflows/docker-ci-generic.md)
    A generic continuous integration workflow for Docker that builds the Docker image and executes several tests. The Checkov Linter is ran on the Dockerfile to check for security issues and enforces Dockerfile best practices. The built image is also tested by running it and waiting for the Frank!Framework health endpoint to signal that all adapters started successfully.

- [docker-release-generic](./.github/workflows/docker-release-generic.md)
    Runs the Docker container till the health endpoint returns 'HEALTHY', indicating that the database and adapters are all correctly started.

- [docusaurus-release](./.github/workflows/docusaurus-release.md)
    A generic release workflow for publishing a Docusaurus documentation website to GitHub Pages.

- [ff-version-auto-bumper](./.github/workflows/ff-version-auto-bumper.md)
    F!F version auto bumper workflow updates the Frank Framework version used in the project to the requested version (versions after 8.0.1). As default, the tag of the version is set to 'latest'.
    The version tags are updated by default in `Dockerfile` and `frankrunner.properties`.

- [soapui-testrunner](./.github/workflows/soapui-testrunner.md)
    Runs tests in a SoapUI and generates a report with the test results. The application/environment under test can be brought up with a 'Setup' script and cleaned up afterwards with a 'Teardown' script.
    After the 'Setup' script has been executed, the workflow will wait for the container's health endpoint to report 'Healthy'. Once the container is heathy, the SoapUI TestRunner will be executed.
