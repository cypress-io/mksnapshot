import test from 'tape'
import { attemptDownload } from '../src/mksnapshot-download'

{
  const version = '12.0.10'
  test(`download: providing  version ${version}`, async (t) => {
    const file = await attemptDownload(version, false)
    t.ok(
      file.startsWith('mksnapshot-v12.0.10'),
      `downloads correcly versioned ${file}`
    )
    t.end()
  })
}

{
  const version = '14.0.0-beta.3'
  test(`download: providing  version ${version}`, async (t) => {
    const file = await attemptDownload(version, false)
    t.ok(
      file.startsWith('mksnapshot-v14.0.0-beta.3'),
      `downloads correcly versioned ${file}`
    )
    t.end()
  })
}
