/**
 * Copyright 2025 (C) IDMarinas - All Rights Reserved
 *
 * Last modified by "IDMarinas" on 09/12/2025, 20:48
 *
 * @project Nuxt Layers
 * @see https://github.com/idmarinas/nuxt-layers
 *
 * @file version.ts
 * @date 04/08/2025
 * @time 17:24
 *
 * @author Iván Diaz Marinas (IDMarinas)
 * @license BSD 3-Clause License
 *
 * @since 1.0.0
 */

import type {BadgeProps} from '@nuxt/ui'
import type {SemanticVersion} from './parseVersions'

export class Version {
  public label: string
  public tag: string
  public isCurrent: boolean
  public branch: string = ''
  public owner: string = ''
  public repo: string = ''
  public path: string
  public tarballUrl: string
  public repository: string = ''
  public collection: string
  public tagColor: BadgeProps['color']
  public semver: SemanticVersion
  private repositoryUrl: string = ''

  constructor(
    tag: string,
    semver: SemanticVersion,
    isCurrent: boolean = false
  ) {
    this.tag = tag
    this.semver = semver
    this.isCurrent = isCurrent

    this.label = `Version ${this.semver.major}`
    this.tagColor = this.getTagColor()
    this.path = this.getPath()
    this.collection = this.getCollection()
  }

  public getPath(addSlash = true): string {
    const slash = addSlash ? '/' : ''

    if (this.isCurrent) {
      return `${slash}current`
    }

    return `${slash}${this.semver.major}.x`
  }

  public setRepository(owner: string, repo: string): this {
    if (URL.canParse(owner)) {
      const url = new URL(owner)

      if (url.toString().endsWith(`/tree/${this.tag}`)) {
        this.repositoryUrl = url.toString()
      } else if (url.toString().endsWith('/tree')) {
        this.repositoryUrl = `${url.toString()}/${this.tag}`
      } else {
        this.repositoryUrl = `${url.toString()}/tree/${this.tag}`
      }

      this.repository = this.getRepository()

      return this
    }

    this.owner = owner
    this.repo = repo

    this.repository = this.getRepository()

    return this
  }

  public setBranch(branch: string): this {
    this.branch = branch

    return this
  }

  public setTarballUrl(tarballUrl: string): this {
    if (URL.canParse(tarballUrl)) {
      this.tarballUrl = tarballUrl
    }

    return this
  }

  public setTagColor(color: BadgeProps['color']): this {
    this.tagColor = color

    return this
  }

  private getCollection(): string {
    if (this.isCurrent) {
      return 'docs_versioning'
    }

    return `docs_versioning_v${this.semver.major}`
  }

  private getRepository(): string {
    if (this.repositoryUrl !== '') {
      return this.repositoryUrl
    }

    return `https://github.com/${this.owner}/${this.repo}/tree/${this.tag}`
  }

  private getTagColor(): BadgeProps['color'] {
    if (this.isCurrent) {
      return 'info'
    }

    return 'primary'
  }
}

export function groupBy<T, K extends keyof T>(array: T[], key: K): T[][] {
  const groups = array.reduce((acc, item) => {
    const groupKey = String(item[key])
    if (!acc.has(groupKey)) {
      acc.set(groupKey, [])
    }
    acc.get(groupKey)!.push(item)
    return acc
  }, new Map<string, T[]>())

  return Array.from(groups.values())
}
