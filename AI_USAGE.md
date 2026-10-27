# AI Usage

## Tools used

Claude (chat), used for scaffolding and review. I ran and read everything myself.

## What AI helped with

| Area | How AI was used | Your involvement |
|------|-----------------|------------------|
| Backend service | Drafted `getInProgressCourses` and the remaining-time helper | Chose the rule, the 10-minute default, and the order of filter/sort; read every line |
| Tests | Drafted `estimatedTime.test.ts` | Checked expected numbers by hand against the seed durations |
| React UI | Drafted the state machine, components, track events |Adjusted copy, css, error messages |
| Docs | Drafted PRODUCT.md structure | Rewrote the description and usage in my own words |

## What you rejected or rewrote

- A suggestion to build a "Continue" button with the course detail view. Rejected: the spec lists it as out of scope and it dilutes the thin slice.
- Enforcing to fetch the learner's ID from backend to frontend and then updating the URL based on that change. Rejected because it was not in scope and also have added the ID filter in dropdown so wasn't necessary. Can explain how it was handling.

## What you'd do differently without AI

Without AI I would have spent most of my time in setup and styling. I would not have got the time to weigh which backend rules to pick and writing up the test would have taken much longer.

## Ownership statement

I can explain and modify the service ordering (404, filter, map, sort), the analytics client without AI.
