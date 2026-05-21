<template>
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="neon-icon">
    <defs>
      <filter id="neon-glow-money">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <!-- Flat bill on table — slight top-down perspective -->
    <g transform="translate(24,28) rotate(-8) skewX(20) scale(0.46)">
      <rect x="-38" y="-18" width="76" height="36" rx="4" stroke="#44d67a" stroke-width="4" fill="none" filter="url(#neon-glow-money)" />
      <!-- Inner border -->
      <rect x="-30" y="-13" width="60" height="26" rx="2" stroke="#44d67a" stroke-width="1.5" fill="none" filter="url(#neon-glow-money)" opacity="0.4" />
      <!-- Dollar sign -->
      <text x="0" y="4" text-anchor="middle" font-size="24" font-weight="800" fill="#44d67a" filter="url(#neon-glow-money)" font-family="system-ui, sans-serif">$</text>
    </g>
  </svg>
</template>
<style scoped>.neon-icon { display: block; }</style>
