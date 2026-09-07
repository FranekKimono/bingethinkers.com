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

**Public Event**:
An Event listed on the public Binge Thinkers calendar with its scheduled date, time, and location.
_Avoid_: Private booking

**Event series**:
A group of Public Events connected by a shared schedule of repeating or hand-picked dates. Each dated Event belongs to that series even when its date, time, or location differs from the usual schedule.
_Avoid_: Event (when referring to the entire series)

**Event customization**:
A deliberate difference between one Public Event's date, time, or location and its Event series defaults.
_Avoid_: Custom schedule (when referring to a change to one Event)

**Cancelled Event**:
A Public Event that will not take place and remains listed so visitors can see the cancellation.
_Avoid_: Deleted Event

**Location**:
A named physical place, including its address, that may be shared by multiple Public Events and Event series. A different physical place is a different Location, even when the venue name stays the same.
_Avoid_: Client

**Archived Location**:
A saved Location set aside from use in new Events while retained for existing Events and future reuse.
_Avoid_: Deleted Location
