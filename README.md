# Module/Repo version release management

On top of [semantic-release](https://github.com/semantic-release/semantic-release)

## Install

`npm i --save-dev @contartec-team/version-release`

## Quick-start

```js
// package.json
...
"scripts": {
  ...
  "update-version": "node -e 'require(\"@contartec-team/version-release\").updateVersion()'",
  "release-version": "node -e 'require(\"@contartec-team/version-release\").releaseVersion()'"
  },
```

## Docs
