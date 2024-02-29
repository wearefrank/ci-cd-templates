# Next Reference
Generates a reference to use for when a version is not available or appropriate. 

Default behavior in order:
- Triggered by tag -> `<tag>`. Example: `v1.0.0`.
- Triggered by Pull-request -> `pr-<pr-number>`. Example: `pr-5`
- Otherwise -> `<branch>-<short-sha>`. Example: `feature-branch-1-9d2485a`

## Usage
``` yaml
- name: Next reference
  id: reference
  uses: wearefrank/ci-cd-templates/next-reference@1
```

## Scenario's
 [Echo next reference](#echo-next-reference)

### Echo next reference
``` yaml
- name: Checkout
  uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 #4.1.1

- name: Next reference
  id: reference
  uses: wearefrank/ci-cd-templates/next-reference@1

- name: Echo reference
  run: echo ${{ steps.reference.outputs.next-reference }}
```

## Outputs
| Name | Value | Description |
|------|----------|----------------------------------|
| next-reference | v1.0.0,<br> pr-5,<br> feature-branch-1-9d2485a | The generated reference.<br>_Default:<br> tag -> `<tag>`,<br>pull-request -> `pr-<pr-number>`,<br> otherwise -> `<branch>-<short-sha>`_ |