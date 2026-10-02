# Workflow states and existing UI mapping

The API uses uppercase stable codes. UI labels and Kannada translations are presentation choices. This document defines the target mapping **before** any mock screen is connected to the API.

| Backend assignment state | Existing volunteer UI label | Meaning |
| --- | --- | --- |
| `PENDING` | Pending | Dispatch proposed; people, driver and vehicle are reserved pending a response. |
| `ACCEPTED` | Accepted | Volunteer accepted; no travel has started. |
| `EN_ROUTE` | In Progress | Crew has started travel. |
| `ARRIVED_AT_DONOR` | Checked In | Crew arrived at the donor; food has not necessarily been collected. |
| `FOOD_COLLECTED` | New explicit collection step needed on integration | Food was collected after on-site checks. |
| `DELIVERED` | Completed | Food reached the agreed destination and delivery was confirmed. |
| `REJECTED`, `CANCELLED`, `FAILED` | Rejected, Cancelled, failure feedback | Terminal outcomes; active reservations are released. |

Allowed normal sequence: `PENDING → ACCEPTED → EN_ROUTE → ARRIVED_AT_DONOR → FOOD_COLLECTED → DELIVERED`. `PENDING → REJECTED` is a volunteer choice. Cancellation and failure require a reason and authorized actor; no status may silently jump ahead. Failed/rejected assignments return the pickup to planning if still viable. A replacement assignment receives a new ID; history is retained.

| Backend pickup state | Existing donor UI label |
| --- | --- |
| No pickup or `PLANNED` | Submitted |
| `ASSIGNED` | Assigned |
| `EN_ROUTE`, `ARRIVED_AT_DONOR`, `FOOD_COLLECTED` | Pickup In Progress, with a more detailed stage when connected |
| `DELIVERED` | Completed |
| `CANCELLED` | Cancelled |
| `FAILED` | Explicit failure feedback to be designed |

The donor can request cancellation before travel begins, including while assigned. Food owns the request status; Pickup cancels the corresponding pickup and releases reservations in the same database transaction. Once travel begins, the donor cannot self-cancel and must contact an administrator. `FOOD_COLLECTED` is not final delivery. An administrator or authorized handoff actor must confirm delivery; the detailed actor policy is a pilot gate.

The web prototype currently allows arbitrary status selection and mobile moves directly from Checked In to Completed. Those mock flows remain untouched in the foundation. During integration, replace those controls with allowed actions and an explicit collection step; test the mapping and update translations before enabling live data.
