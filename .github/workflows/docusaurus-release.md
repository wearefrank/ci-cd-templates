# Docusaurus Release Workflow
A generic release workflow for publishing a Docusaurus documentation website to GitHub Pages.

### Requirements
- `GitHub -> Repository -> Pages -> Build and deployment` **source** set to `GitHub Actions`.
- `GitHub -> Repository -> Environments` environment created with the name `github-pages`.

## Usage
``` yaml
docusaurus-release:
  uses: wearefrank/ci-cd-templates/.github/workflows/docusaurus-release.yml@1
  with:
    # GitHub environment name that should be used to deploy Docusaurus to.
    # Default: `github-pages`.
    github-environment: 'github-pages'

    # (Sub)directory containing the root of the Docusaurus project.
    # Default: `./docusaurus`.
    docusaurus-dir: './docusaurus'
```

## Outputs
| Name | Value | Description |
|------|----------|----------------------------------|
| docusaurus-url | https://wearefrank.github.io/<repo-name>/ | Url to the Docusaurus GitHub Pages deployment |
