import fs from 'fs'
import path from 'path'

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

        // Extract version from file name (e.g 1_0_0.md)
        const versionMatch = file.match(/^(\d+)_(\d+)_(\d+)\.md$/)
        if (!versionMatch) continue

        const [, major, minor, patch] = versionMatch.map(Number)
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
 * Extrae versiones MAJOR con la fecha de la última release
 * Devuelve un objeto con MAJOR como clave y fecha como valor
 */
function getVersionsMajorWithDate(changelogDir: string = 'changelog'): Record<string, string> {
  const majorVersions = new Map<string, { date: string | null }>()

  try {
    const mainDirs = fs.readdirSync(changelogDir)

    for (const mainDir of mainDirs) {
      const mainPath = path.join(changelogDir, mainDir)
      const stats = fs.statSync(mainPath)

      if (!stats.isDirectory()) continue

      const files = fs.readdirSync(mainPath)

      for (const file of files) {
        if (!file.endsWith('.md') || file === 'index.md') continue

        const versionMatch = file.match(/^(\d+)_(\d+)_(\d+)\.md$/)
        if (!versionMatch) continue

        const [, majorStr, minorStr, patchStr] = versionMatch
        const major = Number(majorStr)
        const minor = Number(minorStr)
        const patch = Number(patchStr)

        // Leer el archivo para obtener la fecha del frontmatter
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
        } catch (error) {
          console.warn(`No se pudo leer ${filePath}`)
        }

        const majorKey = String(major)

        // Guardar o actualizar si es una versión más reciente
        const existing = majorVersions.get(majorKey)
        if (!existing) {
          majorVersions.set(majorKey, {date})
        } else {
          // Comparar versiones: mantener la más nueva (mayor minor o patch)
          // Si no tenemos fecha, usar la que encontremos
          if (existing.date === null && date !== null) {
            majorVersions.set(majorKey, {date})
          }
        }
      }
    }

    // Convertir a objeto y ordenar por MAJOR descendente
    const result: Record<string, string> = {}
    const sortedKeys = Array.from(majorVersions.keys())
      .map(Number)
      .sort((a, b) => b - a)
      .map(String)

    for (const key of sortedKeys) {
      const data = majorVersions.get(key)
      if (data?.date) {
        result[key] = data.date
      }
    }

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
    ])
  )
}

export {getVersionsMajorMinor, getVersionsMajorWithDate, parseLabelsForVersions}
