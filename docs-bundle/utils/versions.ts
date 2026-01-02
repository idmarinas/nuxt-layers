import {readdirSync, statSync} from 'node:fs'
import {join} from 'pathe'

/**
 * Extract all MAJOR.MINOR versions from the changelog directory
 * omitting the PATCH and sorted in descending order
 */
function getVersionsMajorMinor(changelogDir: string): string[] {
  const versions = new Map<string, string>() // { '1.0': '1.0.0', '1.1': '1.1.5', ... }

  try {
    const mainDirs = readdirSync(changelogDir)

    for (const mainDir of mainDirs) {
      const mainPath = join(changelogDir, mainDir)
      const stats = statSync(mainPath)

      if (!stats.isDirectory()) continue

      const files = readdirSync(mainPath)

      for (const file of files) {
        if (!file.endsWith('.md') || file === 'index.md') continue

        // Extract version from file name (e.g., 1.0.0.md)
        const versionMatch = file.match(/^(\d+\.\d+\.\d+)\.md$/)
        if (!versionMatch) continue

        const fullVersion = versionMatch[1]
        const [major, minor, patch] = fullVersion!.split('.').map(Number)
        const majorMinor = `${major}.${minor}`

        const existing = versions.get(majorMinor)
        if (!existing) {
          versions.set(majorMinor, fullVersion!)
        } else {
          const [, , existingPatch] = existing.split('.').map(Number)
          if (patch! > existingPatch!) {
            versions.set(majorMinor, fullVersion!)
          }
        }
      }
    }

    // Convert to MAJOR.MINOR array and sort in descending order
    return Array.from(versions.keys())
      .sort((a: string, b: string): number => {
        const [aMajor, aMinor] = a.split('.').map(Number)
        const [bMajor, bMinor] = b.split('.').map(Number)

        if (aMajor !== bMajor) return bMajor! - aMajor!
        return bMinor! - aMinor!
      })
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error leyendo directorio:', error.message)
    }
    return []
  }
}

// Generate labels for each MAJOR.MINOR version.
function parseLabelsForVersions(dir: string) {
  const versions: string[] = getVersionsMajorMinor(dir)

  return Object.fromEntries(versions.map((version, index) => [
      `v${version.replace('.', '_')}`,
      {
        label: version,
        color: 0 === index ? 'primary' : 'secondary',
        icon: 'i-tabler-tag',
        tooltip: {
          arrow: true,
          delayDuration: 300,
          text: `New in version ${version}`,
        }
      }
    ])
  )
}

export {getVersionsMajorMinor, parseLabelsForVersions}
