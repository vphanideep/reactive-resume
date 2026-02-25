<div align="center">
  <a href="https://rxresu.me">
    <img src="public/opengraph/banner.jpg" alt="Reactive Resume" />
  </a>

  <h1>Reactive Resume</h1>

  <p>A free, open-source resume builder with a Pro tier powered by Stripe billing, AI writing assistance, and 13 professionally designed templates.</p>

  <p>
    <a href="https://rxresu.me"><strong>Get Started</strong></a>
    ·
    <a href="https://docs.rxresu.me"><strong>Learn More</strong></a>
  </p>
</div>

---

## Features

**Resume Building**

- Real-time preview as you type
- Multiple export formats (PDF, JSON)
- Drag-and-drop section ordering
- Custom sections for any content type
- Rich text editor with formatting support

**Templates**

- 13 professionally designed templates (3 free, 10 Pro)
- A4 and Letter size support
- Customizable colors, fonts, and spacing
- Custom CSS for advanced styling

**AI Integration**

- AI-powered writing suggestions (OpenAI, Google Gemini, Anthropic Claude, Ollama)
- Improve, fix grammar, or rewrite resume content

**Billing & Plans**

- Free tier: 1 resume, 3 templates, 2 PDF downloads/month, 5 AI suggestions/month
- Pro tier ($10/month): Unlimited resumes, all 13 templates, unlimited downloads & AI, no watermark
- Stripe-powered checkout and subscription management
- **Billing is fully optional** — when Stripe is not configured, all users are treated as Pro (no restrictions)

**Privacy & Control**

- Self-host on your own infrastructure
- No tracking or analytics by default
- Full data export at any time
- Delete your data permanently with one click

**Extras**

- Share resumes via unique links
- Import from JSON Resume format
- Dark mode support
- Passkey and two-factor authentication

## Templates

<table>
  <tr>
    <td align="center">
      <img src="public/templates/jpg/azurill.jpg" alt="Azurill" width="150" />
      <br /><sub><b>Azurill</b> (Pro)</sub>
    </td>
    <td align="center">
      <img src="public/templates/jpg/bronzor.jpg" alt="Bronzor" width="150" />
      <br /><sub><b>Bronzor</b> (Free)</sub>
    </td>
    <td align="center">
      <img src="public/templates/jpg/chikorita.jpg" alt="Chikorita" width="150" />
      <br /><sub><b>Chikorita</b> (Pro)</sub>
    </td>
    <td align="center">
      <img src="public/templates/jpg/ditto.jpg" alt="Ditto" width="150" />
      <br /><sub><b>Ditto</b> (Free)</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="public/templates/jpg/gengar.jpg" alt="Gengar" width="150" />
      <br /><sub><b>Gengar</b> (Pro)</sub>
    </td>
    <td align="center">
      <img src="public/templates/jpg/glalie.jpg" alt="Glalie" width="150" />
      <br /><sub><b>Glalie</b> (Pro)</sub>
    </td>
    <td align="center">
      <img src="public/templates/jpg/kakuna.jpg" alt="Kakuna" width="150" />
      <br /><sub><b>Kakuna</b> (Free)</sub>
    </td>
    <td align="center">
      <img src="public/templates/jpg/lapras.jpg" alt="Lapras" width="150" />
      <br /><sub><b>Lapras</b> (Pro)</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="public/templates/jpg/leafish.jpg" alt="Leafish" width="150" />
      <br /><sub><b>Leafish</b> (Pro)</sub>
    </td>
    <td align="center">
      <img src="public/templates/jpg/onyx.jpg" alt="Onyx" width="150" />
      <br /><sub><b>Onyx</b> (Pro)</sub>
    </td>
    <td align="center">
      <img src="public/templates/jpg/pikachu.jpg" alt="Pikachu" width="150" />
      <br /><sub><b>Pikachu</b> (Pro)</sub>
    </td>
    <td align="center">
      <img src="public/templates/jpg/rhyhorn.jpg" alt="Rhyhorn" width="150" />
      <br /><sub><b>Rhyhorn</b> (Pro)</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="public/templates/jpg/ditgar.jpg" alt="Ditgar" width="150" />
      <br /><sub><b>Ditgar</b> (Pro)</sub>
    </td>
  </tr>
</table>

## Tech Stack

| Category         | Technology                           |
| ---------------- | ------------------------------------ |
| Framework        | TanStack Start (React 19, Vite 8)   |
| Runtime          | Node.js (Nitro server)              |
| Language         | TypeScript                           |
| Database         | PostgreSQL with Drizzle ORM          |
| API              | ORPC (Type-safe RPC)                 |
| Auth             | Better Auth                          |
| Billing          | Stripe (optional)                    |
| Styling          | Tailwind CSS v4                      |
| UI Components    | Radix UI + Phosphor Icons            |
| State Management | Zustand + TanStack Query             |
| AI               | OpenAI, Anthropic, Google Gemini, Ollama |

## Local Development Setup

### Prerequisites

