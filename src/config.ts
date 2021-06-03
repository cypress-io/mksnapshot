const { version } = require('../package.json')
import path from 'path'

const isWindows = process.platform === 'win32'

const projectRootDir = path.join(__dirname, '..')
const binDir = path.join(projectRootDir, 'bin')
const mksnapshotBinary = path.join(
  binDir,
  isWindows ? 'mksnapshot.exe' : 'mksnapshot'
)

const platform = process.env.npm_config_platform || process.platform
const targetArch = process.env.npm_config_arch || process.arch

const crossArchDirs = [
  'clang_x86_v8_arm',
  'clang_x64_v8_arm64',
  'win_clang_x64',
]

let v8ContextFile = 'v8_context_snapshot.bin'
if (platform === 'darwin') {
  if (targetArch === 'arm64') {
    v8ContextFile = 'v8_context_snapshot.arm64.bin'
  } else {
    v8ContextFile = 'v8_context_snapshot.x86_64.bin'
  }
}

class Config {
  constructor(
    readonly platform: string,
    readonly versionToDownload: string,
    readonly projectRootDir: string,
    readonly binDir: string,
    readonly mksnapshotBinary: string,
    readonly crossArchDirs: string[],
    readonly isWindows: boolean,
    readonly v8ContextFile: string,
    readonly archToDownload?: string
  ) {}
}

export const config = new Config(
  platform,
  process.env.MKSNAPSHOT_VERSION || version,
  projectRootDir,
  binDir,
  mksnapshotBinary,
  crossArchDirs,
  isWindows,
  v8ContextFile,
  process.env.npm_config_arch
)
