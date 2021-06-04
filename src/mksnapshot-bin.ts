import { runMksnapshot } from './mksnapshot-run'

const args = process.argv.slice(2)

try {
  runMksnapshot(args)
  process.exit(0)
} catch (err) {
  console.error(err)
  process.exit(1)
}
