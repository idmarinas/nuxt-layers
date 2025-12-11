/**
 * Copyright 2025 (C) IDMarinas - All Rights Reserved
 *
 * Last modified by "IDMarinas" on 11/12/2025, 15:00
 *
 * @project Nuxt Layers
 * @see https://github.com/idmarinas/nuxt-layers
 *
 * @file nuxt.config.ts
 * @date 09/12/2025
 * @time 19:43
 *
 * @author Iván Diaz Marinas (IDMarinas)
 * @license BSD 3-Clause License
 *
 * @since 1.0.0
 */
import {createResolver} from '@nuxt/kit'

const {resolve} = createResolver(import.meta.url)
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  $meta: {
    name: 'docs-versioning'
  },
  css: [resolve('./app/assets/css/main.css')],
  compatibilityDate: '2025-07-15',
  devtools: {enabled: true},
})
