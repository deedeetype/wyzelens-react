-- Find duplicate competitors in the latest scan
SELECT 
  c.scan_id,
  c.name,
  c.is_watchlist,
  c.threat_score,
  c.domain,
  c.created_at,
  s.industry
FROM competitors c
JOIN scans s ON s.id = c.scan_id
WHERE s.user_id = 'user_3AogVRnQeu4MTyx4lJxYYuqBaMr'
  AND s.industry = 'Technology (AI, Robotics & Emerging Tech)'
ORDER BY c.name, c.created_at DESC;
