CREATE DATABASE IF NOT EXISTS football_lab
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE football_lab;

DROP TABLE IF EXISTS team_match_stats;
DROP TABLE IF EXISTS football_match;
DROP TABLE IF EXISTS team;
DROP TABLE IF EXISTS season;

CREATE TABLE season (
    season_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    label CHAR(5) NOT NULL,
    PRIMARY KEY (season_id),
    UNIQUE KEY uq_season_label (label)
) ENGINE = InnoDB;

CREATE TABLE team (
    team_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(60) NOT NULL,
    PRIMARY KEY (team_id),
    UNIQUE KEY uq_team_name (name)
) ENGINE = InnoDB;

CREATE TABLE football_match (
    match_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    season_id SMALLINT UNSIGNED NOT NULL,
    match_date DATE NOT NULL,
    PRIMARY KEY (match_id),
    KEY idx_match_season (season_id),
    CONSTRAINT fk_match_season FOREIGN KEY (season_id)
        REFERENCES season (season_id)
) ENGINE = InnoDB;

CREATE TABLE team_match_stats (
    match_id INT UNSIGNED NOT NULL,
    team_id SMALLINT UNSIGNED NOT NULL,
    venue ENUM('home', 'away') NOT NULL,
    goals TINYINT UNSIGNED NOT NULL,
    possession DECIMAL(4, 1) NOT NULL,
    shots_on_target TINYINT UNSIGNED NOT NULL,
    red_cards TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (match_id, team_id),
    UNIQUE KEY uq_match_venue (match_id, venue),
    KEY idx_stats_team (team_id),
    CONSTRAINT fk_stats_match FOREIGN KEY (match_id)
        REFERENCES football_match (match_id) ON DELETE CASCADE,
    CONSTRAINT fk_stats_team FOREIGN KEY (team_id)
        REFERENCES team (team_id),
    CONSTRAINT chk_possession_range CHECK (possession BETWEEN 0 AND 100)
) ENGINE = InnoDB;
