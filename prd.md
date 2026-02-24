# Product Requirements Document (PRD)
# Resume Builder SaaS — Lightweight Fork of Reactive Resume

**Version:** 2.0
**Date:** February 24, 2026
**Status:** Ready for Implementation via Claude Code

---

## CLAUDE CODE: READ THIS FIRST

This PRD is designed to be executed by Claude Code (Anthropic's CLI coding agent). Every phase includes explicit instructions, commands to run, files to modify, verification steps, and rollback guidance.

### How to Execute This PRD

1. **Read the ENTIRE PRD before starting any work.** Understand the full scope.
2. **Execute phases in STRICT sequential order** (Phase 1 → Phase 2 → ... → Phase 11). Each phase assumes the previous phase is complete and verified.
3. **Never skip a verification step.** If verification fails, fix it before moving to the next phase.
4. **Commit after each phase.** Use conventional commit messages: `feat:`, `refactor:`, `chore:`.
5. **If you encounter an ambiguity**, make the simpler choice and add a `// TODO: Review this decision` comment.
6. **Do NOT install unnecessary packages.** Only install what is explicitly listed in each phase.
7. **Do NOT refactor code that isn't part of the current phase.** Stay focused.

### Skills You Need

Before starting, ensure you are familiar with:
- **Next.js 14+ App Router** — file-based routing, API routes, server components, middleware
- **Prisma ORM** — schema definition, migrations, client generation
- **TypeScript** — strict mode, generics, type inference
- **Tailwind CSS + ShadCN/UI** — utility classes, component library
- **Stripe API** — Checkout, Customer Portal, Webhooks, Subscriptions
- **Clerk or NextAuth (Auth.js)** — OAuth, session management, middleware protection
- **Puppeteer** — headless Chrome, `page.pdf()`, page injection
- **Anthropic Claude API** — Messages API, streaming, system prompts
- **Cloudflare R2 / AWS S3** — bucket operations, presigned URLs
- **pnpm workspaces** — monorepo management without Nx
- **Git** — branching, committing, conflict resolution

### Repository Context

- **Fork from:** `https://github.com/amruthpillai/reactive-resume` (MIT License)
- **The fork is already cloned locally.** Start working from the repo root.
- **Key directories in the original repo:**
  - `apps/client/` — React + Vite frontend (resume editor, templates, preview) **← KEEP THIS**
  - `apps/server/` — NestJS backend **← DELETE THIS**
  - `apps/artboard/` — HTML rendering for PDF/preview **← KEEP THIS (port to new structure)**
  - `apps/printer/` — Browserless PDF service **← DELETE THIS**
  - `libs/` — Shared libraries (types, schemas, utils) **← KEEP SELECTIVELY**

---

## 1. Project Overview

### 1.1 What We're Building
A lightweight, production-ready SaaS resume builder forked from Reactive Resume. Strip the over-engineered infrastructure, replace with lean managed services, add a billing layer, and ship.

### 1.2 Business Model
- **Free Tier:** 1 resume, 3 basic templates, watermarked PDF export, 2 PDF downloads/month, 5 AI suggestions/month
- **Pro Tier ($10/month):** Unlimited resumes, all premium templates, no watermark, unlimited PDF exports, unlimited AI suggestions, custom public resume URL, priority support
- **7-day free trial** of Pro tier (no credit card required)

### 1.3 Core Principle
**Keep the frontend editor, templates, and PDF rendering logic intact.** These represent the core value. Replace everything else with lighter alternatives.

---

## 2. Architecture Transformation

### 2.1 Current → Target Stack

| Layer | Current (REMOVE) | Target (REPLACE WITH) |
|-------|------------------|----------------------|
| **Monorepo** | Nx | pnpm workspaces (simple) |
| **Frontend** | React + Vite | **KEEP AS-IS** |
| **UI Components** | ShadCN/UI + Tailwind | **KEEP AS-IS** |
| **Backend API** | NestJS | Next.js API Routes |
| **ORM** | Prisma | **KEEP** Prisma |
| **Database** | PostgreSQL (Docker) | PostgreSQL on Neon (serverless) |
| **Object Storage** | MinIO (Docker) | Cloudflare R2 |
| **PDF Generation** | Browserless (Docker) | Puppeteer in lightweight microservice |
| **Caching** | Redis (Docker) | REMOVE entirely |
| **Auth** | Custom JWT + OAuth | Clerk OR NextAuth |
| **i18n** | Lingui (30+ languages) | REMOVE. English only. |
| **AI** | OpenAI | Anthropic Claude API (claude-sonnet-4-5-20250929) |
| **CI/CD** | Azure Pipelines | GitHub Actions |
| **Deployment** | Docker Compose (5+ containers) | Vercel + Railway |

### 2.2 Target Directory Structure

```
resume-saas/
├── apps/
│   ├── web/                    # Next.js app (frontend + API routes)
│   │   ├── app/
│   │   │   ├── (marketing)/    # Landing page, pricing, blog
│   │   │   │   ├── page.tsx           # Homepage/hero
│   │   │   │   ├── pricing/page.tsx   # Pricing page
│   │   │   │   └── layout.tsx         # Marketing layout (no sidebar)
│   │   │   ├── (auth)/         # Login, signup
│   │   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   │   ├── (dashboard)/    # User dashboard
│   │   │   │   ├── dashboard/page.tsx       # Resume list
│   │   │   │   ├── settings/page.tsx        # Account settings
│   │   │   │   ├── billing/page.tsx         # Billing management
│   │   │   │   └── layout.tsx               # Dashboard layout (with sidebar)
│   │   │   ├── (builder)/      # Resume editor
│   │   │   │   ├── builder/[id]/page.tsx    # Editor page
│   │   │   │   └── layout.tsx               # Builder layout (full width)
│   │   │   ├── (public)/       # Public resume view
│   │   │   │   └── r/[slug]/page.tsx        # Public resume render
│   │   │   ├── api/            # API routes (replaces NestJS)
│   │   │   │   ├── resumes/
│   │   │   │   │   ├── route.ts             # GET (list), POST (create)
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── route.ts         # GET, PUT, DELETE
│   │   │   │   │       ├── duplicate/route.ts
│   │   │   │   │       ├── public/route.ts  # PATCH toggle
│   │   │   │   │       ├── pdf/route.ts     # POST generate PDF
│   │   │   │   │       └── thumbnail/route.ts
│   │   │   │   ├── billing/
│   │   │   │   │   ├── checkout/route.ts
│   │   │   │   │   ├── portal/route.ts
│   │   │   │   │   ├── webhook/route.ts
│   │   │   │   │   └── status/route.ts
│   │   │   │   ├── ai/
│   │   │   │   │   ├── improve/route.ts
│   │   │   │   │   ├── grammar/route.ts
│   │   │   │   │   ├── shorten/route.ts
│   │   │   │   │   ├── lengthen/route.ts
│   │   │   │   │   ├── summary/route.ts
│   │   │   │   │   └── tailor/route.ts
│   │   │   │   ├── user/
│   │   │   │   │   ├── profile/route.ts
│   │   │   │   │   ├── account/route.ts
│   │   │   │   │   └── usage/route.ts
│   │   │   │   └── public/
│   │   │   │       └── [slug]/
│   │   │   │           ├── route.ts         # GET public resume
│   │   │   │           └── view/route.ts    # POST increment views
│   │   │   └── layout.tsx      # Root layout
│   │   ├── components/
│   │   │   ├── ui/             # ShadCN components (KEEP from RR)
│   │   │   ├── editor/         # Resume editor (PORT from RR apps/client)
│   │   │   ├── templates/      # Resume templates (PORT from RR)
│   │   │   ├── dashboard/      # Dashboard components (NEW)
│   │   │   └── marketing/      # Landing page components (NEW)
│   │   ├── lib/
│   │   │   ├── prisma.ts       # Prisma client singleton
│   │   │   ├── auth.ts         # Clerk or NextAuth config
│   │   │   ├── stripe.ts       # Stripe helpers
│   │   │   ├── storage.ts      # R2/S3 helpers
│   │   │   ├── pdf.ts          # PDF generation client
│   │   │   ├── ai.ts           # Anthropic API helpers
│   │   │   └── plan-limits.ts  # Plan enforcement logic
│   │   ├── hooks/              # Custom React hooks (PORT from RR)
│   │   ├── stores/             # Zustand stores (PORT from RR)
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── middleware.ts        # Auth middleware (protect routes)
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── pdf-service/            # Standalone PDF microservice
│       ├── src/
│       │   └── index.ts        # Hono server + Puppeteer
│       ├── Dockerfile
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── types/                  # Shared TypeScript types
│   │   ├── resume.ts           # Resume data schema types (PORT from RR libs)
│   │   ├── template.ts         # Template metadata types
│   │   └── index.ts
│   └── utils/                  # Shared utilities
│       ├── index.ts
│       └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI
├── turbo.json                  # Turborepo config (or skip if simple)
├── pnpm-workspace.yaml
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 3. Database Schema

### 3.1 Prisma Schema

Claude Code: Create this file at `apps/web/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  name                  String?
  avatarUrl             String?
  plan                  Plan      @default(FREE)
  stripeCustomerId      String?   @unique
  stripeSubscriptionId  String?   @unique
  trialEndsAt           DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  resumes               Resume[]
  usageLogs             UsageLog[]
}

