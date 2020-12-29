# Module/Repo version release management

[![CircleCI](https://circleci.com/gh/contartec-team/version-release.svg?style=shield&circle-token=212d9742083324692ea34628b8e16917e16bdf41)](https://circleci.com/gh/contartec-team/version-release)
[![Maintainability](https://api.codeclimate.com/v1/badges/5b1a0d93d441d24d713a/maintainability)](https://codeclimate.com/github/contartec-team/version-release/maintainability)
[![deepcode](https://www.deepcode.ai/api/gh/badge?key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF0Zm9ybTEiOiJnaCIsIm93bmVyMSI6ImNvbnRhcnRlYy10ZWFtIiwicmVwbzEiOiJ2ZXJzaW9uLXJlbGVhc2UiLCJpbmNsdWRlTGludCI6ZmFsc2UsImF1dGhvcklkIjoxNzMyOCwiaWF0IjoxNjA5MjQ4NDY0fQ.Tbx0fGmxsGb56SsYId8-e1myKJh2km8hcX02RCPCkWc)](https://www.deepcode.ai/app/gh/contartec-team/version-release/_/dashboard?utm_content=gh%2Fcontartec-team%2Fversion-release)

On top of [semantic-release](https://github.com/semantic-release/semantic-release)

## Install

`npm i -D @contartec-team/version-release`

## How-to

### 1/3

Modify `package.json`:

```js
// package.json
...
"scripts": {
  ...
  "update-version": "node -e 'require(\"@contartec-team/version-release\").updateVersion()'",
  "release-version": "node -e 'require(\"@contartec-team/version-release\").releaseVersion()'"
}
```

### 2/3

Create a PR and run `npm run update-version`, the script will:

- Update `package.json` version's (based on PR's msg);
- Generate/Update the `CHANGELOG.md` (also based on/with the PR's msg);
- Commit the change (`package.json` and `CHANGELOG.md`) to remote on its associated branch.

### 3/3

Merge the PR (remember to remove `[skip ci]` text from the final PR's msg) and run `npm run release-version`, then it upload on `remote`:

- A `tag` with `package.json`'s version as its name;
- A `release` based on `tag` and `CHANGELOG.md` (https://docs.github.com/en/free-pro-team@latest/github/administering-a-repository/about-releases)
- (if enabled) A `npm package`

For now, it only works on `CircleCI` and `Github` as repo.

## Development

Depending on what, create a `pr_message.txt` to fake a PR msg and `.env` to set the `CircleCI` env vars.

## Roadmap

- Add tests;
- Add `Bitbucket` support;
- Add executalbe (bash script, most likely) to run directly as `npm run` instead `node -e 'require(\"@contartec-team/version-release\").updateVersion()'`.

## Docs

https://contartec-team.github.io/version-release/