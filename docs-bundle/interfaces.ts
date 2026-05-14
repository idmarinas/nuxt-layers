import type { BadgeProps, PageCardProps, TooltipProps, UserProps } from '@nuxt/ui'

export type LibraryCardProps = Omit<PageCardProps, 'title' | 'icon' | 'to' | 'description'> & {
  title: string
  icon: string
  to: string
  description: string
}

export interface DocsBundleRuntimeConfig {
  project_name: string
  authors: Record<string, Author>
  repository: { name: string; owner: string }
}

export interface ModuleOptions {
  package_name: string;
  name?: string;
  description?: string;
  author?: Author;
  short_name?: string;
  repository?: {
    name?: string; owner?: string;
  };
  colors: Record<string, string>;
  authors: Record<string, Author>;
  labels: Record<string, Record<string, LabelProps> | LabelProps>;
  socials: Record<string, string>;
  support_links: { title: string, links: object[] };
  libraries?: PageCardProps[];
}

export interface BranchInfo {
  release: string;
  date: string | null;
  count: number;
  labels: string[];
}


export interface BranchVersions {
  branch: string;
  versions: string[];
}

export interface LabelProps extends BadgeProps {
  tooltip?: TooltipProps;
}

export interface Author extends UserProps {
  name: string;
  description: string;
  avatar: {
    src: string;
  };
  username: string;
}

export interface DocsBundleConfig {
  name: string;
  short_name: string;
  description: string;
  author: Author;
  package_name: string;
  repository: {
    name: string;
    owner: string;
  };
  socialsIconsOnly: (extra?: string[]) => string[];
  labels: Record<string, Record<string, LabelProps> | LabelProps>;
  vars: Record<string, string | number | boolean>;
  links: Record<string, string>;
  branchesInfo: Record<string, BranchInfo>;
  libraries?: PageCardProps[];
}
