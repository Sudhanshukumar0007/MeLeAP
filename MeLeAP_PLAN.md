# MeLeAP — Meta Lead Ads + React Native PoC

## 0. Project Goal

Build a working proof of concept where:

> A user submits a Meta Lead Ad form → the lead is received by our backend → the already-open React Native app displays the lead live without any manual action on the device.

The assignment requires using Meta's Lead Testing Tool to simulate submissions. No real ads are required.

The core evaluation is:
- Does it work as described?
- Is the solution our own work?

> Important: The assignment explicitly says not to use AI to generate code. Use this plan as an architecture/build guide; write the implementation ourselves and use help for concepts, debugging, and code review.

---

# 1. Final Architecture

```text
                    ┌─────────────────────┐
                    │ Meta Lead Testing   │
                    │ Tool                │
                    └──────────┬──────────┘
                               │
                               │ HTTP Webhook
                               ▼
                    ┌─────────────────────┐
                    │ Node.js / Express   │
                    │                     │
                    │ Webhook Handler     │
                    │ Lead Processor      │
                    └──────┬───────┬──────┘
                           │       │
                           │       ▼
                           │   ┌─────────┐
                           │   │ MongoDB │
                           │   └─────────┘
                           │
                           │ Socket.IO
                           ▼
                    ┌─────────────────────┐
                    │ React Native        │
                    │                     │
                    │ Leads List          │
                    └─────────────────────┘
```

## Core responsibilities

- **Meta Lead Form:** Produces a lead event.
- **Webhook:** Delivers the event from Meta to our backend.
- **Node.js/Express:** Receives and processes the event.
- **Graph API:** Used to retrieve the full lead details from the lead ID.
- **MongoDB:** Persistent source of truth for leads.
- **Socket.IO:** Realtime delivery from backend to connected React Native clients.
- **React Native:** Displays the lead list and updates live.

### Important distinction

```text
Meta → Backend
        Webhook

Backend → React Native
        Socket.IO
```

A webhook is an external system pushing an HTTP event to us. Socket.IO is our realtime channel from our backend to the mobile application.

---

# 2. Phase 0 — Understand Event-Driven Systems

## Goal

Understand the concepts before writing the system.

Study:

- Event-driven architecture
- Events
- Producers and consumers
- Webhooks
- HTTP request/response
- REST APIs
- WebSockets
- Socket.IO
- MongoDB persistence
- Asynchronous processing
- Idempotency
- Retries and failure handling
- Webhook security

## Mental model

```text
Something happens
      ↓
Event is generated
      ↓
Event is delivered
      ↓
Consumer processes it
      ↓
State changes
      ↓
Other consumers/UI react
```

For this project:

```text
Lead submitted
      ↓
Meta generates event
      ↓
Webhook → backend
      ↓
Backend processes lead
      ↓
MongoDB updated
      ↓
Socket.IO event
      ↓
React Native updates
```

## Exit condition

Be able to explain:

> When Meta receives a lead, it sends an event to our webhook; our backend processes and persists the lead, then emits a realtime event to connected React Native clients.

---

# 3. Phase 1 — Build React Native UI

## Goal

Create the leads screen before connecting anything external.

Example:

```text
┌────────────────────────────┐
│           Leads            │
├────────────────────────────┤
│                            │
│  Rahul Kumar               │
│  rahul@gmail.com           │
│  NEW                       │
│                            │
├────────────────────────────┤
│  Priya Sharma              │
│  priya@gmail.com           │
│  CONTACTED                 │
└────────────────────────────┘
```

Initially use hardcoded/test data.

## Exit condition

- React Native app launches.
- Leads screen renders.
- Lead cards/list are visually clear.
- No backend or Meta dependency yet.

---

# 4. Phase 2 — Build Node.js + Express Backend

## Goal

Create the backend independently.

Initial endpoints:

```text
GET /health
GET /leads
```

Potential test endpoint:

```text
POST /test-lead
```

Use this only for development/testing before Meta integration.

## Initial flow

```text
React Native
      ↓
GET /leads
      ↓
Express
      ↓
JSON response
```

## Exit condition

- Backend starts successfully.
- `/health` works.
- `/leads` returns data.
- Backend can be tested independently.

---

# 5. Phase 3 — MongoDB Persistence

## Goal

Introduce persistent storage.

Lead model concept:

