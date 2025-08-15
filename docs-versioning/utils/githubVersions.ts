/**
 * Copyright 2025 (C) IDMarinas - All Rights Reserved
 *
 * Last modified by "IDMarinas" on 11/08/2025, 20:00
 *
 * @project Nuxt Layers
 * @see https://github.com/idmarinas/
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
import {Version} from './version'
import type {Release} from './githubRelease'
import {getLatestReleasesPerMajorVersion} from './parseVersions'

export default async function githubVersions(owner: string, repo: string): Promise<Version[]> {
  const githubApi = `https://api.github.com/repos/${owner}/${repo}/releases`

  const releasesResponse = await fetch(githubApi)
  const json: Release[] = await releasesResponse.json()
  const versions: Version[] = []

  const parsedVersions = getLatestReleasesPerMajorVersion(json)

  parsedVersions.forEach(rv => {
    versions.push(
      new Version(rv.release.tag_name, rv.version, rv.isCurrent)
        .setBranch(rv.release.target_commitish)
        .setRepository(owner, repo)
    )
  })

  return versions
}
