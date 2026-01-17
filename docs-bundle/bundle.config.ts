import type { BadgeProps, UserProps, TooltipProps } from '@nuxt/ui'

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
  majorVersions: Record<string, string>
}
