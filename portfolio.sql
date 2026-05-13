-- Portfolio Database
-- Import this file via phpMyAdmin on InfinityFree

-- ─────────────────────────────────────────
-- Table: contacts
-- Stores messages sent through the contact form
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
    id       INT          NOT NULL AUTO_INCREMENT,
    name     VARCHAR(100) NOT NULL,
    email    VARCHAR(150) NOT NULL,
    message  TEXT         NOT NULL,
    sent_at  DATETIME     NOT NULL,
    PRIMARY KEY (id)
);

-- ─────────────────────────────────────────
-- Table: projects
-- Stores portfolio projects shown on the site
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
    id          INT          NOT NULL AUTO_INCREMENT,
    title       VARCHAR(150) NOT NULL,
    description TEXT         NOT NULL,
    tags        VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

-- ─────────────────────────────────────────
-- Seed data: your existing projects
-- ─────────────────────────────────────────
INSERT INTO projects (title, description, tags) VALUES
('Brain Tumor Detector AI',  'Developed a deep learning model for the automated detection and classification of brain tumors from MRI scans using Convolutional Neural Networks (CNN) with a focus on medical imaging accuracy.', 'Python,AI,NLP'),
('AI Bank Assistant',        'Intelligent banking chatbot with natural language understanding and account query capabilities.', 'Python,AI,NLP'),
('VoiceAssistant',           'Voice assistant powered by Gemma LLM with Whisper speech-to-text transcription pipeline.', 'Python,Gemma,Whisper,TTS'),
('ASL Language App',         'American Sign Language recognition application using computer vision and machine learning.', 'Python,CV,ML'),
('socks_game',               'A browser-based game built with custom physics & pixel art.', 'JavaScript,Canvas'),
('Fall_lootgamejam',         'Game jam entry — loot-driven fall season themed platformer.', 'Unity,C#,Game Jam'),
('portfolio',                'This portfolio — Windows 95 OS aesthetic with GSAP animations.', 'HTML,GSAP,CSS');
