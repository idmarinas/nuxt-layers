/**
 * Copyright 2025 (C) IDMarinas - All Rights Reserved
 *
 * Last modified by "IDMarinas" on 11/12/2025, 20:43
 *
 * @project Nuxt Layers
 * @see https://github.com/idmarinas/nuxt-layers
 *
 * @file githubVersions.ts
 * @date 11/08/2025
 * @time 20:00
 *
 * @author Iván Diaz Marinas (IDMarinas)
 * @license BSD 3-Clause License
 *
 * @since 1.0.0
 */
import { Version } from '../app/utils/version'
import type { Release } from './githubRelease'
import { getLatestReleasesPerMajorVersion } from './parseVersions'
import { promises as fs } from 'fs'
import { join } from 'path'
import {useNuxt} from '@nuxt/kit'

interface CacheData {
  data: Version[]
  timestamp: number
}

const {options} = useNuxt()
const CACHE_DIR = join(options.rootDir, '.nuxt/cache/docs-versioning')
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 horas en milisegundos

/**
 * Get the path of the cache file
 */
function getCachePath(owner: string, repo: string): string {
  const cacheFileName = `github-${owner}-${repo}.json`
  return join(CACHE_DIR, cacheFileName)
}

/**
 * Get the file system cache if it is valid
 */
async function getCache(owner: string, repo: string): Promise<Version[] | null> {
  try {
    const cachePath = getCachePath(owner, repo)
    const fileContent = await fs.readFile(cachePath, 'utf-8')
    const cacheData: CacheData = JSON.parse(fileContent)

    const now = Date.now()
    const isExpired = now - cacheData.timestamp > CACHE_DURATION

    if (isExpired) {
      return null
    }

    // Convert saved data back to Version instances
    return cacheData.data.map(v => Object.assign(new Version('', {}), v))
  } catch (error) {
    // Archivo no existe o no se puede leer
    return null
  }
}

async function saveCache(owner: string, repo: string, data: Version[]): Promise<void> {
  try {
    // Crear directorio si no existe
    await fs.mkdir(CACHE_DIR, { recursive: true })

    const cachePath = getCachePath(owner, repo)
    const cacheData: CacheData = {
      data,
      timestamp: Date.now()
    }

    await fs.writeFile(cachePath, JSON.stringify(cacheData, null, 2), 'utf-8')
  } catch (error) {
    console.warn(`Error al guardar caché para ${owner}/${repo}:`, error)
    // No lanzar error, solo advertir. La función debe continuar
  }
}

export default async function githubVersions(owner: string, repo: string): Promise<Version[]> {
  // Intentar obtener del caché
  const cachedData = await getCache(owner, repo)

  if (cachedData) {
    return cachedData
  }

  try {
    const githubApi = `https://api.github.com/repos/${owner}/${repo}/releases`

    const releasesResponse = await fetch(githubApi)
    const json: Release[] = await releasesResponse.json()
    const versions: Version[] = []

    if (releasesResponse.status >= 400) {
      return []
    }

    const parsedVersions = getLatestReleasesPerMajorVersion(json)

    parsedVersions.forEach(rv => {
      versions.push(
        new Version(rv.release.tag_name, rv.version, rv.isCurrent)
          .setBranch(rv.release.target_commitish)
          .setRepository(owner, repo)
          .setTarballUrl(rv.release.tarball_url || '')
      )
    })

    await saveCache(owner, repo, versions)

    return versions
  } catch (error) {
    console.error(`Error obtaining versions from ${owner}/${repo}:`, error)
    return []
  }
}
