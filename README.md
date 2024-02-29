# CI/CD reusable workflows & GitHub actions

The purpose of these workflows an actions is to provide a maintainable way to reuse common ci/cd functionality.

GitHub actions:
- [frank-run-till-healthy](./frank-run-till-healthy/README.md)
    Runs the Docker container till the health endpoint returns 'HEALTHY', indicating that the database and adapters are all correctly started.

- [next-reference](./next-reference/README.md)
    Generates a reference to use for when a version is not available or appropriate.

- [update-buildinfo](./update-buildinfo/README.md)
    Updates the BuildInfo.properties file with the new version and datetime. The file needs to be already present in order to update the content.

GitHub reusable workflows:
- [ci-generic](./.github/workflows/ci-generic.md)
    A generic continuous integration workflow that updates the instance BuildInfo.properties and builds and tests a Docker container with the `docker-ci-generic` workflow. This workflow only requires a version or reference to be available before calling this workflow.

- [docker-ci-generic](./.github/workflows/docker-ci-generic.md)
    A generic continuous integration workflow for Docker that builds the Docker image and executes several tests. The Checkov Linter is ran on the Dockerfile to check for security issues and enforces Dockerfile best practices. The built image is also tested by running it and waiting for the Frank!Framework health endpoint to signal that all adapters started successfully.

- [docker-release-generic](./.github/workflows/docker-release-generic.md)
    Runs the Docker container till the health endpoint returns 'HEALTHY', indicating that the database and adapters are all correctly started.

