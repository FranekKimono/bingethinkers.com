<template>
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="neon-icon">
    <defs>
      <filter id="neon-glow-face">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="18" stroke="#e85298" stroke-width="2" fill="none" filter="url(#neon-glow-face)" />
    <circle cx="17" cy="20" r="2.5" fill="#e85298" filter="url(#neon-glow-face)" />
    <circle cx="31" cy="20" r="2.5" fill="#e85298" filter="url(#neon-glow-face)" />
    <path d="M16 30 Q24 37 32 30" stroke="#e85298" stroke-width="2" stroke-linecap="round" fill="none" filter="url(#neon-glow-face)" />
  </svg>
</template>
<style scoped>.neon-icon { display: block; }</style>
