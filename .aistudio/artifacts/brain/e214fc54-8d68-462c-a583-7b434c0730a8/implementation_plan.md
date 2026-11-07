# AWS re:Invent Watch & Build Party Dhule — Event Web Experience

A high-energy, cyber-tech event website and digital hub for the AWS re:Invent Watch & Build Party hosted by the AWS Student Builder Group at SVKM's IOT Dhule at Hotel Anand Regency Riverfront. It combines a live watch countdown, interactive multi-track agenda, speaker spotlights, venue navigation, and a registration flow that issues a personalized, downloadable Digital Builder Badge with calendar integration.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following product and design decisions have been aligned based on your selections:

- **Confirmed Aesthetic**: Cyber-Tech Dark Mode (`#090D16` canvas) with dynamic accent grid accents echoing the official AWS re:Invent banner (electric blue `#3FB1FF`, terminal green `#05E08A`, neon magenta `#FF57E8`, builder orange `#FF9F1C`, and purple `#AB5CFF`).
- **Confirmed Registration Experience**: Instant Digital Builder Badge generator with unique builder ID, personalized holographic QR card, 1-click Google Calendar & .ics export, and instant RSVP confirmation modal.
- **Confirmed Interactive Features**:
  1. Live keynote watch party tracker with real-time countdown clock and progress meter.
  2. Filterable multi-track agenda (Keynote Streams, Hands-On Labs, Mentorship, Lightning Talks).
  3. Speaker & mentor spotlight cards with tech stacks and session topics.
  4. Interactive venue guide with embedded Google Map for Hotel Anand Regency Riverfront and attendee FAQ.

---

## 1. Overview & Core Concept

- **What It Does**: Serves as the official pre-event and day-of command center for 300+ students and cloud builders attending the AWS re:Invent Watch & Build Party in Dhule. Attendees can explore the schedule, register in seconds, generate their personalized Builder Badge, and access live updates.
- **Target Audience**: Engineering and computer science students from SVKM's IOT Dhule and neighboring colleges, AWS student community members, aspiring cloud architects, and tech mentors.
- **Key Value**: Delivers an immersive developer conference experience that bridges the excitement of AWS re:Invent in Las Vegas with hands-on local building in Dhule.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Discovery & Live Countdown**:
   - The user arrives at an animated hero featuring the event banner motif, dynamic countdown timer to December 4, 2026 (9:00 AM IST), and dual CTAs: `"Claim Your Builder Pass"` and `"Explore Agenda"`.
   - Live status badge indicates either time remaining, active session in progress, or wrap-up status.

2. **Agenda & Watch Session Explorer**:
   - Attendees switch between tracks: `All`, `Keynote Screening`, `Build Challenge`, and `Mentorship`.
   - Each session card displays start time, track indicator, speaker details, and an `"Add to Calendar"` micro-action.

3. **Speaker & Mentor Showcase**:
   - Interactive profile cards showcasing AWS Community Builders, faculty leads, and student ambassadors with their talk subjects, cloud domains (GenAI, Serverless, DevOps), and social connect links.

4. **Streamlined Registration & Instant Digital Badge**:
   - Minimal 5-field registration form (Name, Email, College, Academic Year, Cloud Experience Level).
   - Upon submission, the user receives an instant confirmation toast and an interactive **3D-tilt Builder Badge** featuring their name, avatar silhouette, unique attendee serial (`DHU-BLD-XXXX`), QR code, and download/share buttons.

5. **Venue & Logistics Command Center**:
   - Interactive directions card with one-touch navigation links to Google Maps, venue highlights (Wi-Fi, power desks, refreshments), and an accordion FAQ addressing laptops, AWS credits, and eligibility.

### Visual Identity & Theme

- **Color Tokens**:
  - `Canvas`: Deep obsidian slate (`#090D16`) with structural panels in `#111827` and hairline borders in `#1F293D`.
  - `Accents`: Electric Cyan (`#3FB1FF`), Emerald Terminal (`#05E08A`), Neon Magenta (`#FF57E8`), AWS Builder Orange (`#FF9F1C`), and Royal Iris (`#AB5CFF`).
  - `Typography`: **Plus Jakarta Sans** for headlines and brand mark, **DM Sans** for legible body copy, and **JetBrains Mono** for timestamps, serial tags, and live metrics.
