/**
 * Copyright 2025 (C) IDMarinas - All Rights Reserved
 *
 * Last modified by "IDMarinas" on 10/12/2025, 16:54
 *
 * @project Nuxt Layers
 * @see https://github.com/idmarinas/nuxt-layers
 *
 * @file parseVersions.ts
 * @date 09/12/2025
 * @time 20:43
 *
 * @author Iván Diaz Marinas (IDMarinas)
 * @license BSD 3-Clause License
 *
 * @since 1.0.0
 */

import type {Release} from './githubRelease'

// Función para parsear versión semántica
export interface SemanticVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
}

export function parseSemanticVersion(version: string): SemanticVersion {
  // Eliminar prefijo 'v' si existe
  const cleanVersion = version.replace(/^v/, '')

  // Regex para versión semántica: major.minor.patch[-prerelease][+build]
  const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/

  const match = cleanVersion.match(semverRegex)
  if (null === match) {
    return {
      major: 0,
      minor: 0,
      patch: 0
    }
  }

  return {
    major: parseInt(match[1]!, 10),
    minor: parseInt(match[2]!, 10),
    patch: parseInt(match[3]!, 10),
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

// Interface for the result that includes the parsed information
interface ReleaseWithVersion {
  release: Release;
  version: SemanticVersion;
  isCurrent?: boolean
}

// Group releases and get the latest of each major version (with version information)
export function getLatestReleasesPerMajorVersion(releases: Release[]): ReleaseWithVersion[] {
  // Filter valid releases (with parseable versions, not draft, not prerelease)
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
    return current.release.published_at! < previous.release.published_at! ? previous : current
  })
  // Obtener la versión más alta de cada grupo
  const latestReleases: ReleaseWithVersion[] = []

  for (const [_major, releaseGroup] of groupedByMajor) {
    // Ordenar por versión y tomar el último (más alto)
    const sortedGroup = releaseGroup.sort((a, b) =>
      compareVersions(a.version, b.version)
    )


    const latestInGroup = sortedGroup.pop()!

    latestReleases.push({
      release: latestInGroup.release,
      version: latestInGroup.version,
      isCurrent: latestInGroup.release.id === lastRelease.release.id
    })
  }

  // Ordenar el resultado por versión mayor
  return latestReleases.sort((a, b) => b.version.major - a.version.major)
}
