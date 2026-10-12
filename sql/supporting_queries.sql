USE football_lab;

-- A2 complemento: mismos promedios sin minimo de victorias
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
ORDER BY avg_possession_in_wins DESC
LIMIT 3;

-- A2 complemento: victorias con menos de 50 % y 40 % de posesion
SELECT COUNT(*) AS total_wins,
       SUM(own.possession < 50) AS wins_below_50,
       ROUND(100 * SUM(own.possession < 50) / COUNT(*), 2) AS pct_below_50,
       SUM(own.possession < 40) AS wins_below_40,
       ROUND(100 * SUM(own.possession < 40) / COUNT(*), 2) AS pct_below_40
FROM team_match_stats AS own
JOIN team_match_stats AS rival
  ON rival.match_id = own.match_id
 AND rival.team_id <> own.team_id
WHERE own.goals > rival.goals;

-- A2 complemento: proporcion base de participaciones con menos de 50 % de posesion
SELECT COUNT(*) AS team_matches,
       SUM(possession < 50) AS below_50,
       ROUND(100 * SUM(possession < 50) / COUNT(*), 2) AS pct_below_50
FROM team_match_stats;

-- A3 complemento: conversion global de tiros a puerta en goles
SELECT SUM(shots_on_target) AS shots_on_target,
       SUM(goals) AS goals,
       ROUND(100 * SUM(goals) / SUM(shots_on_target), 1) AS conversion_pct
FROM team_match_stats;

-- A3 complemento: menor conversion por equipo y temporada
SELECT se.label AS season,
       t.name AS team,
       SUM(s.shots_on_target) AS shots_on_target,
       SUM(s.goals) AS goals,
       ROUND(100 * SUM(s.goals) / SUM(s.shots_on_target), 1) AS conversion_pct
FROM team_match_stats AS s
JOIN football_match AS m ON m.match_id = s.match_id
JOIN season AS se ON se.season_id = m.season_id
JOIN team AS t ON t.team_id = s.team_id
GROUP BY se.season_id, se.label, t.team_id, t.name
HAVING SUM(s.shots_on_target) >= 100
ORDER BY conversion_pct ASC
LIMIT 3;