model Resume {
  id            String    @id @default(cuid())
  userId        String
  title         String    @default("Untitled Resume")
  slug          String    @unique @default(cuid())
  templateId    String    @default("classic")
  data          Json      // Full resume JSON (Reactive Resume schema — DO NOT MODIFY)
  isPublic      Boolean   @default(false)
  pdfUrl        String?
  thumbnailUrl  String?
  views         Int       @default(0)
  downloads     Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([slug])
}

model UsageLog {
  id        String   @id @default(cuid())
  userId    String
  type      String   // 'pdf_download' | 'ai_suggestion'
  month     String   // '2026-02' format
  count     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, type, month])
  @@index([userId])
}

enum Plan {
  FREE
  PRO
}
```

### 3.2 Resume Data JSON
**CRITICAL: Keep the existing Reactive Resume JSON schema exactly as-is inside the `data` column.** This schema powers all templates. Do not modify it. Find it in the RR source under `libs/schema/` or similar.

---

## 4. Feature Specifications

### 4.1 Features to KEEP (port from Reactive Resume)
- Resume editor UI (left-panel editor with section management)
- Live preview (real-time rendering)
- Template system (all templates + template switcher)
- Drag and drop (reorder sections and items)
- Rich text editing (bold, italic, links)
- Custom sections (add/remove/rename)
- Resume data schema (JSON structure)
- PDF export pipeline (artboard → headless Chrome → PDF)
- Public resume sharing (unique URL)
- Import from JSON
- Dark/Light mode toggle

### 4.2 Features to REMOVE
- Lingui i18n (all translations, language switcher, `t()`, `<Trans>`, `msg()`)
- Custom TOTP 2FA implementation
- Custom OAuth implementation
- MinIO storage integration
- Redis caching layer
- Browserless Docker service
- NestJS backend entirely
- Nx build system
- Azure Pipelines
- Docker Compose dev setup
- Crowdin integration
- OpenAPI/Swagger docs

### 4.3 Features to ADD (NEW — SaaS Layer)

#### 4.3.1 Stripe Billing
- Stripe Checkout for $10/month Pro subscription
- 7-day free trial (no credit card required)
- Stripe Customer Portal for subscription management
- Webhook handling for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `customer.subscription.trial_will_end`
- Graceful downgrade on cancellation (keep data, restrict features)

#### 4.3.2 Authentication (Clerk or NextAuth)
- Email + password signup/login
- Google OAuth
- GitHub OAuth (optional)
- Session management
- Password reset
- Email verification
- Middleware to protect `/dashboard`, `/builder`, `/settings`, `/billing` routes

#### 4.3.3 Marketing Landing Page
- Hero section with animated resume preview
- Features section (templates, live preview, PDF, AI)
- Pricing table (Free vs Pro)
- FAQ accordion
- Footer (privacy policy, terms, contact)
- SEO meta tags + OG image

#### 4.3.4 User Dashboard
- Resume list with thumbnails
- Create / Duplicate / Delete resume
- Resume analytics (views, downloads)
- Account settings
- Billing link (Stripe Customer Portal)
- Plan indicator + upgrade CTA for free users
- Usage display (downloads remaining, AI calls remaining)

#### 4.3.5 AI Content Suggestions (Anthropic Claude API)
- "Improve Writing" — rewrite bullet point for impact
- "Fix Grammar" — correct grammar/spelling
- "Make Shorter" / "Make Longer" — adjust length
- "Generate Summary" — create professional summary from experience
- "Tailor to Job" — rewrite bullets to match pasted job description
- Streaming responses via SSE
- Rate limits: Free = 5/month, Pro = unlimited

#### 4.3.6 Template Gating
- Tag templates as `free` or `premium`
- 3 free templates, 10+ premium
- All visible, premium locked with upgrade overlay
- Enforce at PDF generation (reject premium template for free users)

#### 4.3.7 PDF Watermark (Free Tier)
- Subtle footer text: "Built with [AppName]"
- Injected via Puppeteer before `page.pdf()`
- No watermark for Pro users

#### 4.3.8 Download Limits
- Free: 2 PDF downloads/month (calendar month reset)
- Pro: Unlimited
- Track via `UsageLog` table
- Show remaining count on dashboard

---

## 5. Plan Enforcement Logic

Claude Code: Create this at `apps/web/lib/plan-limits.ts`

```typescript
import { prisma } from './prisma';
import { Plan } from '@prisma/client';

