# AWS re:Invent Watch & Build Party Dhule

Official event hub and digital pass portal for the **AWS re:Invent Watch & Build Party**, hosted by the AWS Student Builder Group Dhule.

---

## 🌟 Overview

The **AWS re:Invent Watch & Build Party Dhule** web portal provides attendees with an interactive, immersive event companion experience. Participants can explore the agenda, check keynote sessions, review speaker lineups, navigate venue directions, and generate digital builder passes.

- **Date:** Friday, 04 December 2026
- **Time:** 09:00 AM – 04:00 PM IST
- **Venue:** Hotel Anand Regency Riverfront, Dhule, Maharashtra, India
- **Organizer:** AWS Student Builder Group Dhule

---

## 🚀 Features

- **Interactive Agenda & Tracks:** Filter sessions by keynote, workshop, panel, hands-on labs, and builder challenges.
- **Digital Builder Pass & Registration:** Dynamic attendee registration system with instant verifiable pass generation.
- **Official AWS Builder Verification:** Direct verification with AWS Builder Center to validate builder profiles and badges.
- **Venue Navigation & Calendar Integration:** Live maps directions, schedule downloads, and 1-click Google Calendar syncing.
- **Smooth Animations & Fluid UI:** Powered by Lenis smooth scrolling, GSAP animations, and Tailwind CSS.

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [GSAP](https://greensock.com/gsap/) & [Lenis](https://lenis.darkroom.engineering/) & [Motion](https://motion.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Language:** TypeScript

---

## 💻 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Project Architecture

The project is structured into full-stack feature-based modules:
- **`Server/`**: Express + TypeScript backend providing server-side admin authentication (`ADMIN_KEY`), session management, registration APIs, and AWS builder verification proxy.
- **`Client/`**: React 19 + Vite frontend featuring event landing, registration, and server-protected admin portal.

### 2. Server Setup

```bash
cd Server
npm install
npm run dev
```

The Server starts on `http://localhost:5000`.
- The admin key is configured in `Server/.env` with `ADMIN_KEY`
- Protected admin routes require this key for authentication and issue signed session tokens.

For Supabase, run [supabase-unified-setup.sql](Server/supabase-unified-setup.sql) first, then [supabase-schema-restructure.sql](Server/supabase-schema-restructure.sql) in the SQL Editor. The restructuring migration moves legacy agent sessions, preserves check-in metadata, and adds alias uniqueness. It rolls back if duplicate normalized aliases need reconciliation. Set `SUPABASE_SERVICE_ROLE_KEY` on the server to access the private `agent_sessions` table.

### 3. Client Setup

```bash
cd Client
npm install
npm run dev
```

The Client runs on `http://localhost:3000` with automatic `/api` proxying to `http://localhost:5000`. No client API keys are required.

---

## 📜 License

**Copyright © 2026 Saurabh Girase. All rights reserved.**

This repository and its source code are licensed under a **proprietary, personal license**. 

- **No Unauthorized Use:** No person or entity may use, copy, reproduce, modify, merge, publish, distribute, sublicense, sell, or create derivative works of any part of this software, in whole or in part, in any form or by any means, without prior express written permission and consent from the copyright holder.
- **Notice:** Do not copy this project to @sbg at gcoek Kolhapur.
- For full details, see the [`LICENSE`](LICENSE) file.
- For permission inquiries or collaboration requests, contact: [saurabhgirase2005@gmail.com](mailto:saurabhgirase2005@gmail.com).

