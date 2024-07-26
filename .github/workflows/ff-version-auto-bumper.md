# F!F Version Auto Bumper Workflow
F!F version auto bumper workflow updates the Frank Framework version used in the project to the requested version (versions after 8.0.1). As default, the tag of the version is set to 'latest'.

The version tags are updated as default in `Dockerfile`, `frankrunner.properties` and `docker-compose.zaakbrug.dev.yml` files which are located under the root directory of the project. However, if the file names and directories are different than the default values in a project, then it can be changed by passing the new values in 'with' section below but by using the fixed variable names. There are also toggles for each file to turn on or off the update so if any of these files are not wanted to be updated then set the toggle false for the relevant file. Shown in the usage below.

It also checks if there is an update in the custom code `Parameter.java` file that is located in the directory 'src\main\java\org\frankframework\parameters'. This custom code is specific for Zaakbrug project.

The variables defined under `with` section below are optional. They all have default values and if any of the default values doesn't fit to a project then it will just be skipped. For example in Zaakbrug project, F!F version tag is updated three different files; if a project needs to update F!F version in two files then the third one will be skipped lest to have an error. It is not possible to update four or more files for now. The workflow will be updated to make it more dynamic and configurable in order to have a workflow independent from any project to be able to update the F!F version in as many files as wanted.

**WARNING: The GitHub token must be PAT(Personal Access Token) due to permission issues with automatically running CI in the created PR. A workaround when not using a PAT is to close and reopen the PR.**

## Usage
``` yml
update-ff-version:
  uses: wearefrank/ci-cd-templates/.github/workflows/ff-version-auto-bumper.yml@e073950d36ffdeb9f018b14b2ca0c13449825b2f # 1.0.3
  secrets:
    # GitHub token to be used. Needs to be a PAT due to permission issues with automatically running CI in the created PR.
    token: ${{ secrets.GITHUB_TOKEN }}

    # DockerHub username with read/write to login to DockerHub.
    dockerhub-username: ${{ secrets.DOCKERHUB_USERNAME }}

    # DockerHub token with read/write to login to DockerHub.
    dockerhub-token: ${{ secrets.DOCKERHUB_TOKEN }}
  with:
    # F!F version tag requested to update in your project to. It has to be after 8.0.1(including)
    # Default: 'latest'
    ff-version-tag: '8.1'

    # Regex for Dockerfile is used to find the line which has the version of FF in Dockerfile.
    # Default: '^ARG FF_VERSION=.*' --> i.e used to find the line "ARG FF_VERSION=***********" in Dockerfile
    regex-for-dockerfile: '^ARG FF_VERSION=.*'

    # The line which will be substituted with the line found by regex in Dockerfile. This line includes only the variable name, the version tag will be added next to this variable later on depending on the requested FF version.
    # Default: 'ARG FF_VERSION='
    replacement-for-dockerfile: 'ARG FF_VERSION='

    # The path of the Dockerfile that has the FF version in the project repo.
    # Default: './Dockerfile' --> As default it is located in the root of the project.
    dockerfile-path: './Dockerfile'

    # The toggle for Dockerfile. If not want to update F!F version in it then set false.
    # Default: true
    update-dockerfile-enabled: true/false

    # Regex for frank-runner.properties is used to find the line which has the version of FF in frank-runner.properties file.
    # Default: '^ff.version=.*' --> i.e used to find the line "ff.version=***********" in frank-runner.properties file
    regex-for-frankrunnerproperties: '^ff.version=.*'

    # The line which will be substituted with the line found by regex in frank-runner.properties file. This line includes only the variable name, the version tag will be added next to this variable later on depending on the requested FF version.
    # Default: 'ff.version='
    replacement-for-frankrunnerproperties: 'ff.version='

    # The path of frank-runner.properties file that has the FF version in the project repo.
    # Default: './frank-runner.properties' --> As default it is located in the root of the project.
    frankrunnerproperties-path: './frank-runner.properties'

    # The toggle for frankrunner.properties file. If not want to update F!F version in it then set false.
    # Default: true
    update-frankrunnerproperties-enabled: true/false

    # Regex for docker-compose is used to find the line which has the version of FF in docker-compose.yml file.
    # Default: 'FF_VERSION:\s\${FF_VERSION:-.*' --> i.e used to find the line "FF_VERSION: ${FF_VERSION:-***********}" in docker-compose file
    regex-for-dockercompose: 'FF_VERSION:\s\${FF_VERSION:-.*'

    # The line which will be substituted with the line found by regex in docker-compose.yml file. This line includes only the variable name, the version tag will be added next to this variable later on depending on the requested FF version.
    # Default: 'FF_VERSION: \${FF_VERSION:-'
    replacement-for-docker-compose: 'FF_VERSION: \${FF_VERSION:-'

    # The path of docker-compose file that has the FF version in the project repo.
    # Default: './docker-compose.zaakbrug.dev.yml' --> As default it is located in the root of the project.
    dockercompose-path: './docker-compose.zaakbrug.dev.yml'

    # The toggle for docker-compose.yml file. If not want to update F!F version in it then set false.
    # Default: true
    update-dockercompose-enabled: true/false

    # The path of the configurations folder to be able to reach and update all the FrankConfig.xsd files besides it, within it and in its subfolders
    # Default: './src/main/configurations'
    configurations-folder-path: './src/main/configurations'

    # The toggle for FrankConfig.xsd files. If not want to update FrankConfig files in the project then set false.
    # Default: true
    update-frankconfig-enabled: true/false

    # The toggle for custom files. This is special for Zaakbrug project to update the Parameter.java-orig file. If not want to update this file then set false.
    # Default: false
    update-customcode-enabled: true/false
```

## Scenario's
 [Automatically bump the Frank!Framework version on a weekly basis](#automatically-bump-the-frank!framework-version-on-a-weekly-basis)

### Automatically bump the Frank!Framework version on a weekly basis
``` yaml
name: Bump F!F Version

on:
  workflow_dispatch:
    schedule:
      - cron: '0 5 * * 1' # At 05:00 on Monday.
    inputs:
      ff-version-tag:
        description: 'F!F version tag requested to update in your project to. It has to be after 8.0.1(including).'    
        required: true
        default: 'latest'

jobs:
  bump-ff-version:
    uses: wearefrank/ci-cd-templates/.github/workflows/ff-version-auto-bumper.yml@e073950d36ffdeb9f018b14b2ca0c13449825b2f # 1.0.3
    secrets:
      token: ${{ secrets.PAT_TOKEN }} # Needs to be a PAT due to permission issues with automatically running CI in the created PR.
      dockerhub-username: ${{ secrets.DOCKERHUB_USERNAME }}
      dockerhub-token: ${{ secrets.DOCKERHUB_TOKEN }}
    with:
      ff-version-tag: ${{ github.event.inputs.ff-version-tag || 'latest' }}
```
