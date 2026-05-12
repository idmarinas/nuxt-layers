import type { BranchInfo } from '../interfaces';

import fs from 'fs'
import path from 'path'

function isVersionGreater(
  current: { minor: number; patch: number },
  existing: { minor: number; patch: number }
): boolean {
  if (current.minor !== existing.minor) {
    return current.minor > existing.minor
  }
  return current.patch > existing.patch
}

/**
 * Extract all MAJOR.MINOR versions from the changelog directory
 * omitting the PATCH and sorted in descending order
 */
function getVersionsMajorMinor(changelogDir: string): string[] {
  const versions = new Map<string, string>() // { '1.0': '1.0.0', '1.1': '1.1.5', ... }

  try {
    const mainDirs = fs.readdirSync(changelogDir)

    for (const mainDir of mainDirs) {
      const mainPath = path.join(changelogDir, mainDir)
      const stats = fs.statSync(mainPath)

      // Solo procesar directorios
      if (!stats.isDirectory()) continue

      const files = fs.readdirSync(mainPath)

      for (const file of files) {
        if (!file.endsWith('.md') || file === 'index.md') continue

        // Extract version from file name (e.g 1_0_0.md or 1.0.0)
        const versionMatch = file.match(/^(\d+)(?:_|\.)(\d+)(?:_|\.)(\d+)\.md$/)
        if (!versionMatch) continue

        const [, majorText, minorText, patchText] = versionMatch
        const major = Number(majorText)
        const minor = Number(minorText)
        const patch = Number(patchText)
        const majorMinor = `${major}.${minor}`
        const fullVersion = `${major}.${minor}.${patch}`

        const existing = versions.get(majorMinor)
        if (!existing) {
          versions.set(majorMinor, fullVersion)
        } else {
          // Comparar versiones: mantener la más alta
          const [, , existingPatch] = existing.split('.').map(Number)
          if (patch! > existingPatch!) {
            versions.set(majorMinor, fullVersion)
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

/**
 * Extract branches info from the changelog directory.
 * Returns an object with branch name as key (e.g. "b1_x") and branch info as value.
 */
function getBranchesInfo(changelogDir: string = 'changelog'): Record<string, BranchInfo> {
  const branchMap = new Map<string, { release: string; minor: number; patch: number; date: string | null; count: number; labels: Set<string> }>()

  try {
    const mainDirs = fs.readdirSync(changelogDir)

    for (const mainDir of mainDirs) {
      const mainPath = path.join(changelogDir, mainDir)

      if (!fs.statSync(mainPath).isDirectory()) continue

      // "1.x" -> "b1_x"
      const branchKey = `b${mainDir.replace('.', '_')}`

      const files = fs.readdirSync(mainPath)

      for (const file of files) {
        if (!file.endsWith('.md') || file === 'index.md') continue

        const versionMatch = file.match(/^(\d+)(?:_|\.)(\d+)(?:_|\.)(\d+)\.md$/)
        if (!versionMatch) continue

        const [, majorText, minorText, patchText] = versionMatch
        const major = Number(majorText)
        const minor = Number(minorText)
        const patch = Number(patchText)
        const fullVersion = `${major}.${minor}.${patch}`

        // Leer fecha del frontmatter
        const filePath = path.join(mainPath, file)
        let date: string | null = null

        try {
          const content = fs.readFileSync(filePath, 'utf-8')
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
          if (frontmatterMatch) {
            const dateMatch = frontmatterMatch[1]!.match(/date:\s*(.+)/)
            if (dateMatch) {
              date = dateMatch[1]!.trim()
            }
          }
        } catch {
          console.warn(`No se pudo leer ${filePath}`)
        }

        const existing = branchMap.get(branchKey)

        const majorMinor = `${major}.${minor}`

        if (!existing) {
          branchMap.set(branchKey, { release: fullVersion, minor, patch, date, count: 1, labels: new Set([majorMinor]) })
          continue
        }

        // Incrementar contador siempre y añadir label
        existing.count++
        existing.labels.add(majorMinor)

        // Actualizar release si es una versión mayor
        if (isVersionGreater({ minor, patch }, existing)) {
          existing.release = fullVersion
          existing.minor = minor
          existing.patch = patch
          existing.date = date
        }
      }
    }

    // Convertir a objeto ordenado descendente y limpiar campos internos
    const result: Record<string, BranchInfo> = {}
    Array.from(branchMap.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .forEach(([key, { release, date, count, labels }]) => {
        // Ordenar labels descendente
        const sortedLabels = Array.from(labels).sort((a, b) => {
          const [aMajor, aMinor] = a.split('.').map(Number)
          const [bMajor, bMinor] = b.split('.').map(Number)
          if (aMajor !== bMajor) return bMajor! - aMajor!
          return bMinor! - aMinor!
        })
        result[key] = { release, date, count, labels: sortedLabels }
      })

    return result
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error leyendo directorio:', error.message)
    }
    return {}
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
  ]))
}

export { getVersionsMajorMinor, getBranchesInfo, parseLabelsForVersions }