```text
Lead
├── metaLeadId
├── name
├── email
├── phone
├── createdAt
└── status
```

Default status:

```text
NEW
```

## Test

1. Create/save a test lead.
2. Restart backend.
3. Fetch leads again.
4. Verify the lead still exists.

## Key concept

```text
MongoDB
    ↓
Persistent state

Socket.IO
    ↓
Realtime delivery
```

MongoDB is the source of truth. Socket.IO is a delivery mechanism, not permanent storage.

## Exit condition

Restarting the server does not erase leads.

---

# 6. Phase 4 — Connect React Native to Backend

Remove hardcoded lead data.

App startup:

```text
React Native
      ↓
GET /leads
      ↓
Backend
      ↓
MongoDB
      ↓
Leads
```

## Exit condition

- App loads leads from backend.
- Leads survive app/server restarts.
- React Native is no longer dependent on hardcoded data.

---

# 7. Phase 5 — Introduce Socket.IO

## Goal

Make the application realtime before adding Meta.

Connection:

```text
React Native
       │
       │ Socket connection
       ▼
    Backend
```

Backend emits:

```text
newLead
```

React Native listens and updates the list.

## Development test

Create a test lead manually:

```text
POST /test-lead
```

Backend:

```text
Save to MongoDB
      ↓
Emit Socket.IO event
      ↓
React Native
```

The lead should appear without refreshing.

## Exit condition

Create a test lead and see it appear immediately in the already-open React Native app.

This proves our internal event-driven pipeline works before introducing Meta.

---

# 8. Phase 6 — Meta Developer Setup

## Goal

Connect the project to Meta.

Set up:

```text
Meta Developer Account
        ↓
Meta App
        ↓
Facebook Page
        ↓
Lead Form
```

Then configure the Page's `leadgen` subscription.

Understand:

- Page
- Meta App
- Lead Ads/Instant Form
- Access tokens
- Required permissions
- `leadgen` subscription
- Webhook callback URL
- Verify token

No real ad campaign is required.

## Exit condition

Meta-side setup is ready for webhook integration.

---

# 9. Phase 7 — Webhook Verification

## Goal

Make Meta accept our webhook endpoint.

Conceptually:

```text
Meta
  │
  │ verification request
  ▼
GET /webhook
  │
  │ return challenge
  ▼
Meta
```

The backend needs to handle Meta's verification parameters correctly.

## Exit condition

Meta accepts the webhook URL and verification succeeds.

---

# 10. Phase 8 — Receive Meta Lead Event

## Goal

Prove Meta → backend communication before fetching lead details.

Flow:

```text
Meta Lead Testing Tool
          ↓
       Webhook
          ↓
       Express
```

Initially just log the incoming event.

Conceptually:

```text
Webhook received

page_id: XXXXX
leadgen_id: XXXXX
```

Do not immediately combine this with Graph API, MongoDB, and Socket.IO debugging.

## Exit condition

Submit a test lead using Meta's Lead Testing Tool and confirm our backend receives the webhook event.

---

# 11. Phase 9 — Fetch Full Lead Through Graph API

## Goal

Turn the lead ID received from the webhook into actual lead information.

Flow:

```text
Meta
 ↓
Webhook
 ↓
leadgen_id
 ↓
Graph API
 ↓
Actual lead data
```

Normalize the data into our own model:

```text
{
    metaLeadId,
    name,
    email,
    phone,
    createdAt,
    status
}
```

## Exit condition

A Meta test submission results in the actual lead information reaching our backend.

---

# 12. Phase 10 — Complete Event Pipeline

Connect everything:

```text
                 META
                   │
             Lead submitted
                   │
                   ▼
              WEBHOOK
                   │
                   ▼
               EXPRESS
                   │
             Fetch details
                   │
                   ▼
                MongoDB
                   │
                   ▼
              Socket.IO
                   │
                   ▼
             React Native
                   │
                   ▼
             NEW LEAD
```

## Final demo behavior

1. React Native leads screen is already open.
2. Submit a test lead through Meta Lead Testing Tool.
3. Meta sends the webhook.
4. Backend receives the event.
5. Backend fetches full lead details.
6. Backend saves the lead.
7. Backend emits realtime event.
8. React Native updates automatically.
9. No device interaction is required.

## Exit condition

The full Meta → Backend → MongoDB → Socket.IO → React Native pipeline works end-to-end.

