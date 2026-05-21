<template>
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="neon-icon">
    <defs>
      <filter id="neon-glow-mic">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect x="18" y="4" width="12" height="20" rx="6" stroke="#e85298" stroke-width="2" fill="none" filter="url(#neon-glow-mic)" />
    <line x1="24" y1="26" x2="24" y2="38" stroke="#e85298" stroke-width="2" filter="url(#neon-glow-mic)" />
    <line x1="14" y1="32" x2="34" y2="32" stroke="#e85298" stroke-width="2" stroke-linecap="round" filter="url(#neon-glow-mic)" />
    <path d="M16 38h16" stroke="#e85298" stroke-width="2" stroke-linecap="round" filter="url(#neon-glow-mic)" />
  </svg>
</template>

<style scoped>
.neon-icon { display: block; }
</style>