const PLAN_LIMITS = {
  FREE: {
    maxResumes: 1,
    maxDownloadsPerMonth: 2,
    maxAISuggestionsPerMonth: 5,
    premiumTemplates: false,
    watermarkPDF: true,
  },
  PRO: {
    maxResumes: Infinity,
    maxDownloadsPerMonth: Infinity,
    maxAISuggestionsPerMonth: Infinity,
    premiumTemplates: true,
    watermarkPDF: false,
  },
} as const;

export function getPlanLimits(plan: Plan) {
  return PLAN_LIMITS[plan];
}

export async function getCurrentMonthUsage(userId: string, type: 'pdf_download' | 'ai_suggestion') {
  const month = new Date().toISOString().slice(0, 7); // '2026-02'
  const log = await prisma.usageLog.findUnique({
    where: { userId_type_month: { userId, type, month } },
  });
  return log?.count ?? 0;
}

export async function incrementUsage(userId: string, type: 'pdf_download' | 'ai_suggestion') {
  const month = new Date().toISOString().slice(0, 7);
  await prisma.usageLog.upsert({
    where: { userId_type_month: { userId, type, month } },
    update: { count: { increment: 1 } },
    create: { userId, type, month, count: 1 },
  });
}

export async function checkLimit(userId: string, plan: Plan, action: 'CREATE_RESUME' | 'DOWNLOAD_PDF' | 'USE_PREMIUM_TEMPLATE' | 'AI_SUGGESTION'): Promise<{ allowed: boolean; message?: string }> {
  const limits = getPlanLimits(plan);

  switch (action) {
    case 'CREATE_RESUME': {
      const count = await prisma.resume.count({ where: { userId } });
      if (count >= limits.maxResumes) {
        return { allowed: false, message: `Free plan allows ${limits.maxResumes} resume. Upgrade to Pro for unlimited.` };
      }
      return { allowed: true };
    }
    case 'DOWNLOAD_PDF': {
      const usage = await getCurrentMonthUsage(userId, 'pdf_download');
      if (usage >= limits.maxDownloadsPerMonth) {
        return { allowed: false, message: `Free plan allows ${limits.maxDownloadsPerMonth} downloads/month. Upgrade to Pro for unlimited.` };
      }
      return { allowed: true };
    }
    case 'USE_PREMIUM_TEMPLATE': {
      if (!limits.premiumTemplates) {
        return { allowed: false, message: 'Premium templates require Pro plan.' };
      }
      return { allowed: true };
    }
    case 'AI_SUGGESTION': {
      const usage = await getCurrentMonthUsage(userId, 'ai_suggestion');
      if (usage >= limits.maxAISuggestionsPerMonth) {
        return { allowed: false, message: `Free plan allows ${limits.maxAISuggestionsPerMonth} AI suggestions/month. Upgrade to Pro for unlimited.` };
      }
      return { allowed: true };
    }
  }
}
```

---

## 6. AI Integration

### 6.1 System Prompts

Claude Code: Create this at `apps/web/lib/ai.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPTS: Record<string, string> = {
  improve: `You are a professional resume writer. Rewrite the following resume bullet point to be more impactful, using strong action verbs and quantifiable results where possible. Keep it concise (1-2 lines). Return ONLY the improved text, no explanations.`,
  grammar: `Fix any grammar, spelling, or punctuation errors in the following text. Maintain the original meaning and tone. Return ONLY the corrected text.`,
  shorten: `Shorten the following resume text while keeping the key achievements and impact. Target 50-70% of the original length. Return ONLY the shortened text.`,
  lengthen: `Expand the following resume text with more detail about the impact, technologies used, or scope of work. Keep it professional. Target 130-150% of original length. Return ONLY the expanded text.`,
  summary: `Based on the following work experience entries, write a professional summary for a resume. 2-3 sentences, highlighting key strengths and achievements. Return ONLY the summary text.`,
  tailor: `You are a professional resume writer. Given the job description and current resume bullet point below, rewrite the bullet point to better match the job requirements. Use relevant keywords naturally. Return ONLY the rewritten text.`,
};

