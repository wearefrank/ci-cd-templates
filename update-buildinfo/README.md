# Update BuildInfo.properties
Updates the BuildInfo.properties file with the new version and datetime.
The file needs to be already present in order to update the content.

## Usage
``` yaml
- name: Update Instance BuildInfo.properties
  uses: wearefrank/ci-cd-templates/update-buildinfo@1
  with:
    # Path to the BuildInfo.properties file.
    path: 'src/main/resources/BuildInfo.properties'

    # New version to write to BuildInfo.properties.
    version: ''

    # Write the new version in the property `configuration.version` instead of `instance.version`.
    as-configuration-version: false
```

## Scenario's
 [Update Instance BuildInfo.properties and upload as artifact for use in new stage](#update-instance-buildinfoproperties-and-upload-as-artifact-for-use-in-new-stage)

### Update Instance BuildInfo.properties and upload as artifact for use in new stage
``` yaml
- name: Checkout
  uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 #4.1.1

- name: Update Instance BuildInfo.properties
  uses: wearefrank/ci-cd-templates/update-buildinfo@1
  with:
    path: src/main/resources/BuildInfo.properties
    version: '1.0.0'
  
- name: Upload Instance BuildInfo.properties
  uses: actions/upload-artifact@5d5d22a31266ced268874388b861e4b58bb5c2f3 #4.3.1
  with:
    name: pre-build-buildinfo
    path: ./*/main/resources/BuildInfo.properties # The '*' wildcard makes the artifact retain it's relative path when downloaded elsewhere
    retention-days: 1
```