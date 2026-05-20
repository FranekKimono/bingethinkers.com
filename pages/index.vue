<template>
  <div>
    <section class="hero">
      <h1>Book a <span>Trivia Night</span><br />Your Crowd Won't Forget</h1>
      <p>
        We bring the host, the questions, and the energy. You bring the crowd.
        Perfect for bars, pubs, and private parties.
      </p>
      <NuxtLink to="/contact" class="btn btn-primary">Book Your Night</NuxtLink>
    </section>

    <section class="section">
      <div class="container">
        <div class="card-grid">
          <div class="card">
            <h3>🎤 Professional Hosts</h3>
            <p>Charismatic trivia masters who know how to work a room and keep the energy high for a full two hours.</p>
          </div>
          <div class="card">
            <h3>📋 Everything Provided</h3>
            <p>Answer sheets, a laptop that plugs into your TV or projector — we handle the setup. You handle the drinks.</p>
          </div>
          <div class="card">
            <h3>💰 Flat Pricing</h3>
            <p>One transparent price per two-hour event. No surprises. Custom packages available for recurring nights.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="text-align:center; border-top:1px solid var(--color-border)">
      <div class="container">
        <h2 style="margin-bottom:1rem">Ready to host?</h2>
        <p style="color:var(--color-muted); margin-bottom:2rem">
          Reach out and we'll get you booked within 48 hours.
        </p>
        <NuxtLink to="/contact" class="btn btn-outline">Get in Touch</NuxtLink>
      </div>
    </section>
  </div>
</template>
