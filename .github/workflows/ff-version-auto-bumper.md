# F!F Version Auto Bumper Workflow
F!F version auto bumper workflow updates the Frank Framework version used in the project to the requested version (versions after 8.0.1). As default, the tag of the version is set to 'latest'.

The version tags are updated as default in `Dockerfile`, `frankrunner.properties` and `docker-compose.zaakbrug.dev.yml` files which are located under the root directory of the project. However, if the file names and directories are different than the default values in a project, then it can be changed by passing the new values in 'with' section below but by using the fixed property names.

It also checks if there is an update in the custom code `Parameter.java` file that is located in the directory 'src\main\java\org\frankframework\parameters'. This custom code is specific for Zaakbrug project.

The variables defined under `with` section below are optional. They all have default values and if any of the default values doesn't fit to a project then it will just be skipped. For example in Zaakbrug project, FF version tag is updated three different files, if a project needs to update in two files than the third one be skipped. It is not possible to update four files for now. The workflow will be updated to make it more dynamic and configurable in order to have a workflow independent from any project.

## Usage
``` yml
update-ff-version:
  uses: wearefrank/ci-cd-templates/.github/workflows/ff-version-auto-bumper.yml@main
  secrets:
    # GitHub token to be used. The default '${{ secrets.GITHUB_TOKEN }}' or '${{ secrets.GH_TOKEN }}' is enough.
    token: ${{ secrets.GITHUB_TOKEN }}

    # DockerHub username with read/write to login to DockerHub.
    dockerhub-username: ${{ secrets.DOCKERHUB_USERNAME }}

    # DockerHub token with read/write to login to DockerHub.
    dockerhub-token: ${{ secrets.DOCKERHUB_TOKEN }}
  with:
    # F!F version tag requested to update in your project to. It has to be after 8.0.1(including)
    # Default: 'latest'
    ff-version-tag: '8.2'

    # Project name. It doesn't have any effect on the process of the workflow, just informative.
    # Default: 'Zaakbrug'
    project-name: 'Zaakbrug'

    # Regex for Dockerfile is used to find the line which has the version of FF in Dockerfile.
    # Default: '^ARG FF_VERSION=.*' --> i.e used to find the line "ARG FF_VERSION=8.1.0-20240404.042328" in Dockerfile
    regex-for-dockerfile: '^ARG FF_VERSION=.*'

    # The line which will be substituted with the line found by regex in Dockerfile. This line includes only the variable name, the version tag will be added next to this variable later on depending on the requested FF version.
    # Default: 'ARG FF_VERSION='
    replacement-for-dockerfile: 'ARG FF_VERSION='

    # The path of the Dockerfile that has the FF version in the project repo.
    # Default: './Dockerfile' --> As default it is located in the root of the project.
    dockerfile-path: './Dockerfile'

    # Regex for frank-runner.properties is used to find the line which has the version of FF in frank-runner.properties file.
    # Default: '^ff.version=.*' --> i.e used to find the line "ff.version=8.1.0-20240404.042328" in frank-runner.properties file
    regex-for-frankrunnerproperties: '^ff.version=.*'

    # The line which will be substituted with the line found by regex in frank-runner.properties file. This line includes only the variable name, the version tag will be added next to this variable later on depending on the requested FF version.
    # Default: 'ff.version='
    replacement-for-frankrunnerproperties: 'ff.version='

    # The path of frank-runner.properties file that has the FF version in the project repo.
    # Default: './frank-runner.properties' --> As default it is located in the root of the project.
    frankrunnerproperties-path: './frank-runner.properties'

    # Regex for docker-compose is used to find the line which has the version of FF in docker-compose.yml file.
    # Default: 'FF_VERSION:\s\${FF_VERSION:-.*' --> i.e used to find the line "FF_VERSION: ${FF_VERSION:-8.1.0-20240404.042328}" in docker-compose file
    regex-for-dockercompose: 'FF_VERSION:\s\${FF_VERSION:-.*'

    # The line which will be substituted with the line found by regex in docker-compose.yml file. This line includes only the variable name, the version tag will be added next to this variable later on depending on the requested FF version.
    # Default: 'FF_VERSION: \${FF_VERSION:-'
    replacement-for-docker-compose: 'FF_VERSION: \${FF_VERSION:-'

    # The path of docker-compose file that has the FF version in the project repo.
    # Default: './docker-compose.zaakbrug.dev.yml' --> As default it is located in the root of the project.
    dockercompose-path: './docker-compose.zaakbrug.dev.yml'

    # The path of FrankConfig.xsd under the main folder in the project repo.
    # Default: './src/main'
    frankconfig-path: './src/main'

    # The path of FrankConfig.xsd under the configuration folder
    # Default: './src/main/configurations'
    frankconfig-path: './src/main/configurations'
```



