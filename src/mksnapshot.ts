import fs from 'fs-extra'
import { IOType, spawnSync } from 'child_process'

import { config } from './config'
import path from 'path'
import { track } from 'temp'
import { processArgsFromFile } from './process-args-from-file'

import debug from 'debug'
const logInfo = debug('snap:info')
const logDebug = debug('snap:debug')

const temp = track()
const workingDir = temp.mkdirSync('mksnapshot-workdir')
const { crossArchDirs, binDir, isWindows, v8ContextFile } = config

// TODO(thlorenz): this manual args parsing was copied from the original module and could be
// improved to use a proper args parser instead
const args = process.argv.slice(2)
if (args.length === 0 || args.includes('--help')) {
  console.error(
    'Usage: mksnapshot file.js (--output_dir OUTPUT_DIR).  ' +
      'Additional mksnapshot args except for --startup_blob are supported:'
  )
  args.push('--help')
}

// -----------------
// --startup_blob not supported
// -----------------
if (args.includes('--startup_blob')) {
  console.error(
    '--startup_blob argument not supported. Use --output_dir to specify where to output snapshot_blob.bin'
  )
  process.exit(1)
}

let mksnapshotArgs = args

// -----------------
// Output Dir
// -----------------
const outDirIdx = args.indexOf('--output_dir')
let outputDir = process.cwd()
if (outDirIdx > -1) {
  mksnapshotArgs = args.slice(0, outDirIdx)
  if (args.length >= outDirIdx + 2) {
    outputDir = args[outDirIdx + 1]
    if (args.length > outDirIdx + 2) {
      mksnapshotArgs = mksnapshotArgs.concat(args.slice(outDirIdx + 2))
    }
  } else {
    console.log(
      'Error! Output directory argument given but directory not specified.'
    )
    process.exit(1)
  }
}

// -----------------
// Prepare working dir
// -----------------

// Copy mksnapshot files to temporary working directory because
// v8_context_snapshot_generator expects to run everything from the same
// directory.
fs.copySync(binDir, workingDir)
const argsFilePath = path.join(binDir, 'mksnapshot_args')
const res = processArgsFromFile(
  argsFilePath,
  mksnapshotArgs,
  workingDir,
  crossArchDirs
)
const { mksnapshotBinaryDir, mksnapshotCommand } = res
mksnapshotArgs = res.mksnapshotArgs

// -----------------
// Run mksnapshot command to create snapshot_blob.bin
// -----------------
const stdio: IOType = 'inherit'
const snapshotBlobOptions = {
  cwd: mksnapshotBinaryDir,
  env: process.env,
  stdio,
}

logInfo('Generating snapshot_blob.bin')
logDebug({ mksnapshotBinaryDir, mksnapshotCommand, mksnapshotArgs })

const mksnapshotProcess = spawnSync(
  mksnapshotCommand,
  mksnapshotArgs,
  snapshotBlobOptions
)
if (mksnapshotProcess.status !== 0) {
  let code = mksnapshotProcess.status
  if (code == null) {
    code = 1
  }
  console.error('Error running mksnapshot.')
  process.exit(code)
}
if (args.includes('--help')) {
  process.exit(0)
}

// -----------------
// Copy resulting snapshot_blob binary
// -----------------
fs.copyFileSync(
  path.join(mksnapshotBinaryDir, 'snapshot_blob.bin'),
  path.join(outputDir, 'snapshot_blob.bin')
)

// -----------------
// Run v8_context_snapshot_generator to generate v8_context_snapshot.bin
// -----------------
const v8ContextGenCommand = path.join(
  mksnapshotBinaryDir,
  isWindows
    ? 'v8_context_snapshot_generator.exe'
    : 'v8_context_snapshot_generator'
)

const v8ContextGenArgs = [
  `--output_file=${path.join(outputDir, v8ContextFile)}`,
]

const v8ContextGenOptions = {
  cwd: mksnapshotBinaryDir,
  env: process.env,
  stdio,
}

logInfo(`Generating ${v8ContextFile}`)
const v8ContextGenProcess = spawnSync(
  v8ContextGenCommand,
  v8ContextGenArgs,
  v8ContextGenOptions
)
if (v8ContextGenProcess.status !== 0) {
  console.error(
    'Error running the v8 context snapshot generator.',
    v8ContextGenProcess
  )
  process.exit(v8ContextGenProcess.status ?? 1)
}

process.exit(0)
