import test from 'tape'
import { syncAndRun } from '../src/mksnapshot'

import { track } from 'temp'
import path from 'path'
const { mkdirSync } = track()

const projectRootDir = path.join(__dirname, '..', '..')
const fixturesDir = path.join(projectRootDir, 'test', 'fixtures')
const validSnapshot = path.join(fixturesDir, 'valid-snapshot.js')
const invalidSnapshot = path.join(fixturesDir, 'invalid-snapshot.js')
const outputDir = mkdirSync('test-thlorenz-mksnapshot')

{
  const providedVersion = '12.0.10'
  const args = [validSnapshot, '--output_dir', outputDir]
  test(`build: valid snapshot providing version ${providedVersion}`, async (t) => {
    const { version, snapshotBlobFile, v8ContextFile } = await syncAndRun(
      providedVersion,
      args
    )
    t.equal(version, providedVersion, 'version')
    t.equal(snapshotBlobFile, 'snapshot_blob.bin', 'snapshot blob file')
    t.ok(v8ContextFile.startsWith('v8_context_snapshot'), 'v8ContextFile')
    t.end()
  })
}

{
  const providedVersion = '12.0.10'
  const args = [invalidSnapshot, '--output_dir', outputDir]
  test(`build: invalid snapshot providing version ${providedVersion}`, async (t) => {
    try {
      await syncAndRun(providedVersion, args)
      t.fail('should fail making invalid snapshot')
    } catch (err) {
      t.ok(
        err.message.includes('Failed to create snapshot blob'),
        'fails with helpful error message'
      )
    } finally {
      t.end()
    }
  })
}

{
  const providedVersion = '14.0.0-beta.3'
  const args = [validSnapshot, '--output_dir', outputDir]
  test(`build: valid snapshot providing version ${providedVersion}`, async (t) => {
    const { version, snapshotBlobFile, v8ContextFile } = await syncAndRun(
      providedVersion,
      args
    )
    t.equal(version, providedVersion, 'version')
    t.equal(snapshotBlobFile, 'snapshot_blob.bin', 'snapshot blob file')
    t.ok(v8ContextFile.startsWith('v8_context_snapshot'), 'v8ContextFile')
    t.end()
  })
}
