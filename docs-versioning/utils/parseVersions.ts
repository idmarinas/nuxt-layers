import type {Release} from './githubRelease'

// Función para parsear versión semántica
export interface SemanticVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
}

function parseSemanticVersion(version: string): SemanticVersion | null {
  // Eliminar prefijo 'v' si existe
  const cleanVersion = version.replace(/^v/, '')

  // Regex para versión semántica: major.minor.patch[-prerelease][+build]
  const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/

  const match = cleanVersion.match(semverRegex)
  if (!match) return null

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4],
    build: match[5]
  }
}

// Función para comparar versiones semánticas
function compareVersions(a: SemanticVersion, b: SemanticVersion): number {
  // Comparar major
  if (a.major !== b.major) return a.major - b.major

  // Comparar minor
  if (a.minor !== b.minor) return a.minor - b.minor

  // Comparar patch
  if (a.patch !== b.patch) return a.patch - b.patch

  // Manejar prerelease: sin prerelease > con prerelease
  if (!a.prerelease && b.prerelease) return 1
  if (a.prerelease && !b.prerelease) return -1
  if (a.prerelease && b.prerelease) {
    return a.prerelease.localeCompare(b.prerelease)
  }

  return 0
}

// Interfaz para el resultado que incluye la información parseada
interface ReleaseWithVersion {
  release: Release;
  version: SemanticVersion;
  isCurrent?: boolean
}

// Función principal: agrupar releases y obtener el último de cada versión mayor (con información de versión)
export function getLatestReleasesPerMajorVersion(releases: Release[]): ReleaseWithVersion[] {
  // Filtrar releases válidos (con versiones parseables, no draft, no prerelease)
  const validReleases = releases
    .filter(release => !release.draft && !release.prerelease && release.published_at)
    .map(release => ({
      release,
      version: parseSemanticVersion(release.tag_name),
    }))
    .filter(item => item.version !== null) as Array<{ release: Release, version: SemanticVersion }>

  // Agrupar por versión mayor
  const groupedByMajor = validReleases.reduce((acc, item) => {
    const major = item.version.major
    if (!acc.has(major)) {
      acc.set(major, [])
    }
    acc.get(major)!.push(item)
    return acc
  }, new Map<number, Array<{ release: Release, version: SemanticVersion }>>())

  // Obtener la última release lanzada
  const lastRelease: ReleaseWithVersion = validReleases.reduce((previous, current) => {
    return current.release.published_at < previous.release.published_at ? previous : current
  })
  // Obtener la versión más alta de cada grupo
  const latestReleases: ReleaseWithVersion[] = []

  for (const [_major, releaseGroup] of groupedByMajor) {
    // Ordenar por versión y tomar el último (más alto)
    const sortedGroup = releaseGroup.sort((a, b) =>
      compareVersions(a.version, b.version)
    )

    const latestInGroup = sortedGroup[sortedGroup.length - 1]
    latestReleases.push({
      release: latestInGroup.release,
      version: latestInGroup.version,
      isCurrent: latestInGroup.release.id === lastRelease.release.id
    })
  }

  // Ordenar el resultado por versión mayor
  return latestReleases.sort((a, b) => b.version.major - a.version.major)
}

// Función alternativa más simple si solo necesitas incluir releases publicados
export function getLatestReleasesSimple(releases: Release[]): Release[] {
  const releaseMap = new Map<number, Release>()

  for (const release of releases) {
    // Filtrar drafts, prereleases y releases no publicados
    if (release.draft || release.prerelease || !release.published_at) {
      continue
    }

    const version = parseSemanticVersion(release.tag_name)
    if (!version) continue

    const major = version.major
    const currentLatest = releaseMap.get(major)

    if (!currentLatest) {
      releaseMap.set(major, release)
    } else {
      const currentVersion = parseSemanticVersion(currentLatest.tag_name)!
      if (compareVersions(version, currentVersion) > 0) {
        releaseMap.set(major, release)
      }
    }
  }

  return Array.from(releaseMap.values())
    .sort((a, b) => {
      const versionA = parseSemanticVersion(a.tag_name)!
      const versionB = parseSemanticVersion(b.tag_name)!
      return versionB.major - versionA.major
    })
}
