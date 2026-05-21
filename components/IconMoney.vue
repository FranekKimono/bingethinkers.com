<template>
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="neon-icon">
    <defs>
      <filter id="neon-glow-money">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="18" stroke="#44d67a" stroke-width="2" fill="none" filter="url(#neon-glow-money)" />
    <text x="24" y="29" text-anchor="middle" font-size="20" font-weight="800" fill="#44d67a" filter="url(#neon-glow-money)" font-family="system-ui, sans-serif">$</text>
    <line x1="24" y1="6" x2="24" y2="12" stroke="#44d67a" stroke-width="2" filter="url(#neon-glow-money)" />
    <line x1="24" y1="36" x2="24" y2="42" stroke="#44d67a" stroke-width="2" filter="url(#neon-glow-money)" />
  </svg>
</template>

<style scoped>
.neon-icon { display: block; }
</style>
