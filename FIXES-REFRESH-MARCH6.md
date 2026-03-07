# Correctifs Refresh Automatique - 6 mars 2026

## 🐛 Problèmes identifiés

### 1. Badge "NEW" présent partout
**Cause:** Aucune logique pour déterminer si un item est nouveau depuis le dernier refresh
**Solution:** Ajouter `last_refreshed_at` dans la requête et comparer `created_at > last_refreshed_at`

### 2. Statut "running" bloqué après plusieurs heures
**Cause:** Race condition entre timeout (45s) et fonction Netlify qui continue
**Solution:** 
- Augmenter timeout à 5 minutes
- Ajouter un fallback dans la BD (trigger PostgreSQL qui marque "failed" après 10 min)

### 3. Compteurs manquants dans l'UI
**Cause:** Les compteurs sont écrits dans `refresh_logs` mais pas affichés
**Solution:** Ajouter une section "Recent Refreshes" dans ScanHistoryView.tsx

---

## ✅ Plan de correctifs

### Étape 1: Ajouter logique "NEW" badge (30 min)
**Fichiers:**
- `src/contexts/NewsFeedContext.tsx` - Ajouter `lastRefreshedAt` dans fetch
- `src/contexts/AlertsContext.tsx` - Ajouter `lastRefreshedAt` dans fetch  
- `src/contexts/InsightsContext.tsx` - Ajouter `lastRefreshedAt` dans fetch
- `src/components/NewsFeedView.tsx` - Comparer `created_at > lastRefreshedAt`
- `src/components/AlertsView.tsx` - Comparer `created_at > lastRefreshedAt`
- `src/components/InsightsView.tsx` - Comparer `created_at > lastRefreshedAt`

**Logique:**
```typescript
const isNew = item.created_at && lastRefreshedAt && 
              new Date(item.created_at) > new Date(lastRefreshedAt)

{isNew && (
  <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400">
    NEW
  </span>
)}
```

### Étape 2: Corriger timeout "running" (20 min)
**Fichiers:**
- `pages/api/cron/refresh-scans.ts` - Augmenter timeout à 5 min (300s)

**Alternative (optionnelle):** 
Créer un trigger PostgreSQL dans Supabase:
```sql
CREATE OR REPLACE FUNCTION mark_stale_refreshes_failed()
RETURNS void AS $$
BEGIN
  UPDATE refresh_logs
  SET status = 'failed', 
      error_message = 'Timeout: Process exceeded 10 minutes',
      completed_at = NOW()
  WHERE status = 'running' 
    AND created_at < NOW() - INTERVAL '10 minutes';
END;
$$ LANGUAGE plpgsql;

-- Trigger via pg_cron (si disponible) ou via GitHub Actions toutes les 15 min
```

### Étape 3: Afficher compteurs refresh (40 min)
**Fichiers:**
- `src/components/ScanHistoryView.tsx` - Ajouter section "Recent Refreshes"

**Requête:**
```typescript
const { data: refreshLogs } = await supabase
  .from('refresh_logs')
  .select('*')
  .eq('scan_id', scanId)
  .order('created_at', { ascending: false })
  .limit(10)
```

**UI:**
```tsx
{refreshLogs.map(log => (
  <div key={log.id} className="flex justify-between">
    <span>{new Date(log.created_at).toLocaleString()}</span>
    <span className={log.status === 'success' ? 'text-green-400' : 'text-red-400'}>
      {log.status === 'success' 
        ? `+${log.new_alerts_count} alerts, +${log.new_insights_count} insights, +${log.new_news_count} news`
        : log.error_message}
    </span>
  </div>
))}
```

---

## 🧪 Tests à effectuer

1. **NEW badge:**
   - Lancer un refresh manuel → Vérifier que seuls les nouveaux items ont "NEW"
   - Attendre 1h → Relancer refresh → Vérifier que les anciens items n'ont plus "NEW"

2. **Timeout:**
   - Simuler une erreur dans scan-step → Vérifier que le log passe à "failed" après 5 min
   - Vérifier dans Netlify logs que le timeout correspond

3. **Compteurs:**
   - Après un refresh réussi → Ouvrir Scan History → Vérifier que les compteurs s'affichent
   - Vérifier que les logs "failed" affichent l'erreur

---

## 📋 Ordre d'exécution recommandé

1. **Étape 2 (timeout)** - Impact immédiat sur les logs bloqués
2. **Étape 1 (NEW badge)** - Amélioration UX principale
3. **Étape 3 (compteurs)** - Nice-to-have pour monitoring

---

**Temps estimé total:** 1h30
**Priorité:** Haute (affecte la perception de fiabilité du système)
