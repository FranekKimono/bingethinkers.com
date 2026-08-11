<template>
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="neon-icon">
    <defs>
      <filter id="neon-glow-screen">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect x="6" y="8" width="36" height="24" rx="4" stroke="#4a9eff" stroke-width="2" fill="none" filter="url(#neon-glow-screen)" />
    <line x1="14" y1="36" x2="34" y2="36" stroke="#4a9eff" stroke-width="2" filter="url(#neon-glow-screen)" />
    <line x1="24" y1="36" x2="24" y2="42" stroke="#4a9eff" stroke-width="2" filter="url(#neon-glow-screen)" />
    <line x1="16" y1="42" x2="32" y2="42" stroke="#4a9eff" stroke-width="2" stroke-linecap="round" filter="url(#neon-glow-screen)" />
  </svg>
</template>

<style scoped>
.neon-icon { display: block; }
</style>
