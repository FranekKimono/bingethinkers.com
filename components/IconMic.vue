<template>
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="neon-icon">
    <defs>
      <filter id="neon-glow-mic">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <!-- Mic head -->
    <rect x="19" y="4" width="10" height="18" rx="5" stroke="#4a9eff" stroke-width="2" fill="none" filter="url(#neon-glow-mic)" />
    <!-- Mic grille lines -->
    <line x1="21" y1="9" x2="27" y2="9" stroke="#4a9eff" stroke-width="1" opacity="0.6" />
    <line x1="21" y1="12" x2="27" y2="12" stroke="#4a9eff" stroke-width="1" opacity="0.6" />
    <line x1="21" y1="15" x2="27" y2="15" stroke="#4a9eff" stroke-width="1" opacity="0.6" />
    <!-- Handle -->
    <path d="M19 22 Q16 26 18 34 Q22 38 24 40 Q26 38 30 34 Q32 26 29 22" stroke="#4a9eff" stroke-width="2" fill="none" filter="url(#neon-glow-mic)" />
    <!-- Cable curve -->
    <path d="M24 40 Q24 44 22 46" stroke="#4a9eff" stroke-width="1.5" stroke-linecap="round" filter="url(#neon-glow-mic)" opacity="0.6" />
  </svg>
</template>
<style scoped>.neon-icon { display: block; }</style>
