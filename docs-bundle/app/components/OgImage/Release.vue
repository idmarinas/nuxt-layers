<script setup>
import { computed } from "vue";

const bundle = useAppConfig().docsBundle
const props = defineProps({
  title: { type: String, required: false },
  description: { type: String, required: false },
  headline: { type: String, required: false }
});
const title = computed(() => (props.title || "").slice(0, 60))
const description = computed(() => (props.description || "").slice(0, 200))
</script>

<template>
  <div class="relative w-full h-full flex flex-row justify-center gap-4 pl-[100px] bg-blue-950">
    <svg class="absolute right-0 top-0 fill-blue-200" width="629" height="593" viewBox="0 0 629 593"
      xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_f_199_94966)">
        <path class="fill-blue-200"
          d="M628.5 -578L639.334 -94.4223L806.598 -548.281L659.827 -87.387L965.396 -462.344L676.925 -74.0787L1087.69 -329.501L688.776 -55.9396L1160.22 -164.149L694.095 -34.9354L1175.13 15.7948L692.306 -13.3422L1130.8 190.83L683.602 6.50012L1032.04 341.989L668.927 22.4412L889.557 452.891L649.872 32.7537L718.78 511.519L628.5 36.32L538.22 511.519L607.128 32.7537L367.443 452.891L588.073 22.4412L224.955 341.989L573.398 6.50012L126.198 190.83L564.694 -13.3422L81.8734 15.7948L562.905 -34.9354L96.7839 -164.149L568.224 -55.9396L169.314 -329.501L580.075 -74.0787L291.604 -462.344L597.173 -87.387L450.402 -548.281L617.666 -94.4223L628.5 -578Z" />
      </g>
      <defs>
        <filter id="filter0_f_199_94966" x="0.873535" y="-659" width="1255.25" height="1251.52"
          filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="40.5" result="effect1_foregroundBlur_199_94966" />
        </filter>
      </defs>
    </svg>

    <div class="flex-1 flex flex-col justify-center">
      <p v-if="headline" class="flex items-center uppercase gap-4 text-[32px] text-blue-300 mb-4 font-semibold">
        <UIcon name="i-tabler-tag" mode="svg" />
        <span>{{ headline }}</span>
      </p>
      <h1 v-if="title" class="nlovk w-[600px] m-0 text-[75px] font-semibold mb-4 text-white text-ellipsis line-clamp-2">
        {{ title }}
      </h1>
      <p v-if="description" class="block text-[32px] text-[#E4E4E7] leading-tight text-ellipsis line-clamp-3">
        {{ description }}
      </p>
      <p>
      <pre
        class="w-full font-mono text-xl text-center text-gray-700 border border-muted bg-gray-100 rounded-md px-4 py-3 whitespace-pre-wrap break-words overflow-x-auto">
          composer require {{ bundle.package_name }}
        </pre>
      </p>
    </div>

    <div class="flex-none flex flex-col items-center justify-center text-blue-300 dark:text-blue-900">
      <div class="text-4xl -mb-7">{{ bundle.author }}</div>
      <SvgShip width="340" height="340" class="opacity-65" />
      <span class="text-5xl -mt-24">{{ bundle.short_name }}</span>
      <div class="flex items-center justify-center gap-4 mt-1">
        <UIcon name="i-tabler-brand-symfony" mode="svg" class="w-12 h-12" />
        <span class="text-3xl">Bundle</span>
      </div>
    </div>
  </div>
</template>