- **Motion & Interaction**:
  - Smooth micro-interactions under 200ms with subtle glow states.
  - Interactive badge flip / tilt on hover.
  - Ticker banner with animated event highlights (`WATCH · BUILD · CONNECT · SHIP · re:INVENT`).

---

## 3. Key Product Decisions & Trade-Offs

- **Client-Side Instant Badge & Storage**:
  - *Chosen Approach*: Instant badge rendering using React HTML5 Canvas / SVG with local storage persistence.
  - *Why*: Provides zero-friction, instant gratification without waiting on backend database roundtrips, allowing attendees to download their badge image or save to Apple/Google Wallet formats immediately.
- **Single-Page Section Architecture with Fast Deep-Linking**:
  - *Chosen Approach*: Clean single-page application with smooth section anchor navigation and live tab switching.
  - *Why*: Optimized for mobile-first scanning during the actual event day while maintaining rich desktop layout fidelity.

---

## 4. Technical Architecture & Data Strategy

### System & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          App Container (App.tsx)                       │
│  - Event Configuration & Timer Context (Date: Dec 4, 2026, 09:00 IST)  │
│  - Active Track & Registration State                                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│    Top Navigation   │   │     Hero Section    │   │  Live Event Ticker  │
│ - Brand Wordmark    │   │ - Banner Grid Motif │   │ - Key Announcements │
│ - Section Anchors   │   │ - Countdown Clock   │   │ - Dynamic Flow Bar  │
│ - Primary Ticket CTA│   │ - Quick Actions     │   │                     │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│  Trackable Agenda   │   │  Speaker Spotlight  │   │  Registration Form  │
│ - Filterable Tabs   │   │ - Mentor Cards      │   │ - Field Validation  │
│ - Session Details   │   │ - Topic Badges      │   │ - Local Persistence │
│ - Calendar Action   │   │ - Social Profiles   │   │ - Badge Generator   │
└─────────────────────┘   └─────────────────────┘   └──────────┬──────────┘
                                                               │
                                                    ┌──────────▼──────────┐
                                                    │ Digital Badge Modal │
                                                    │ - Holographic Card  │
                                                    │ - QR Code & Pass ID │
                                                    │ - PNG Badge Export  │
                                                    │ - Calendar Sync     │
                                                    └─────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
┌─────────────────────────────────────┐   ┌───────────────────────────────┐
│       Venue & Logistics Guide       │   │        Footer Section         │
│ - Google Maps Interactive Embed     │   │ - SVKM's IOT Dhule Wordmark   │
│ - Directions & Amenities            │   │ - Community Links & Credits   │
│ - Attendee FAQ Accordion            │   │ - Quiet Copyright             │
└─────────────────────────────────────┘   └───────────────────────────────┘
```

### Data Model & State Strategy

- **Registration Record (`RegisteredAttendee`)**:
  - `id`: Unique generated identifier (`DHU-` + 6 uppercase hex characters).
  - `fullName`, `email`, `college`, `year`, `skillLevel`: Form fields.
  - `registeredAt`: Timestamp.
  - `badgeTheme`: Selected holographic accent color.
- **Session Item (`AgendaSession`)**:
  - `id`, `time`, `title`, `speaker`, `track`, `description`, `location`.
- **Speaker Profile (`SpeakerProfile`)**:
  - `name`, `role`, `company`, `avatarSeed`, `bio`, `tags`, `linkedin`.

### Interactive Component & State Mapping

1. **`CountdownTimer`**: Updates every second calculating days, hours, minutes, and seconds until event kickoff, smoothly transitioning to "Live Event in Progress" on the day.
2. **`AgendaFilter`**: Manages active filter state across `All`, `Keynotes`, `Labs`, and `Talks` with smooth layout transitions.
3. **`RegistrationForm` & `BadgePreview`**:
   - Real-time client-side validation for email and required fields.
   - Saves record to `localStorage` so refreshing remembers the user's registration.
   - Provides instant download of the badge image via HTML5 canvas renderer.
4. **`VenueDirections`**: One-click deep links to Google Maps coordinates (`20.906515, 74.775224`) for easy turn-by-turn navigation.
