import fs from 'fs'
import { downloadArtifact } from '@electron/get'
import { config } from './config'
import extractZip from 'extract-zip'

import debug from 'debug'
const logInfo = debug('snap:info')
const logDebug = debug('snap:debug')

// -----------------
// Config
// -----------------
const { platform, versionToDownload, binDir, mksnapshotBinary } = config
let { archToDownload } = config

// -----------------
// Not supporting ARM architectures except Darwin
// -----------------
if (process.arch.startsWith('arm') && process.platform !== 'darwin') {
  console.error(
    `WARNING: mksnapshot does not run on ${process.arch}. Download 
     https://github.com/electron/electron/releases/download/v${versionToDownload}/mksnapshot-v${versionToDownload}-${process.platform}-${process.arch}-x64.zip
     on a x64 ${process.platform} OS to generate ${archToDownload} snapshots.`
  )
  process.exit(1)
}

// -----------------
// Correct arm to arm-x64
// -----------------
if (
  archToDownload != null &&
  archToDownload.startsWith('arm') &&
  process.platform !== 'darwin'
) {
  archToDownload += '-x64'
}

logInfo({
  platform,
  versionToDownload,
  archToDownload,
  binDir,
  mksnapshotBinary,
})

// -----------------
// Download
// -----------------
function download(version: string) {
  return downloadArtifact({
    version,
    artifactName: 'mksnapshot',
    platform,
    arch: archToDownload,
  })
}

async function attemptDownload(version: string, tryingBaseVersion: boolean) {
  try {
    const zipPath = await download(version)
    await extractZip(zipPath, { dir: binDir })
    if (platform !== 'win32') {
      if (fs.existsSync(mksnapshotBinary)) {
        fs.chmod(mksnapshotBinary, '755', function (error) {
          if (error != null) throw error
        })
      }
    }
  } catch (err) {
    // If the version was not supplied, but taken from the `package.json` version then
    // a mksnapshot version for it may not be available.
    // The below tries to remove the patch number and download the version that
    // matches `major.minor.0`
    const parts = version.split('.')
    const baseVersion = `${parts[0]}.${parts[1]}.0`
    logDebug(
      `Failed to download ${version}, falling back to semver minor ${baseVersion}`
    )

    if (tryingBaseVersion) {
      throw err
    }
    await attemptDownload(baseVersion, true)
  }
}

attemptDownload(versionToDownload, false)
