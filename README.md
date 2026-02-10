# FreelanceInvoice

FreelanceInvoice is a Tauri desktop app for freelancers to track work, manage clients/projects, generate invoices, and produce AI-assisted project estimates.

## Features

- Clients, projects, and time tracking
- Invoice builder + invoice history
- AI project estimation (requires your own Claude API key)
- Stripe payment link generation (requires your own Stripe API key; premium-tier feature in-app)

## Tech Stack

- Tauri (Rust) + Vite + React + TypeScript
- Zustand for state
- Recharts for charts
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js
- pnpm
- For the desktop app: Rust toolchain + Tauri prerequisites for your OS

### Install

```bash
pnpm install
```

### Run (Web Dev)

```bash
pnpm dev
```

### Run (Tauri Desktop)

```bash
pnpm tauri dev
```

### Build

```bash
pnpm build
```

To build a desktop bundle:

```bash
pnpm tauri build
```

## Configuration (API Keys)

You can set API keys in the app under **Settings**:

- Claude API key: used for AI project estimation
- Stripe API key: used for generating Stripe payment links

Security note: do not hardcode keys in code or commit them to the repo. Keep keys in local app settings only.

## Recommended IDE Setup

- VS Code + the Tauri extension + rust-analyzer