export async function generateAISuggestion(
  type: keyof typeof PROMPTS,
  content: string,
  jobDescription?: string
) {
  let systemPrompt = PROMPTS[type];
  let userMessage = content;

  if (type === 'tailor' && jobDescription) {
    userMessage = `Job Description:\n${jobDescription}\n\nCurrent bullet point:\n${content}`;
  }

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  return stream;
}
```

### 6.2 AI API Route Pattern

Each AI route follows this pattern (e.g., `apps/web/app/api/ai/improve/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkLimit, incrementUsage } from '@/lib/plan-limits';
import { generateAISuggestion } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user;
  const limitCheck = await checkLimit(user.id, user.plan, 'AI_SUGGESTION');
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: limitCheck.message }, { status: 403 });
  }

  const { content, jobDescription } = await req.json();
  if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 });

  const stream = await generateAISuggestion('improve', content, jobDescription);
  await incrementUsage(user.id, 'ai_suggestion');

  // Return as SSE stream
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}
```

---

## 7. PDF Generation Service

### 7.1 Architecture
Standalone microservice on Railway/Fly.io. Receives resume data + template ID, renders HTML via Puppeteer, returns PDF buffer.

### 7.2 Implementation

Claude Code: Create this at `apps/pdf-service/src/index.ts`

```typescript
import { Hono } from 'hono';
import puppeteer from 'puppeteer';

const app = new Hono();
const SERVICE_SECRET = process.env.PDF_SERVICE_SECRET;

