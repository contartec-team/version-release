require('dotenv').load({
  silent: true
})

const { pathExists } = require('fs-extra')
const { exec } = require('child_process')
const GitHub = require('github-base')
const { exit } = require('process')
const parseChangelog = require('changelog-parser')
const updateVersion = require('./update-version')

/**
 * Generates a release and publish the package
 */
async function releaseVersion() {
  try {
    const isChangelogFile = await pathExists('CHANGELOG.md')

    if (isChangelogFile) {
      const notesObject = await getLastNoteFromChangelog()

      const lastReleaseVersion = await updateVersion.getLastVersion()

      if (notesObject && ( lastReleaseVersion !=  notesObject.version)) {
        await generateRelease(notesObject)

        await exec('npm publish')
      }
      else
        console.warn('No changes between changelog last release and repository last release version, no release will be egenrated')
    }
    else
      console.warn('No changelog file found, no release will be generated')
  }
  catch (error) {
    console.warn('Error while releasing version: ', error)
    exit(1)
  }
}

/**
 * Gets the last release note from the changelog file
 *
 * @returns {Object} The release note object
 *
 * @example
 * {
 *   version: '1.0.0',
 *   title: '1.0.0 (dd-MM-YYYY)',
 *   body: '### Changes\n\n* Update API\n* Fix bug #1'
 * }
 */
async function getLastNoteFromChangelog() {
  let lastChangelogRelease = null

  const parsedChangelog = await parseChangelog('CHANGELOG.md')

  if (parsedChangelog && parsedChangelog.versions && parsedChangelog.versions.length && parsedChangelog.versions[0])
    lastChangelogRelease = parsedChangelog.versions[0]

  return lastChangelogRelease
}

/**
 * Generates a release from an release note object
 *
 * @param {Object} notesObject
 */
async function generateRelease(notesObject) {
  const github = new GitHub({
    token: process.env.GH_TOKEN
  })

  const release = {
    tag_name: `v${notesObject.version}`,
    name: `v${notesObject.version}`,
    body: `## ${notesObject.title}\n\n${notesObject.body}`,
    target_commitish: 'master',
    draft: false,
    prerelease: false
  }

  await github.post(`/repos/${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}/releases`, release)
}

module.exports = releaseVersion