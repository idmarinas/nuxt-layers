export function normalize(str: string): string {
  return str.toLocaleLowerCase().replace(/-/g, '_')
}
