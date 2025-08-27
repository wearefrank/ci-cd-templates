[![conventional commits](https://img.shields.io/badge/conventional%20commits-1.0.0-yellow.svg)](https://conventionalcommits.org) [![semantic versioning](https://img.shields.io/badge/semantic%20versioning-2.0.0-green.svg)](https://semver.org)

## [2.0.5](https://github.com/wearefrank/ci-cd-templates/compare/v2.0.4...v2.0.5) (2025-08-27)

### 🐛 Bug Fixes

* execute soapui-testrunner workflow teardown script when soapui tests fail aswell ([309eb5c](https://github.com/wearefrank/ci-cd-templates/commit/309eb5cee1d4b5095fbc7202e7a1efb7eee372cb))

## [2.0.4](https://github.com/wearefrank/ci-cd-templates/compare/v2.0.3...v2.0.4) (2025-07-21)

### 🤖 Build System

* **dependencies:** bump the github-actions group across 1 directory with 12 updates ([#53](https://github.com/wearefrank/ci-cd-templates/issues/53)) ([be8e112](https://github.com/wearefrank/ci-cd-templates/commit/be8e112f5c46191187068d97d5a699efc678b805))

## [2.0.3](https://github.com/wearefrank/ci-cd-templates/compare/v2.0.2...v2.0.3) (2025-06-30)

### 🐛 Bug Fixes

* add registry to image tag ([a0ae52e](https://github.com/wearefrank/ci-cd-templates/commit/a0ae52e285f839b6b952ec8526fe9b3bbb9bf27e))

## [2.0.2](https://github.com/wearefrank/ci-cd-templates/compare/v2.0.1...v2.0.2) (2025-05-20)

### 🤖 Build System

* **dependencies:** lock soapui-testrunner action to commit hash ([cec7d4d](https://github.com/wearefrank/ci-cd-templates/commit/cec7d4db55523dc751e9c7ffdab8260dd2b2410b))

## [2.0.1](https://github.com/wearefrank/ci-cd-templates/compare/v2.0.0...v2.0.1) (2025-05-20)

### 🧑‍💻 Code Refactoring

* soapui-runner configurable testreport artifact name ([8e19477](https://github.com/wearefrank/ci-cd-templates/commit/8e1947770751815c69cf5ef4f178e1ed188e5cfc))

## [2.0.0](https://github.com/wearefrank/ci-cd-templates/compare/v1.4.2...v2.0.0) (2025-04-11)

### ⚠ BREAKING CHANGES

* docker-release-generic inputs 'dockerhub-username' and 'dockerhub-password' renamed to 'registry-username' and 'registry-token'. Default registry changed from DockerHub to GitHub Packages. To get the old behavior, set 'registry-prefix: docker.io'.

### 🍕 Features

* support pushing Docker images to GitHub image registry ([#55](https://github.com/wearefrank/ci-cd-templates/issues/55)) ([dcc2ebd](https://github.com/wearefrank/ci-cd-templates/commit/dcc2ebd6658cd1bd7b3b78fc97f6e3bc6f0d6ba0))

## [1.4.2](https://github.com/wearefrank/ci-cd-templates/compare/v1.4.1...v1.4.2) (2025-04-04)

### 🤖 Build System

* **dependencies:** lock soapui-testrunner action call to comit sha ([b645321](https://github.com/wearefrank/ci-cd-templates/commit/b645321683c686e157c9064d7167c48dfe399bbb))

## [1.4.1](https://github.com/wearefrank/ci-cd-templates/compare/v1.4.0...v1.4.1) (2025-04-04)

### 🐛 Bug Fixes

* command to show loaded docker images uses "docker ps" instead of "docker images" ([a39ff21](https://github.com/wearefrank/ci-cd-templates/commit/a39ff213decd35421d6437215394dcc0412ae141))
* image-name is unintentionally required while not needed when image-id is provided ([979e2d0](https://github.com/wearefrank/ci-cd-templates/commit/979e2d04f5947a647b7fd38a5412a713f948f15d))
* soapui testrunner action PROJECT_DIR and REPORTS_DIR eval vars due to GHA adding invisible quotes ([b9c0de3](https://github.com/wearefrank/ci-cd-templates/commit/b9c0de3caad75fb662139e0a93fc3b875b3a3e0c))

## [1.4.0](https://github.com/wearefrank/ci-cd-templates/compare/v1.3.0...v1.4.0) (2025-01-28)

### 🍕 Features

* ff version bumper workflow cleans up superseded PR's and branches ([9e8bac0](https://github.com/wearefrank/ci-cd-templates/commit/9e8bac0f0033b7a4e491f5cead601b89060b1c99))

### 🐛 Bug Fixes

* ff version bumper format PR title with conventional commit tag instead of using the branch name ([6b4996c](https://github.com/wearefrank/ci-cd-templates/commit/6b4996ca7899e8ada98fd94878ee41ce18b52531))

### 🤖 Build System

* **dependencies:** bump the github-actions group across 1 directory with 5 updates ([92950de](https://github.com/wearefrank/ci-cd-templates/commit/92950ded1465e27d2082ba9220d46d93225447a9))

## [1.3.0](https://github.com/wearefrank/ci-cd-templates/compare/v1.2.0...v1.3.0) (2025-01-22)

### 🍕 Features

* soapui testrunner reusable workflow ([#45](https://github.com/wearefrank/ci-cd-templates/issues/45)) ([691e0f5](https://github.com/wearefrank/ci-cd-templates/commit/691e0f5f4eeb6e892a1a077989f015a3544ff13c))

## [1.2.0](https://github.com/wearefrank/ci-cd-templates/compare/v1.1.0...v1.2.0) (2025-01-22)

### 🍕 Features

* soapui testrunner github action ([#44](https://github.com/wearefrank/ci-cd-templates/issues/44)) ([3fbf42b](https://github.com/wearefrank/ci-cd-templates/commit/3fbf42b490466e1ce3302448fb13ad5a4f7a61b8))

## [1.1.0](https://github.com/wearefrank/ci-cd-templates/compare/v1.0.15...v1.1.0) (2025-01-22)

### 🍕 Features

* wait till healthy container github action ([#42](https://github.com/wearefrank/ci-cd-templates/issues/42)) ([751212f](https://github.com/wearefrank/ci-cd-templates/commit/751212f93545daa556e6426ce4c3233c190fe144))

## [1.0.15](https://github.com/wearefrank/ci-cd-templates/compare/v1.0.14...v1.0.15) (2025-01-10)

### 🤖 Build System

* **dependencies:** bump the github-actions group with 5 updates ([d56027a](https://github.com/wearefrank/ci-cd-templates/commit/d56027afeed2e5fe54b3c9a79c77ba6e1ea621f4))

## [1.0.14](https://github.com/wearefrank/ci-cd-templates/compare/v1.0.13...v1.0.14) (2025-01-06)

### 🤖 Build System

* **dependencies:** bump the github-actions group across 1 directory with 4 updates ([fba16d0](https://github.com/wearefrank/ci-cd-templates/commit/fba16d0490bc9e15213f3c61cd7bc720fbf7e8cd))

## [1.0.13](https://github.com/wearefrank/ci-cd-templates/compare/v1.0.12...v1.0.13) (2024-12-19)

### 🤖 Build System

* **dependencies:** bump the github-actions group across 1 directory with 2 updates ([568f7aa](https://github.com/wearefrank/ci-cd-templates/commit/568f7aa928702a1b1a76e3132a38de0bd34ae758))

## [1.0.12](https://github.com/wearefrank/ci-cd-templates/compare/v1.0.11...v1.0.12) (2024-12-02)

### 🤖 Build System

* **dependencies:** bump the github-actions group across 1 directory with 5 updates ([#33](https://github.com/wearefrank/ci-cd-templates/issues/33)) ([03612e9](https://github.com/wearefrank/ci-cd-templates/commit/03612e9ed88cb9f77795b72ffc2c2f410553721f))

## [1.0.11](https://github.com/wearefrank/ci-cd-templates/compare/v1.0.10...v1.0.11) (2024-10-28)

### 🐛 Bug Fixes

* ff-version-auto-bumper workflow pr creation failing due to wrong branchname ([b97427b](https://github.com/wearefrank/ci-cd-templates/commit/b97427b39fe8061454cea75de44bc48db959c503))

### 🤖 Build System

* **dependencies:** bump the github-actions group across 1 directory with 4 updates ([#28](https://github.com/wearefrank/ci-cd-templates/issues/28)) ([86dec0a](https://github.com/wearefrank/ci-cd-templates/commit/86dec0a9dd529fdd832407f0553b2fc937317206))

## [1.0.10](https://github.com/wearefrank/ci-cd-templates/compare/v1.0.9...v1.0.10) (2024-10-16)

### 🤖 Build System

* **dependencies:** bump the github-actions group across 1 directory with 7 updates ([4e77754](https://github.com/wearefrank/ci-cd-templates/commit/4e7775463e2136e791fa734d0968ef865bccfe1f))

## [1.0.9](https://github.com/wearefrank/ci-cd-templates/compare/v1.0.8...v1.0.9) (2024-09-13)

### 🤖 Build System

* **dependencies:** bump the github-actions group with 2 updates ([9ece1f8](https://github.com/wearefrank/ci-cd-templates/commit/9ece1f80f7bc2ee59b0d6b21e0bf92c913b87263))

## [1.0.8](https://github.com/wearefrank/ci-cd-templates/compare/v1.0.7...v1.0.8) (2024-09-09)

### 🤖 Build System

* **dependencies:** bump the github-actions group with 2 updates ([b4a68ed](https://github.com/wearefrank/ci-cd-templates/commit/b4a68ed2aca42f7b1ff926bd32547179931ae24a))

## [1.0.7](https://github.com/wearefrank/ci-cd-templates/compare/v1.0.6...v1.0.7) (2024-08-30)

### 🤖 Build System

* **dependencies:** bump the github-actions group across 1 directory with 2 updates ([#19](https://github.com/wearefrank/ci-cd-templates/issues/19)) ([067eb8b](https://github.com/wearefrank/ci-cd-templates/commit/067eb8b501be0b37663ed3a9d360941a49852cdb))

## [1.0.6](https://github.com/wearefrank/ci-cd-templates/compare/v1.0.5...v1.0.6) (2024-08-20)

### 🐛 Bug Fixes

* print docker debugging commands step not triggered on failure ([9f7329f](https://github.com/wearefrank/ci-cd-templates/commit/9f7329fafc0db4c30178461682333ac50c10dd92))

### 🤖 Build System

* **dependencies:** bump the github-actions group across 1 directory with 3 updates ([#17](https://github.com/wearefrank/ci-cd-templates/issues/17)) ([e047286](https://github.com/wearefrank/ci-cd-templates/commit/e047286902d357e0807cfe8b83a61d664d780daf))

## [1.0.5](https://github.com/wearefrank/ci-cd-templates/compare/v1.0.4...v1.0.5) (2024-08-13)

### 🤖 Build System

* **dependencies:** bump the github-actions group across 1 directory with 8 updates ([#15](https://github.com/wearefrank/ci-cd-templates/issues/15)) ([08003cf](https://github.com/wearefrank/ci-cd-templates/commit/08003cfd5f745327fdc801585ba1a8cc07e567b1))

## [1.0.4](https://github.com/wearefrank/ci-cd-templates/compare/v1.0.3...v1.0.4) (2024-07-19)

### 🐛 Bug Fixes

* ff-version-auto-bumper missing semantic release tag in PR title ([6a4c140](https://github.com/wearefrank/ci-cd-templates/commit/6a4c140739b91e84cc2cc640e686d8f13fc09c30))

## [1.0.3](https://github.com/wearefrank/ci-cd-templates/compare/v1.0.2...v1.0.3) (2024-07-15)

### 🤖 Build System

* **dependencies:** bump the github-actions group across 1 directory with 8 updates ([#11](https://github.com/wearefrank/ci-cd-templates/issues/11)) ([4a55871](https://github.com/wearefrank/ci-cd-templates/commit/4a5587101272cc6403df96c3d58468aad81cacb5))

## [1.0.2](https://github.com/wearefrank/ci-cd-templates/compare/v1.0.1...v1.0.2) (2024-07-01)

### 🤖 Build System

* **dependencies:** bump the github-actions group across 1 directory with 8 updates ([5771727](https://github.com/wearefrank/ci-cd-templates/commit/5771727039334cf9149df7ae54455e106ae57216))

## [1.0.1](https://github.com/wearefrank/ci-cd-templates/compare/v1.0.0...v1.0.1) (2024-06-27)

### 🔁 Continuous Integration

* initial semantic release with actionlint ([#7](https://github.com/wearefrank/ci-cd-templates/issues/7)) ([069f427](https://github.com/wearefrank/ci-cd-templates/commit/069f427ff55ad6d8625187b81d4d2c151351e296))
