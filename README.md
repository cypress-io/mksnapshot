# mksnapshot [![](https://github.com/thlorenz/mksnapshot/workflows/Node/badge.svg?branch=master)](https://github.com/thlorenz/mksnapshot/actions)

A rewrite of [electron/mksnapshot](https://github.com/electron/mksnapshot) to support multiple
versions.

The main difference is that the _mksnapshot_ binary is not downloaded when installing this
module. 

Instead whenever it is run an electron version it should make a snapshot for can be
provided or is resolved from the electron installed relative to the root of your project.

If that version was downloaded previously it is used, otherwise the matching version is
downloaded before the _mksnapshot_ step runs.

## Example

```ts
const version = '12.0.10'
const args = [fullPathToSnapshot, '--output_dir', fullPathToOutputDir]
const { version, snapshotBlobFile, v8ContextFile } = await syncAndRun(
  version,
  args
)
assert.equal(version, providedVersion)
assert.equal(snapshotBlobFile, 'snapshot_blob.bin')
assert(v8ContextFile.startsWith('v8_context_snapshot'))
```

## LICENSE

MIT
