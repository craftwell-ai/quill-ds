import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * True when the module at `moduleUrl` (pass `import.meta.url`) is the script node was asked to run.
 *
 * Compared as real file paths, never as strings: `import.meta.url` is the resolved path, so a script
 * reached through a symlink (macOS temp folders are one) or a folder with a space in its name (`%20`
 * in a URL) would otherwise never run, and exit 0 having done nothing.
 */
export function isMain(moduleUrl) {
  if (!process.argv[1]) return false
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(moduleUrl))
  } catch {
    return false
  }
}
