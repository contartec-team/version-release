require('dotenv').load({
  silent: true
})

const { execSync, exec, spawnSync } = require('child_process')
const GitHub = require('github-base')
const {readFile, writeFile, ensureFile, removeSync} = require('fs-extra')
const semver = require('semver')
const {isUndefined} = require('lodash')
const analyzeCommit = require('@semantic-release/commit-analyzer/lib/analyze-commit')
const compareReleaseTypes = require('@semantic-release/commit-analyzer/lib/compare-release-types')
const DEFAULT_RELEASE_RULES = require('@semantic-release/commit-analyzer/lib/default-release-rules')
const writer = require('conventional-changelog-writer')
const conventionalChangelogAngular = require('conventional-changelog-angular')
const pkg = require('../package.json')
const getStream = require('get-stream')
const intoStream = require('into-stream')
const {add, commit, push} = require('@semantic-release/git/lib/git')
const branchName = require('current-git-branch')
const { exit } = require('process')

const PR_MESSAGE_FILENAME = 'pr_message.txt'

async function updateVerion() {
  try {
    await getPullRequestDescription()

    const parsedObjects = getParsedMessages()
    console.warn(`Parsed messages from pull request: ${JSON.stringify(parsedObjects)}`)

    const releaseType = getReleaseType(parsedObjects)

    if (releaseType) {
      const lastReleaseVersion = await getLastVersion()

      const nextReleaseVersion = semver.inc(lastReleaseVersion, releaseType)

      const changelogContext  = {
        version: nextReleaseVersion
      }

      const nextReleaseNotes = await generateNotes(changelogContext, parsedObjects)

      console.warn(`Notes generated: ${nextReleaseNotes}`)

      updatePackageJson(nextReleaseVersion)

      await generateChangelog(nextReleaseNotes)

      await commitVersionFiles(nextReleaseVersion)
    }
    else
      console.warn('No relevant change detected, the version will not be updated')
  }
  catch (error) {
    console.warn('Error while updating version: ', error)
    exit(1)
  }
}

function getParsedMessages() {
  const parsedResult = execSync(
    `cat ./${PR_MESSAGE_FILENAME} |  conventional-commits-parser ===`,
    { encoding : 'utf8' }
  )

  removeSync(`./${PR_MESSAGE_FILENAME}`)
  return JSON.parse(parsedResult)
}

function getReleaseType(commits) {
  let releaseType = null

  commits.forEach(commit => {
    let commitReleaseType

    if (isUndefined(commitReleaseType)) {
      commitReleaseType = analyzeCommit(DEFAULT_RELEASE_RULES, commit)
    }

    if (commitReleaseType && compareReleaseTypes(releaseType, commitReleaseType)) {
      releaseType = commitReleaseType
    }
  })

  if (releaseType)
    console.warn(`Release type detected: ${releaseType}`)

  return releaseType
}

function updatePackageJson(version) {
  console.warn('Write version %s to package.json', version)
  spawnSync(
    'npm',
    ['version', version, '--no-git-tag-version', '--allow-same-version']
  )
}

async function getPullRequestDescription() {
  const github = new GitHub({
    token: process.env.GH_TOKEN
  })

  const {body} = await github
    .get(`/repos/${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}/pulls?head=${process.env.CIRCLE_PROJECT_USERNAME}:${branchName()}`)


  if (!body || !body.length) {
    console.warn('No pull request found, exiting process')
    exit(1)
  }
  else if (body.length && body[0]) {
    const prMessage = body[0].body

    if (body[0].body == '') {
      console.warn('No description found on Pull Request')
      exit(1)
    }
    else
      await writeFile(`./${PR_MESSAGE_FILENAME}`,  prMessage)
  }
}

async function getLastVersion() {
  let lastVersion = pkg.version

  const github = new GitHub({
    token: process.env.GH_TOKEN
  })

  const { body } = await github
    .get(`/repos/${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}/releases/latest`)

  if (body) {
    console.warn('Getting last version from latest release')
    const tagName = body.tag_name

    lastVersion = semver.clean(tagName)
  }
  else
    console.warn('Getting last version from package.json')

  return lastVersion
}

async function generateChangelog(notes) {
  if (notes) {
    const changelogPath = 'CHANGELOG.md'
    await ensureFile(changelogPath)
    const currentFile = (await readFile(changelogPath)).toString().trim()

    if (currentFile) {
      console.warn('Update %s', changelogPath)
    } else {
      console.warn('Create %s', changelogPath)
    }

    const content = `${notes.trim()}\n${currentFile ? `\n${currentFile}\n` : ''}`

    await writeFile(changelogPath,  content)
  }
}

async function generateNotes(changelogContext, parsedCommits) {
  return await getStream(intoStream.object(parsedCommits)
    .pipe(writer(changelogContext, (await conventionalChangelogAngular).writerOpts)))
}

async function commitVersionFiles(nextReleaseVersion) {
  const GIT_AUTHOR_NAME = 'contartec'
  const GIT_AUTHOR_EMAIL = 'contartec@kajoo.com.br'

  await exec(`git config user.name ${GIT_AUTHOR_NAME}`)
  await exec(`git config user.email ${GIT_AUTHOR_EMAIL}`)

  const filesToCommit = ['package.json', 'CHANGELOG.md']
  await add(filesToCommit)
  console.warn('commited files: %o', filesToCommit)
  await commit(`chore(release): updating version to ${nextReleaseVersion} [skip ci]`)
  await push(`https://${process.env.GH_TOKEN}@github.com/${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}.git`, branchName())
}

module.exports = updateVerion