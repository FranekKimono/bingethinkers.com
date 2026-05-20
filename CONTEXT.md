# Binge Thinkers

A hosted trivia night service. Clients book a Host to run a trivia Event at their venue or rented space.

## Language

**Client**:
A person or group that books a trivia night. May own the venue or rent one.
_Avoid_: Customer, Booker, Venue

**Host**:
A representative of Binge Thinkers who runs the trivia night at the Client's location. Brings a laptop and answer sheets. Hosts rotate through a shared availability pool.
_Avoid_: Representative, MC, Quizmaster

**Event**:
A 2-hour trivia session booked by a Client with a Host at a specific date, time, and location. Fixed base price; tiered pricing (package, day-of-week, group size, location) planned but not yet defined.
_Avoid_: Night, Booking, Session, Gig

## Example Dialogue

> **Dev:** When a Client books, do they pick a specific Host or just any available one?
> **Domain Expert:** They request an Event. We assign a Host from the rotating pool. The Client doesn't choose — we choose for them.
>
> **Dev:** And if two Events overlap in time, the system needs to ensure a Host isn't double-booked?
> **Domain Expert:** Right. One Host, one Event at a time.
>
> **Dev:** What does a Client pay for? Just the 2-hour hosting?
> **Domain Expert:** Yes — the Host runs the trivia with their laptop and answer sheets. Prizes are negotiated directly between the Client and Host, not handled by the platform.
