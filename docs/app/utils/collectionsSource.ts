/** Extracted from @nuxt/content **/
import {withLeadingSlash, withoutTrailingSlash} from 'ufo'
import {join, normalize} from 'pathe'
import {glob} from 'tinyglobby'
import {mkdir, readFile, rm, writeFile} from 'node:fs/promises'
import {createReadStream, createWriteStream} from 'node:fs'
import {pipeline} from 'node:stream/promises'
import {createGunzip} from 'node:zlib'
import {unpackTar} from 'modern-tar/fs'
import {useNuxt} from '@nuxt/kit'

const {options} = useNuxt()

export function defineGitHubSource(source: CollectionSource): ResolvedCollectionSource {
  const resolvedSource = defineLocalSource(source)

  resolvedSource.prepare = async ({rootDir}) => {
    resolvedSource.cwd = join(options.rootDir, '.data', 'content', `github-${source.owner}-${source.repo}-${source.tag}`)

    let headers: Record<string, string> = {}
    if (resolvedSource.authToken) {
      headers = {Authorization: `Bearer ${resolvedSource.authToken}`}
    }

    await downloadRepository(source.repository, resolvedSource.cwd!, {headers})
  }

  return resolvedSource
}

function defineLocalSource(source: CollectionSource | ResolvedCollectionSource): ResolvedCollectionSource {
  if (source.include.startsWith('./') || source.include.startsWith('../')) {
    logger.warn('Collection source should not start with `./` or `../`.')
    source.include = source.include.replace(/^(\.\/|\.\.\/|\/)*/, '')
  }

  const {fixed} = parseSourceBase(source)
  const resolvedSource: ResolvedCollectionSource = {
    _resolved: true,
    prefix: withoutTrailingSlash(withLeadingSlash(fixed)),
    prepare: async ({rootDir}) => {
      resolvedSource.cwd = source.cwd
        ? String(normalize(source.cwd)).replace(/^~~\//, rootDir)
        : join(rootDir, 'content')
    },
    getKeys: async () => {
      const _keys = await glob(source.include, {
        cwd: resolvedSource.cwd,
        ignore: getExcludedSourcePaths(source),
        dot: true,
        expandDirectories: false
      })
        .catch((): [] => [])
      return _keys.map(key => key.substring(fixed.length))
    },
    getItem: async (key) => {
      const fullPath = join(resolvedSource.cwd, fixed, key)

      return await readFile(fullPath, 'utf8')
    },
    ...source,
    include: source.include,
    cwd: '',
  }
  return resolvedSource
}

async function downloadRepository(url: string, cwd: string, {headers}: {
  headers?: Record<string, string>
} = {}) {
  const tarFile = join(cwd, '.content.clone.tar.gz')
  const cacheFile = join(cwd, '.content.cache.json')

  const cache = await readFile(cacheFile, 'utf8').then(d => JSON.parse(d)).catch((): null => null)
  if (cache) {
    // Directory exists, skip download
    const response = await fetch(url, {method: 'HEAD', headers})
    const etag = response.headers.get('etag')
    if (etag === cache.etag) {
      await writeFile(cacheFile, JSON.stringify({
        ...cache,
        updatedAt: new Date().toISOString(),
      }, null, 2))
      return
    }
  }

  await mkdir(cwd, {recursive: true})

  try {
    const response = await fetch(url, {headers})
    const stream = createWriteStream(tarFile)
    await pipeline(response.body as unknown as ReadableStream[], stream)

    await pipeline(
      createReadStream(tarFile),
      createGunzip(),
      unpackTar(cwd, {
        strip: 1, // Remove root directory from zip contents to save files directly in cwd
      }),
    )

    await writeFile(cacheFile, JSON.stringify({
      url: url,
      etag: response.headers.get('etag'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, null, 2))
  } finally {
    await rm(tarFile, {force: true})
  }
}

function parseSourceBase(source: CollectionSource) {
  const [fixPart, ...rest] = source.include.includes('*') ? source.include.split('*') : ['', source.include]
  return {
    fixed: fixPart || '',
    dynamic: '*' + rest.join('*'),
  }
}

function getExcludedSourcePaths(source: CollectionSource) {
  return [
    ...(source!.exclude || []),
    // Ignore OS files
    '**/.DS_Store',
  ]
}