- **Node.js** 24+ (or use `nvm` / `fnm` to match `.node-version`)
- **pnpm** (install via `corepack enable && corepack prepare pnpm@latest --activate`)
- **Docker** and **Docker Compose** (for PostgreSQL and supporting services)

### 1. Clone and install

```bash
git clone https://github.com/amruthpillai/reactive-resume.git
cd reactive-resume
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

The defaults in `.env.example` are pre-configured for local development with `docker compose`. The only required variables are:

| Variable           | Default                                          | Notes                          |
| ------------------ | ------------------------------------------------ | ------------------------------ |
| `APP_URL`          | `http://localhost:3000`                          | App URL                        |
| `DATABASE_URL`     | `postgresql://postgres:postgres@localhost:5432/postgres` | PostgreSQL connection string |
| `AUTH_SECRET`      | `change-me-to-a-secure-secret-key-in-production` | Any random string for dev     |
| `PRINTER_ENDPOINT` | `ws://localhost:4000?token=1234567890`           | Browserless WebSocket URL      |

### 3. Start backing services

```bash
docker compose -f compose.dev.yml up -d
```

This starts:

| Service        | Port | Description                                |
| -------------- | ---- | ------------------------------------------ |
| PostgreSQL     | 5432 | Database                                   |
| Browserless    | 4000 | Headless Chromium for PDF generation        |
| SeaweedFS      | 8333 | S3-compatible file storage (optional)       |
| Mailpit        | 1025, 8025 | SMTP sink for email testing           |
| Adminer        | 8080 | Database management UI                      |

### 4. Run the dev server

```bash
pnpm dev
```

The app runs at **http://localhost:3000**. Database migrations run automatically on startup.

### 5. Common commands

```bash
pnpm dev            # Start dev server (port 3000)
pnpm build          # Production build
pnpm start          # Start production server
pnpm lint           # Lint & format (Biome)
pnpm typecheck      # Type check (tsgo)
pnpm db:generate    # Generate migration files
pnpm db:migrate     # Run migrations
pnpm db:push        # Push schema changes directly
pnpm db:studio      # Open Drizzle Studio (database GUI)
```

## Stripe Billing (Optional)

**Stripe is completely optional.** When the `STRIPE_SECRET_KEY` environment variable is not set:

- All users are automatically treated as **Pro** (no restrictions)
- All 13 templates are unlocked
- No usage limits on resumes, PDF downloads, or AI suggestions
- The checkout and portal endpoints return a friendly error if called

This means you can develop and test the entire app locally without ever configuring Stripe.

### Enabling Stripe for development

If you want to test the billing flow:

1. Create a [Stripe test-mode account](https://dashboard.stripe.com/test/dashboard)
2. Get your **test secret key** from the Stripe Dashboard → Developers → API keys
3. Create a Product + Price in Stripe for the Pro plan (recurring, $10/month)
4. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and forward webhooks:

```bash
stripe listen --forward-to http://localhost:3000/api/billing/webhook
```

5. Add the keys to your `.env`:

```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."      # Printed by `stripe listen`
STRIPE_PRO_PRICE_ID="price_..."         # From the product you created
```

6. Restart the dev server. Billing is now active, and free-tier restrictions apply.

### Manually testing Pro access without Stripe

If you want to test Pro-specific features without Stripe, simply leave the `STRIPE_*` vars empty (the default). All users will have full Pro access.

Alternatively, if Stripe is configured and you want to manually upgrade a user, run this SQL in Adminer (http://localhost:8080) or `psql`:

```sql
UPDATE "user" SET plan = 'pro' WHERE email = 'your@email.com';
```

## Self-Hosting

Reactive Resume can be self-hosted using Docker. The stack includes:

- **PostgreSQL** — Database for storing user data and resumes
- **Printer** — Headless Chromium service for PDF and screenshot generation
- **SeaweedFS** (optional) — S3-compatible storage for file uploads

Pull the latest image from Docker Hub or GitHub Container Registry:

```bash
# Docker Hub
docker pull amruthpillai/reactive-resume:latest

# GitHub Container Registry
docker pull ghcr.io/amruthpillai/reactive-resume:latest
```

See the [self-hosting guide](https://docs.rxresu.me/self-hosting/docker) for complete instructions.

## Documentation

Comprehensive guides are available at [docs.rxresu.me](https://docs.rxresu.me):

| Guide                                                                       | Description                       |
| --------------------------------------------------------------------------- | --------------------------------- |
| [Getting Started](https://docs.rxresu.me/getting-started)                   | First-time setup and basic usage  |
| [Self-Hosting](https://docs.rxresu.me/self-hosting/docker)                  | Deploy on your own server         |
| [Development Setup](https://docs.rxresu.me/contributing/development)        | Local development environment     |
| [Project Architecture](https://docs.rxresu.me/contributing/architecture)    | Codebase structure and patterns   |

## Contributing

Contributions make open-source thrive. Whether fixing a typo or adding a feature, all contributions are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See the [development setup guide](https://docs.rxresu.me/contributing/development) for detailed instructions on how to set up the project locally.

## License

[MIT](./LICENSE) — do whatever you want with it.
