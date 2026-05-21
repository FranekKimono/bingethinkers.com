<template>
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="neon-icon">
    <defs>
      <filter id="neon-glow-money">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <!-- Dollar bill in perspective (tilted isometric-ish) -->
    <g transform="translate(24,24) scale(0.6)">
      <!-- Shadow/back face -->
      <polygon points="-22,-12 -12,-18 22,-12 12,-6" stroke="#44d67a" stroke-width="2.5" fill="none" filter="url(#neon-glow-money)" />
      <!-- Right side -->
      <polygon points="22,-12 22,12 12,6 12,-6" stroke="#44d67a" stroke-width="2.5" fill="none" filter="url(#neon-glow-money)" />
      <!-- Front face -->
      <polygon points="-12,-18 -12,-6 12,-6 12,6" stroke="#44d67a" stroke-width="2.5" fill="none" filter="url(#neon-glow-money)" />
      <!-- Dollar sign on front -->
      <text x="-12" y="-2" transform="skewY(18)" font-size="14" font-weight="800" fill="#44d67a" filter="url(#neon-glow-money)" font-family="system-ui, sans-serif">$</text>
    </g>
  </svg>
</template>
<style scoped>.neon-icon { display: block; }</style>
