# Module/Repo version release management

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