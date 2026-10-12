USE football_lab;

-- A1: puntos acumulados y posicion segun partidos disputados
WITH team_results AS (
    SELECT own.team_id,
           CASE
               WHEN own.goals > rival.goals THEN 3
               WHEN own.goals = rival.goals THEN 1
               ELSE 0
           END AS points
    FROM team_match_stats AS own
    JOIN team_match_stats AS rival
      ON rival.match_id = own.match_id
     AND rival.team_id <> own.team_id
)
SELECT t.name AS team,
       COUNT(*) AS matches_played,
       RANK() OVER (ORDER BY COUNT(*) DESC) AS matches_rank,
       SUM(r.points) AS total_points,
       ROUND(SUM(r.points) / COUNT(*), 3) AS points_per_match
FROM team_results AS r
JOIN team AS t ON t.team_id = r.team_id
GROUP BY t.team_id, t.name
ORDER BY total_points DESC
LIMIT 10;

-- A2: posesion promedio en partidos ganados
SELECT t.name AS team,
       COUNT(*) AS wins,
       ROUND(AVG(own.possession), 2) AS avg_possession_in_wins
FROM team_match_stats AS own
JOIN team_match_stats AS rival
  ON rival.match_id = own.match_id
 AND rival.team_id <> own.team_id
JOIN team AS t ON t.team_id = own.team_id
WHERE own.goals > rival.goals
GROUP BY t.team_id, t.name
HAVING COUNT(*) >= 30
ORDER BY avg_possession_in_wins DESC
LIMIT 5;

-- A3: diferencia entre tiros a puerta y goles por equipo y temporada
SELECT se.label AS season,
       t.name AS team,
       SUM(s.shots_on_target) AS shots_on_target,
       SUM(s.goals) AS goals,
       SUM(s.shots_on_target) - SUM(s.goals) AS difference,
       ROUND(100 * SUM(s.goals) / SUM(s.shots_on_target), 1) AS conversion_pct
FROM team_match_stats AS s
JOIN football_match AS m ON m.match_id = s.match_id
JOIN season AS se ON se.season_id = m.season_id
JOIN team AS t ON t.team_id = s.team_id
GROUP BY se.season_id, se.label, t.team_id, t.name
ORDER BY difference DESC
LIMIT 5;

-- A4: tarjetas rojas y goles por temporada
SELECT se.label AS season,
       COUNT(DISTINCT m.match_id) AS matches,
       SUM(s.red_cards) AS total_red_cards,
       ROUND(SUM(s.red_cards) / COUNT(DISTINCT m.match_id), 3) AS red_cards_per_match,
       SUM(s.goals) AS total_goals,
       ROUND(SUM(s.goals) / COUNT(DISTINCT m.match_id), 3) AS goals_per_match
FROM team_match_stats AS s
JOIN football_match AS m ON m.match_id = s.match_id
JOIN season AS se ON se.season_id = m.season_id
GROUP BY se.season_id, se.label
ORDER BY total_red_cards DESC;
