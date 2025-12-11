/**
 * Copyright 2025 (C) IDMarinas - All Rights Reserved
 *
 * Last modified by "IDMarinas" on 11/12/2025, 13:50
 *
 * @project Nuxt Layers
 * @see https://github.com/idmarinas/nuxt-layers
 *
 * @file app.config.ts
 * @date 11/12/2025
 * @time 13:49
 *
 * @author Iván Diaz Marinas (IDMarinas)
 * @license BSD 3-Clause License
 *
 * @since 1.0.0
 */
import {Version} from './utils/version'

declare module '@nuxt/schema' {
  interface AppConfig {
    docs: {
      enabled: boolean
      versions: Version[]
    }
  }
}

export default defineAppConfig({})
