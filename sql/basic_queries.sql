USE football_lab;

-- B1: filtrado con tres condiciones
SELECT match_id, goals, possession
FROM team_match_stats
WHERE venue = 'away'
  AND possession < 30
  AND goals >= 3
ORDER BY goals DESC, possession ASC;

-- B2: JOIN entre dos entidades
SELECT t.name AS team, s.match_id, s.red_cards
FROM team_match_stats AS s
JOIN team AS t ON t.team_id = s.team_id
WHERE s.red_cards = 2
ORDER BY t.name, s.match_id;

-- B3: JOIN entre cuatro entidades
SELECT se.label AS season, m.match_date, t.name AS team, s.venue, s.goals
FROM team_match_stats AS s
JOIN football_match AS m ON m.match_id = s.match_id
JOIN season AS se ON se.season_id = m.season_id
JOIN team AS t ON t.team_id = s.team_id
WHERE s.goals >= 7
ORDER BY s.goals DESC, m.match_date;

-- B4: agregacion con GROUP BY
SELECT venue,
       COUNT(*) AS team_matches,
       ROUND(AVG(goals), 3) AS avg_goals,
       ROUND(AVG(possession), 2) AS avg_possession,
       ROUND(AVG(shots_on_target), 3) AS avg_shots_on_target
FROM team_match_stats
GROUP BY venue;