// Auth middleware
app.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${SERVICE_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

app.post('/generate', async (c) => {
  const { html, watermark, options } = await c.req.json();

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Inject watermark for free tier
  if (watermark) {
    await page.evaluate((appName: string) => {
      const el = document.createElement('div');
      el.style.cssText = 'position:fixed;bottom:10px;right:10px;font-size:8px;color:#999;opacity:0.6;font-family:sans-serif;z-index:9999;';
      el.textContent = `Built with ${appName}`;
      document.body.appendChild(el);
    }, watermark);
  }

  const pdfBuffer = await page.pdf({
    format: options?.format || 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  await browser.close();

  return new Response(pdfBuffer, {
    headers: { 'Content-Type': 'application/pdf' },
  });
});

app.get('/health', (c) => c.json({ status: 'ok' }));

export default {
  port: parseInt(process.env.PORT || '3001'),
  fetch: app.fetch,
};
```

### 7.3 Dockerfile for PDF Service

Claude Code: Create at `apps/pdf-service/Dockerfile`

```dockerfile
FROM node:20-slim

RUN apt-get update && apt-get install -y \
    chromium \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

EXPOSE 3001
CMD ["node", "dist/index.js"]
```

---

## 8. Stripe Integration

### 8.1 Checkout Route

Claude Code: Create at `apps/web/app/api/billing/checkout/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    subscription_data: { trial_period_days: 7 },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId: session.user.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

### 8.2 Webhook Route

Claude Code: Create at `apps/web/app/api/billing/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: 'PRO',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { plan: 'FREE', stripeSubscriptionId: null },
      });
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      // TODO: Send email notification to user about failed payment
      console.warn('Payment failed for customer:', invoice.customer);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

// Disable body parsing for webhook signature verification
export const config = { api: { bodyParser: false } };
```

---

## 9. Environment Variables

Claude Code: Create `.env.example` at project root

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://user:password@host:5432/resume_saas?sslmode=require"

# ============================================
# AUTH — Choose Clerk OR NextAuth, not both
# ============================================

# Option A: Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Option B: NextAuth
# NEXTAUTH_SECRET="generate-a-random-secret-here"
# NEXTAUTH_URL="http://localhost:3000"
# GOOGLE_CLIENT_ID="..."
# GOOGLE_CLIENT_SECRET="..."
# GITHUB_CLIENT_ID="..."
# GITHUB_CLIENT_SECRET="..."

# ============================================
# STRIPE
# ============================================
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# ============================================
# STORAGE (Cloudflare R2 — S3-compatible)
# ============================================
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="resumes"
R2_PUBLIC_URL="https://cdn.yourdomain.com"

# ============================================
# AI (Anthropic Claude)
# ============================================
ANTHROPIC_API_KEY="sk-ant-..."

# ============================================
# PDF SERVICE
# ============================================
PDF_SERVICE_URL="http://localhost:3001"
PDF_SERVICE_SECRET="generate-a-random-secret-here"

# ============================================
# APP
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="ResumeBuilder"
```

---

## 10. Migration Phases — STEP-BY-STEP EXECUTION GUIDE

**IMPORTANT: Execute these in STRICT order. Each phase MUST pass verification before proceeding.**

---

### PHASE 1: Repository Setup & Cleanup

**Goal:** Clean monorepo structure, remove Nx, set up pnpm workspaces.

**Steps:**

1. **Analyze the current repo structure:**
   ```bash
   # Understand what exists
   ls -la
   cat package.json
   cat nx.json
   ls apps/
   ls libs/
   ```

2. **Remove Nx configuration:**
   ```bash
   rm -f nx.json
   rm -f jest.config.ts
   rm -f jest.preset.js
   rm -f azure-pipelines.yml
   rm -f crowdin.yml
   ```

3. **Create pnpm workspace config:**
   Create `pnpm-workspace.yaml`:
   ```yaml
   packages:
     - 'apps/*'
     - 'packages/*'
   ```

4. **Remove Nx dependencies from root package.json:**
   - Remove all `@nx/*` packages from devDependencies
   - Remove all `nx`-related scripts
   - Keep `pnpm` as package manager

5. **Clean up Docker files (keep for reference only):**
   ```bash
   # Don't delete yet — we'll reference compose.yml for env var names
   # Just remove docker from the default dev workflow
   ```

6. **Create basic GitHub Actions CI:**
   Create `.github/workflows/ci.yml`:
   ```yaml
   name: CI
   on: [push, pull_request]
   jobs:
     lint-and-type-check:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v2
           with: { version: 9 }
         - uses: actions/setup-node@v4
           with: { node-version: 20, cache: 'pnpm' }
         - run: pnpm install --frozen-lockfile
         - run: pnpm type-check
         - run: pnpm lint
   ```

7. **Verify:**
   ```bash
   pnpm install
   # Ensure no Nx-related errors
   # The frontend may not build yet — that's OK at this stage
   ```

8. **Commit:**
   ```bash
   git add -A
   git commit -m "chore: remove Nx, set up pnpm workspaces, add GitHub Actions CI"
   ```

---

### PHASE 2: Strip i18n (Lingui)

**Goal:** Remove all internationalization. Replace with plain English strings.

**Steps:**

1. **Identify all Lingui usage:**
   ```bash
   # Find all files using Lingui
   grep -r "@lingui" --include="*.ts" --include="*.tsx" -l
   grep -r "from.*@lingui" --include="*.ts" --include="*.tsx" -l
   grep -r "\bt(" --include="*.ts" --include="*.tsx" -l
   grep -r "<Trans" --include="*.tsx" -l
   grep -r "msg\`" --include="*.ts" --include="*.tsx" -l
   ```

2. **Remove Lingui config files:**
   ```bash
   rm -f lingui.config.ts
   rm -rf locales/ translations/ # wherever translation files live
   ```

3. **Replace all `t()` and `msg()` calls with plain strings:**
   - `t\`Some text\`` → `"Some text"`
   - `t({ message: "Some text" })` → `"Some text"`
   - `msg\`Some text\`` → `"Some text"`

4. **Replace all `<Trans>` components:**
   - `<Trans>Some text</Trans>` → `Some text` (just the inner content)
   - `<Trans id="...">Some text</Trans>` → `Some text`

5. **Remove Lingui imports:**
   - Delete all `import { t, Trans, msg } from '@lingui/macro'`
   - Delete all `import { useLingui } from '@lingui/react'`
   - Delete all `import { i18n } from '@lingui/core'`
   - Delete any Lingui provider wrappers in layout/app files

6. **Remove Lingui packages from package.json:**
   - `@lingui/cli`, `@lingui/core`, `@lingui/macro`, `@lingui/react`, `@lingui/vite-plugin`
   - Any babel plugins for Lingui

7. **Remove language switcher component** from the UI.

8. **Verify:**
   ```bash
   pnpm install
   pnpm build  # or pnpm type-check
   # Fix any remaining TypeScript errors from removed imports
   # Grep again to make sure no Lingui references remain:
   grep -r "@lingui" --include="*.ts" --include="*.tsx" -l
   # Should return nothing
   ```

9. **Commit:**
   ```bash
   git add -A
   git commit -m "refactor: remove Lingui i18n, replace with plain English strings"
   ```

---

### PHASE 3: Replace Backend (NestJS → Next.js)

**Goal:** Replace the entire NestJS backend with a Next.js app that serves both frontend and API.

**This is the LARGEST and MOST CRITICAL phase. Break it into sub-steps.**

#### 3a. Create Next.js App

```bash
cd apps/
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd web/
pnpm add prisma @prisma/client
pnpm add -D prisma
```

#### 3b. Set Up Prisma

1. Create `apps/web/prisma/schema.prisma` with the schema from Section 3.1
2. Run: `npx prisma generate`
3. Create `apps/web/lib/prisma.ts`:
   ```typescript
   import { PrismaClient } from '@prisma/client';

   const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
   export const prisma = globalForPrisma.prisma || new PrismaClient();
   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
   ```

#### 3c. Set Up Auth

Choose Clerk (simpler) or NextAuth:

**If Clerk:**
```bash
pnpm add @clerk/nextjs
```
Create `apps/web/middleware.ts`:
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/builder(.*)',
  '/settings(.*)',
  '/billing(.*)',
  '/api/resumes(.*)',
  '/api/billing(.*)',
  '/api/ai(.*)',
  '/api/user(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

#### 3d. Implement Resume CRUD API Routes

Create all API routes from Section 5 of the PRD (detailed route structure shown in Section 2.2 directory tree above). Start with:

1. `POST /api/resumes` — Create resume (with plan limit check)
2. `GET /api/resumes` — List resumes for user
3. `GET /api/resumes/[id]` — Get single resume (verify ownership)
4. `PUT /api/resumes/[id]` — Update resume (this is the auto-save endpoint, must be fast)
5. `DELETE /api/resumes/[id]` — Delete resume (verify ownership)
6. `POST /api/resumes/[id]/duplicate` — Duplicate resume

**Every route must:**
- Check authentication
- Verify the resume belongs to the authenticated user (for single-resume routes)
- Check plan limits where applicable
- Return proper HTTP status codes
- Handle errors gracefully

#### 3e. Port Frontend Components

1. **Copy** the resume editor components from `apps/client/` to `apps/web/components/editor/`
2. **Copy** the template components to `apps/web/components/templates/`
3. **Copy** the artboard rendering logic to `apps/web/components/artboard/`
4. **Copy** shared types from `libs/` to `packages/types/`
5. **Copy** Zustand stores from `apps/client/` to `apps/web/stores/`
6. **Update all imports** to use the new paths
7. **Replace all NestJS API calls** (likely using axios or fetch to `localhost:3000/api/...`) with calls to the new Next.js API routes

#### 3f. Remove NestJS

```bash
rm -rf apps/server/
```

#### 3g. Verify

```bash
cd apps/web
pnpm dev
# Test in browser:
# - Can you sign up / log in?
# - Can you create a resume?
# - Can you edit a resume and see the preview update?
# - Can you list your resumes?
# - Can you delete a resume?
# - Check browser console for API errors
```

**Commit:**
```bash
git add -A
git commit -m "feat: replace NestJS with Next.js API routes, port frontend"
```

---

### PHASE 4: Replace Storage (MinIO → Cloudflare R2)

**Goal:** Replace self-hosted MinIO with Cloudflare R2.

**Steps:**

1. **Install S3 SDK:**
   ```bash
   pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
   ```

2. **Create storage helper** at `apps/web/lib/storage.ts`:
   ```typescript
   import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
   import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

   const s3 = new S3Client({
     region: 'auto',
     endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
     credentials: {
       accessKeyId: process.env.R2_ACCESS_KEY_ID!,
       secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
     },
   });

   export async function uploadFile(key: string, buffer: Buffer, contentType: string) {
     await s3.send(new PutObjectCommand({
       Bucket: process.env.R2_BUCKET_NAME!,
       Key: key,
       Body: buffer,
       ContentType: contentType,
     }));
     return `${process.env.R2_PUBLIC_URL}/${key}`;
   }

   export async function deleteFile(key: string) {
     await s3.send(new DeleteObjectCommand({
       Bucket: process.env.R2_BUCKET_NAME!,
       Key: key,
     }));
   }

   export async function getSignedDownloadUrl(key: string) {
     return getSignedUrl(s3, new GetObjectCommand({
       Bucket: process.env.R2_BUCKET_NAME!,
       Key: key,
     }), { expiresIn: 3600 });
   }
   ```

3. **Find and replace all MinIO references** in the codebase with the new storage helper.

4. **Remove MinIO packages** from package.json (e.g., `minio` client library).

5. **Verify:** Upload an avatar or generate a PDF and confirm it stores in R2.

6. **Commit:**
   ```bash
   git add -A
   git commit -m "refactor: replace MinIO with Cloudflare R2 storage"
   ```

---

### PHASE 5: Replace PDF Service (Browserless → Puppeteer)

**Goal:** Replace the Browserless Docker service with a lightweight Puppeteer microservice.

**Steps:**

1. **Create the PDF service** using the code from Section 7.
2. **Port the artboard HTML rendering** from `apps/artboard/` — this is the HTML/CSS that Puppeteer renders to PDF. Keep it intact.
3. **Create the API route** `apps/web/app/api/resumes/[id]/pdf/route.ts` that:
   - Fetches resume data from DB
   - Checks download limits (`checkLimit`)
   - Renders the artboard HTML template with the resume data
   - Sends to PDF service
   - Uploads to R2
   - Increments download counter
   - Returns PDF URL
4. **Remove Browserless** references from Docker configs.
5. **Remove** `apps/printer/` directory.

6. **Verify:** Generate a PDF for a test resume. Confirm it downloads correctly and text is selectable.

7. **Commit:**
   ```bash
   git add -A
   git commit -m "feat: replace Browserless with Puppeteer PDF microservice"
   ```

---

### PHASE 6: Remove Redis

**Goal:** Remove all Redis dependencies and usage.

**Steps:**

1. **Find all Redis usage:**
   ```bash
   grep -r "redis" --include="*.ts" --include="*.tsx" -l -i
   grep -r "ioredis" --include="*.ts" --include="*.tsx" -l
   grep -r "REDIS" --include="*.ts" --include="*.tsx" --include="*.env*" -l
   ```

2. **Remove Redis imports, connections, and caching logic.** If caching was used for sessions, rely on Clerk's session management or JWT (stateless).

3. **Remove Redis packages** from package.json (`ioredis`, `redis`, `@nestjs/bull`, etc.)

4. **Remove Redis** from Docker Compose files.

5. **Remove** `REDIS_URL` from `.env.example`.

6. **Verify:** App starts and runs without any Redis connection errors.

7. **Commit:**
   ```bash
   git add -A
   git commit -m "refactor: remove Redis dependency"
   ```

---

### PHASE 7: Add Stripe Billing

**Goal:** Implement paid subscription with Stripe.

**Steps:**

1. **Install Stripe:**
   ```bash
   pnpm add stripe
   ```

2. **Create Stripe helper** at `apps/web/lib/stripe.ts`:
   ```typescript
   import Stripe from 'stripe';
   export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
     apiVersion: '2024-12-18.acacia',
   });
   ```

3. **Implement these API routes** (code in Section 8):
   - `POST /api/billing/checkout` — Create Checkout Session
   - `POST /api/billing/webhook` — Handle Stripe events
   - `POST /api/billing/portal` — Create Customer Portal session
   - `GET /api/billing/status` — Return current plan + subscription info

4. **Add billing UI:**
   - Pricing page with Free vs Pro comparison
   - Upgrade button on dashboard for free users
   - "Manage Subscription" button linking to Stripe Customer Portal
   - Plan badge showing current plan

5. **Integrate plan enforcement** using `checkLimit()` from Section 5 in all relevant API routes.

6. **Verify:**
   - Use Stripe test mode
   - Create a test checkout → complete payment → verify user upgrades to PRO
   - Cancel subscription → verify user downgrades to FREE
   - Test limit enforcement: create >1 resume on free plan → should fail

7. **Commit:**
   ```bash
   git add -A
   git commit -m "feat: add Stripe billing with Free/Pro tiers"
   ```

---

### PHASE 8: Add AI Features

**Goal:** Add AI-powered resume writing assistance using Anthropic Claude.

**Steps:**

1. **Install Anthropic SDK:**
   ```bash
   pnpm add @anthropic-ai/sdk
   ```

2. **Create AI helper** at `apps/web/lib/ai.ts` (code in Section 6.1).

3. **Create all AI API routes** (Section 6.2):
   - `POST /api/ai/improve`
   - `POST /api/ai/grammar`
   - `POST /api/ai/shorten`
   - `POST /api/ai/lengthen`
   - `POST /api/ai/summary`
   - `POST /api/ai/tailor`

4. **Add AI UI to the resume editor:**
   - Add a small "AI" button or dropdown next to each editable text field
   - Options: Improve, Fix Grammar, Shorten, Lengthen
   - Add a "Tailor to Job" button in the toolbar that opens a modal with a text area for pasting job descriptions
   - Add a "Generate Summary" button in the summary section
   - Show streaming AI response in a popover or inline replacement
   - Show usage count for free users: "3 of 5 AI suggestions used this month"

5. **Verify:**
   - Type a resume bullet, click "Improve" → get better version
   - Paste a job description, click "Tailor" → get tailored bullet
   - Exhaust free tier AI limit (5) → verify upgrade prompt appears

6. **Commit:**
   ```bash
   git add -A
   git commit -m "feat: add AI content suggestions using Anthropic Claude"
   ```

---

### PHASE 9: Marketing Landing Page

**Goal:** Build a converting landing page.

**Steps:**

1. **Create marketing layout** at `apps/web/app/(marketing)/layout.tsx` — no sidebar, just a clean navbar + footer.

2. **Build homepage** at `apps/web/app/(marketing)/page.tsx`:
   - **Hero:** Headline + subheadline + CTA button + animated/static resume screenshot
   - **Social proof:** "Join 1,000+ professionals" (placeholder)
   - **Features grid:** 4-6 features with icons (Templates, Live Preview, AI Writing, PDF Export, ATS-Friendly, Privacy)
   - **Template showcase:** Show 3-4 template previews
   - **Pricing section:** Free vs Pro table
   - **FAQ:** 5-6 common questions in accordion
   - **Final CTA:** "Start building your resume — it's free"

3. **Build pricing page** at `apps/web/app/(marketing)/pricing/page.tsx`:
   - Detailed comparison table
   - Stripe checkout integration
   - FAQ specific to billing

4. **SEO:**
   - Add `metadata` export to all pages (title, description, og:image)
   - Create `apps/web/app/sitemap.ts`
   - Create `apps/web/app/robots.ts`

5. **Verify:**
   - Lighthouse score > 90 on landing page
   - All CTAs link to sign-up
   - Pricing links to Stripe Checkout

6. **Commit:**
   ```bash
   git add -A
   git commit -m "feat: add marketing landing page with pricing"
   ```

---

### PHASE 10: Template Gating

**Goal:** Lock premium templates behind Pro plan.

**Steps:**

1. **Create a template registry** — a config file mapping template IDs to metadata:
   ```typescript
   // apps/web/lib/templates.ts
   export const TEMPLATES = {
     classic: { name: 'Classic', tier: 'free', preview: '/templates/classic.png' },
     modern: { name: 'Modern', tier: 'free', preview: '/templates/modern.png' },
     minimal: { name: 'Minimal', tier: 'free', preview: '/templates/minimal.png' },
     executive: { name: 'Executive', tier: 'premium', preview: '/templates/executive.png' },
     creative: { name: 'Creative', tier: 'premium', preview: '/templates/creative.png' },
     // ... add all templates from Reactive Resume
   } as const;
   ```

2. **Add lock overlay** in the template switcher UI. Premium templates show a lock icon and "Upgrade to Pro" overlay for free users.

3. **Enforce at API level** — in `PUT /api/resumes/[id]` and `POST /api/resumes/[id]/pdf`, check if the template is premium and user is on free plan.

4. **Verify:**
   - Free user sees lock on premium templates
   - Free user cannot switch to a premium template (API rejects)
   - Pro user can use any template

5. **Commit:**
   ```bash
   git add -A
   git commit -m "feat: add template gating for Free/Pro tiers"
   ```

---

### PHASE 11: Polish, Deploy, Launch

**Goal:** Production-ready deployment.

**Steps:**

1. **Error monitoring:**
   ```bash
   pnpm add @sentry/nextjs
   ```
   Set up Sentry for error tracking.

2. **Analytics:**
   ```bash
   pnpm add posthog-js
   ```
   Add PostHog for product analytics (sign-ups, conversions, feature usage).

3. **Deploy frontend (Vercel):**
   - Connect GitHub repo to Vercel
   - Set all environment variables from `.env.example`
   - Configure custom domain
   - Enable Edge Functions if using middleware

4. **Deploy PDF service (Railway):**
   - Create new Railway project
   - Deploy from `apps/pdf-service/` with Dockerfile
   - Set `PDF_SERVICE_SECRET` env var
   - Note the deployed URL → set as `PDF_SERVICE_URL` in Vercel

5. **Set up database (Neon):**
   - Create Neon project
   - Run `npx prisma migrate deploy`
   - Set `DATABASE_URL` in Vercel

6. **Set up storage (Cloudflare R2):**
   - Create R2 bucket
   - Set up public access domain
   - Set R2 env vars in Vercel

7. **Configure Stripe production:**
   - Switch from test keys to live keys
   - Set up webhook endpoint in Stripe Dashboard pointing to `https://yourdomain.com/api/billing/webhook`
   - Create production product + price

8. **Final testing checklist:**
   - [ ] Sign up with email → verify email → land on dashboard
   - [ ] Sign up with Google OAuth → land on dashboard
   - [ ] Create a resume → editor loads → type content → preview updates
   - [ ] Switch templates → preview updates
   - [ ] Download PDF → PDF is correct, text is selectable
   - [ ] Free user: try creating 2nd resume → upgrade prompt
   - [ ] Free user: download PDF → has watermark
   - [ ] Free user: try premium template → upgrade prompt
   - [ ] Subscribe to Pro via Stripe → plan updates → limits removed
   - [ ] Pro user: download PDF → no watermark
   - [ ] Pro user: premium templates work
   - [ ] Use AI features → streaming response appears
   - [ ] Free user: exhaust AI limit → upgrade prompt
   - [ ] Cancel subscription → plan downgrades to Free
   - [ ] Public resume link works
   - [ ] Landing page loads fast (Lighthouse > 90)
   - [ ] Mobile responsive (landing + dashboard + editor)

9. **Commit:**
   ```bash
   git add -A
   git commit -m "feat: production deployment with Sentry, PostHog, and deployment configs"
   ```

---

## 11. Files & Directories to DELETE from Fork

Claude Code: Run these deletions **during the relevant phases** (not all at once).

```bash
# Phase 1: Nx + CI cleanup
rm -f nx.json jest.config.ts jest.preset.js azure-pipelines.yml crowdin.yml

# Phase 2: i18n cleanup
rm -f lingui.config.ts
# rm -rf locales/ (find actual path first)

# Phase 3: NestJS backend
rm -rf apps/server/

# Phase 5: Browserless printer
rm -rf apps/printer/

# Phase 6: Redis
# Remove from compose.yml and .env

# Final: Docker (optional — keep if self-hosting is desired)
# rm -f compose.yml compose.dev.yml .dockerignore
```

**Packages to remove from root/app package.json across phases:**
- `@lingui/*` (Phase 2)
- `@nestjs/*` (Phase 3)
- `minio` (Phase 4)
- `ioredis`, `redis`, `@nestjs/bull` (Phase 6)
- `@nx/*`, `nx` (Phase 1)

---

## 12. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Editor latency (typing → preview) | < 100ms |
| PDF generation time | < 5 seconds |
| API response (CRUD) | < 200ms |
| Landing page Lighthouse | > 90 |
| Auto-save interval | 5 seconds (debounced) |
| Uptime target | 99.9% |
| Database backups | Daily (automated via Neon) |
| Max concurrent PDF generations | 50 |
| Rate limit (API) | 100 req/min per user |
| Rate limit (AI routes) | 10 req/min per user |

---

## 13. Cost Estimates (at ~1,000 users)

| Service | Provider | Monthly Cost |
|---------|----------|-------------|
| Hosting | Vercel Pro | $20 |
| Database | Neon | $0–19 |
| PDF Service | Railway | $5–10 |
| Storage | Cloudflare R2 | $1–5 |
| AI API | Anthropic | $10–50 |
| Auth | Clerk | $0–25 |
| Stripe fees | 2.9% + 30¢/txn | ~$35 (on 100 Pro users) |
| Error monitoring | Sentry Free | $0 |
| Analytics | PostHog Free | $0 |
| **Total** | | **~$70–165/month** |

**Break-even:** 7–17 paying users at $10/month.

---

## 14. Success Metrics

| Metric | Month 1 | Month 6 |
|--------|---------|---------|
| Signups | 500 | 5,000 |
| Free → Pro conversion | 5% | 8% |
| MRR | $250 | $4,000 |
| Churn rate | < 10% | < 5% |
| PDF generations/day | 100 | 2,000 |
| Lighthouse score | > 90 | > 95 |

---

## 15. Quick Reference for Claude Code

### Commands You'll Use Often
```bash
# Start dev server
pnpm dev

# Type check
pnpm type-check

# Database
npx prisma generate        # After schema changes
npx prisma migrate dev     # Create migration
npx prisma migrate deploy  # Apply migration (production)
npx prisma studio          # Visual DB browser

# Build
pnpm build

# Search codebase
grep -r "SEARCH_TERM" --include="*.ts" --include="*.tsx" -l

# Install packages
pnpm add <package>         # Production dependency
pnpm add -D <package>      # Dev dependency
```

### When Stuck
- If a Reactive Resume component has complex imports, trace back through the `libs/` directory to find the source type/util
- If a template doesn't render, check the artboard HTML — that's what Puppeteer needs
- If auth fails, check middleware.ts route matching
- If Stripe webhook fails, check signature verification and raw body parsing
- If PDF is blank, check if the artboard HTML has all CSS inlined (Puppeteer can't fetch external stylesheets from localhost)

---

*End of PRD v2.0. This document is self-contained and designed for autonomous execution by Claude Code.*