---

# 13. Phase 11 — Reliability

Only after the core assignment works.

## 13.1 Duplicate webhook / Idempotency

Meta may potentially deliver the same event more than once.

We should prevent duplicate leads.

Use:

```text
metaLeadId = unique
```

Concept:

```text
Same event twice
       ↓
Backend recognizes existing metaLeadId
       ↓
Don't create duplicate lead
```

## 13.2 Server failure

Understand what happens if:

```text
Meta
 ↓
Backend 💥
```

Document what guarantees our PoC provides.

## 13.3 App offline

If React Native isn't connected:

```text
Meta
 ↓
Backend
 ↓
MongoDB
```

When the app opens:

```text
React Native
 ↓
GET /leads
 ↓
MongoDB
```

The lead should still appear.

---

# 14. Phase 12 — Mark as Contacted

Optional enhancement after the core requirement works.

Lead status:

```text
NEW
CONTACTED
```

UI:

```text
Sudhanshu
sudhanshu@gmail.com

[ Mark as Contacted ]
```

Flow:

```text
React Native
      ↓
PATCH /leads/:id
      ↓
MongoDB
      ↓
Socket.IO
      ↓
Other connected clients
```

This gives us another small event-driven workflow without significantly increasing project risk.

---

# 15. Phase 13 — Final Cleanup

## Backend

- Environment variables
- Error handling
- Logging
- Input validation
- Webhook verification/security
- Clean project structure

## React Native

- Loading state
- Empty state
- Error state
- Socket connection state
- Duplicate prevention

## MongoDB

- Unique `metaLeadId`
- Useful indexes

## Git

Commit logically:

```text
init project
setup react native app
setup express backend
add mongodb persistence
add socket connection
add webhook endpoint
integrate meta lead retrieval
add live lead updates
add contacted status
```

---

# 16. Testing Ladder

Never jump directly to the full Meta → React Native system.

## Test 1 — UI

```text
React Native
    ↓
UI works
```

## Test 2 — Backend

```text
React Native
    ↓
Backend
    ↓
UI works
```

## Test 3 — Database

```text
Backend
    ↓
MongoDB
    ↓
Data persists
```

## Test 4 — Realtime

```text
Backend
    ↓
Socket.IO
    ↓
React Native
    ↓
LIVE UPDATE
```

## Test 5 — Meta Webhook

```text
Meta
    ↓
Webhook
    ↓
Backend
```

## Test 6 — Graph API

```text
Meta
    ↓
Webhook
    ↓
Graph API
    ↓
MongoDB
```

## Final Test

```text
Meta
 ↓
Webhook
 ↓
Graph API
 ↓
MongoDB
 ↓
Socket.IO
 ↓
React Native
```

If something fails, identify which layer failed instead of debugging the entire system at once.

---

# 17. Priority

| Phase | Component | Priority |
|---|---|---|
| 0 | Event-driven concepts | 🟢 |
| 1 | React Native UI | 🔴 |
| 2 | Express backend | 🔴 |
| 3 | MongoDB | 🔴 |
| 4 | RN ↔ Backend | 🔴 |
| 5 | Socket.IO realtime | 🔴 |
| 6 | Meta setup | 🔴 |
| 7 | Webhook verification | 🔴 |
| 8 | Receive Meta event | 🔴 |
| 9 | Graph API | 🔴 |
| 10 | Full pipeline | 🔥 |
| 11 | Idempotency/reliability | 🟡 |
| 12 | Mark contacted | 🟡 |
| 13 | Polish + Loom | 🔴 |

---

# 18. Build Rule

**Do not move to the next phase until the current phase works.**

At each phase:

```text
Build
 ↓
Run
 ↓
Test
 ↓
Understand
 ↓
Commit
 ↓
Next phase
```

The goal isn't just to finish the assignment.

The goal is to understand why the system works.

---

# 19. Final Assignment Deliverables

According to the assignment:

- One Loom demo (maximum 5 minutes)
- Complete Git repository
- Assumptions made
- Second Loom explaining code and architecture
- Submit the deliverables to the same email list as Part 1

The main Loom should demonstrate:

```text
React Native app already open
        ↓
Submit test lead using Meta Lead Testing Tool
        ↓
Lead appears live in React Native
        ↓
No manual action on device
```

The assignment says the two parts should be submitted together and the deadline is one week. 
