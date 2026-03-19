# Test Trial Logic

## Option 1: Test avec un nouveau compte
1. Créer un compte test sur https://wyzelens.com/sign-up
2. Clerk crée automatiquement `user.createdAt = now()`
3. Dashboard devrait afficher: "7 days remaining in your free trial"

## Option 2: Forcer une date de test (temporaire)

Modifier `src/hooks/useSubscription.ts` ligne 28:

```typescript
// BEFORE (production)
const userCreatedAt = user.createdAt ? user.createdAt.getTime() : Date.now()

// AFTER (test - simulate 3 days old account)
const userCreatedAt = Date.now() - (3 * 24 * 60 * 60 * 1000)  // 3 days ago

// OR (test - simulate expired)
const userCreatedAt = Date.now() - (10 * 24 * 60 * 60 * 1000)  // 10 days ago (expired)
```

**Rebuild & test:**
```bash
npm run build
# Deploy to Netlify or test locally with npm run dev
```

## Option 3: Test avec Clerk dashboard

1. Aller sur https://dashboard.clerk.com
2. Users → Sélectionner ton user
3. Regarder la date "Created at"
4. Le trial est calculé à partir de cette date (pas modifiable)

## Scenarios attendus

| Days since creation | Banner color | Message | CTA |
|---------------------|--------------|---------|-----|
| 0-4 days | Blue | "X days remaining" | Link "View Plans" |
| 5-7 days | Amber | "X days left" | Button "Upgrade" |
| 8+ days | Red overlay | "Trial expired" | Button "Upgrade Now" |

## Pourquoi Supabase user_subscriptions ne fonctionne pas?

- Cette table est remplie **seulement par Stripe webhook** (paid plans)
- Free users n'ont **jamais** d'entrée dans cette table
- Le code utilise **Clerk user.createdAt** comme source de vérité pour free users

## Pour tester en dev local

```bash
npm run dev
# Ouvrir http://localhost:5173
# Hard refresh: Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows)
```

Modifier temporairement `useSubscription.ts` pour simuler des dates différentes.
