/**
 * Copyright 2025 (C) IDMarinas - All Rights Reserved
 *
 * Last modified by "IDMarinas" on 12/08/2025, 13:10
 *
 * @project Nuxt Layers
 * @see https://github.com/idmarinas/nuxt-layers
 *
 * @file githubRelease.ts
 * @date 05/08/2025
 * @time 21:00
 *
 * @author Iván Diaz Marinas (IDMarinas)
 * @license BSD 3-Clause License
 *
 * @since 1.0.0
 */

/**
 * A release.
 */
export interface Release {
  assets: ReleaseAsset[];
  assets_url: string;
  /**
   * A GitHub user.
   */
  author: AuthorObject;
  body?: null | string;
  body_html?: string;
  body_text?: string;
  created_at: Date;
  /**
   * The URL of the release discussion.
   */
  discussion_url?: string;
  /**
   * true to create a draft (unpublished) release, false to create a published one.
   */
  draft: boolean;
  html_url: string;
  id: number;
  /**
   * Whether the release is immutable.
   */
  immutable?: boolean;
  mentions_count?: number;
  name: null | string;
  node_id: string;
  /**
   * Whether to identify the release as a prerelease or a full release.
   */
  prerelease: boolean;
  published_at: Date | null;
  reactions?: ReactionRollup;
  /**
   * The name of the tag.
   */
  tag_name: string;
  tarball_url: null | string;
  /**
   * Specifies the commitish value that determines where the Git tag is created from.
   */
  target_commitish: string;
  upload_url: string;
  url: string;
  zipball_url: null | string;

  [property: string]: unknown;
}

/**
 * Data related to a release.
 */
export interface ReleaseAsset {
  browser_download_url: string;
  content_type: string;
  created_at: Date;
  digest: null | string;
  download_count: number;
  id: number;
  label: null | string;
  /**
   * The file name of the asset.
   */
  name: string;
  node_id: string;
  size: number;
  /**
   * State of the release asset.
   */
  state: State;
  updated_at: Date;
  uploader: null | SimpleUser;
  url: string;

  [property: string]: unknown;
}

/**
 * State of the release asset.
 */
export enum State {
  Open = 'open',
  Uploaded = 'uploaded',
}

/**
 * A GitHub user.
 */
export interface SimpleUser {
  avatar_url: string;
  email?: null | string;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: null | string;
  html_url: string;
  id: number;
  login: string;
  name?: null | string;
  node_id: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_at?: string;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
  user_view_type?: string;

  [property: string]: unknown;
}

/**
 * A GitHub user.
 */
export interface AuthorObject {
  avatar_url: string;
  email?: null | string;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: null | string;
  html_url: string;
  id: number;
  login: string;
  name?: null | string;
  node_id: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_at?: string;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
  user_view_type?: string;

  [property: string]: unknown;
}

export interface ReactionRollup {
  '+1': number;
  '-1': number;
  confused: number;
  eyes: number;
  heart: number;
  hooray: number;
  laugh: number;
  rocket: number;
  total_count: number;
  url: string;

  [property: string]: unknown;
}
