# WyzeLens React

AI-powered competitive intelligence platform built with React + Vite.

## 🚀 Features

- **Real-time Competitive Intelligence**: Track competitors, news, and market trends
- **AI Analysis**: Powered by Perplexity AI and Claude (via POE)
- **User Authentication**: Clerk authentication with onboarding flow
- **Subscription Management**: Stripe integration for paid plans
- **Multi-Industry Profiles**: Track multiple markets simultaneously
- **Automated Alerts**: Get notified of important competitive changes

## 🏷️ Version Tags

- `v1.0.0-react-stable` - First stable React version with all core features working

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: Supabase
- **Payments**: Stripe
- **Deployment**: Netlify
- **Functions**: Netlify Functions (serverless)

## 📦 Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your keys
4. Run locally: `npm run dev`
5. Build: `npm run build`

## 🔑 Environment Variables

### Frontend (VITE_*)
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`

### Netlify Functions
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLERK_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_BUSINESS`
- `PERPLEXITY_API_KEY`
- `POE_API_KEY`

## 🚨 Important Notes

- This is a React + Vite migration from Next.js to fix ChunkLoadError issues
- Stripe webhook URL must be: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
- Clerk webhook URL must be: `https://your-site.netlify.app/.netlify/functions/clerk-webhook`

## 📝 Restore Points

To restore to this stable version:
```bash
git checkout v1.0.0-react-stable
```

## 🤝 Contributing

This is a private repository. Contact david.laborieux@gmail.com for access.

---

Built with ❤️ by Labwyze Inc.