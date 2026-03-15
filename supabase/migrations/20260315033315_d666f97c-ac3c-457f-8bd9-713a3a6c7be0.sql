
-- Drop the existing check constraint and add one that allows Saturday (0-6)
ALTER TABLE module_slots DROP CONSTRAINT IF EXISTS module_slots_day_of_week_check;
ALTER TABLE module_slots ADD CONSTRAINT module_slots_day_of_week_check CHECK (day_of_week >= 0 AND day_of_week <= 6);

-- Add module_group and corequisites columns (may already exist from partial run)
ALTER TABLE modules ADD COLUMN IF NOT EXISTS module_group text NOT NULL DEFAULT 'Open Electives';
ALTER TABLE modules ADD COLUMN IF NOT EXISTS corequisites text[] NOT NULL DEFAULT '{}';

-- Clear all dependent data
DELETE FROM timetable_entries;
DELETE FROM reviews;
DELETE FROM user_progress;
DELETE FROM module_slots;
DELETE FROM modules;

-- Insert all modules
INSERT INTO modules (code, name, description, credit_units, school, prerequisites, corequisites, module_group) VALUES
('IS 602', 'Spreadsheet Modeling', 'Spreadsheet Modeling', 1, 'SIS', '{}', '{}', 'Programme Core'),
('IS 630', 'Statistical Thinking for Data Science', 'Statistical Thinking for Data Science', 1, 'SIS', '{}', '{}', 'Programme Core'),
('IS 628', 'Computational Thinking with Python', 'Computational Thinking with Python', 1, 'SIS', '{}', '{}', 'Programme Core'),
('WS 001', 'Workshops', 'Workshops module', 1, 'SIS', '{}', '{}', 'Workshops'),
('DTS 601', 'Digital Transformation Strategy (SMU-X)', 'Digital Transformation Strategy (SMU-X)', 1, 'SIS', '{}', '{}', 'Track Core'),
('DOC 601', 'Digital Organisation & Change Management', 'Digital Organisation & Change Management', 1, 'SIS', '{}', '{}', 'Track Core'),
('IS 621', 'Agile and DevSecOps', 'Agile and DevSecOps', 1, 'SIS', '{}', '{}', 'Track Core'),
('IS 622', '(digital) Product Management', '(digital) Product Management', 1, 'SIS', '{}', '{}', 'Track Core'),
('IS 603', 'IT Project and Vendor Management', 'IT Project and Vendor Management', 1, 'SIS', '{}', '{}', 'Track Electives'),
('IS 619', 'Business Applications of Digital Technology', 'Business Applications of Digital Technology', 1, 'SIS', '{}', '{}', 'Track Electives'),
('IS 623', 'Digital Governance and Risk Management', 'Digital Governance and Risk Management', 1, 'SIS', '{}', '{}', 'Track Electives'),
('CS 601', 'AI and Uncertainty Reasoning', 'AI and Uncertainty Reasoning', 1, 'SIS', '{}', '{}', 'Open Electives'),
('CS 605', 'NLP for Smart Assistants', 'NLP for Smart Assistants', 1, 'SIS', ARRAY['IS 628|IS 630'], '{}', 'Open Electives'),
('CS 608', 'Recommender Systems', 'Recommender Systems', 1, 'SIS', ARRAY['CS 602'], ARRAY['CS 610'], 'Open Electives'),
('CS 610', 'Applied Machine Learning', 'Applied Machine Learning', 1, 'SIS', ARRAY['IS 628|IS 630'], '{}', 'Open Electives'),
('CS 611', 'Machine Learning Engineering', 'Machine Learning Engineering', 1, 'SIS', '{}', ARRAY['CS 610'], 'Open Electives'),
('IS 635', 'Low Code Application Development', 'Low Code Application Development', 1, 'SIS', '{}', '{}', 'Open Electives'),
('ISFS 605', 'Financial Markets Technology', 'Financial Markets Technology', 1, 'SIS', '{}', '{}', 'Open Electives'),
('ISFS 610', 'Digital Payment and Innovation', 'Digital Payment and Innovation', 1, 'SIS', '{}', '{}', 'Open Electives'),
('ISFS 620', 'Data Science in Financial Services', 'Data Science in Financial Services', 1, 'SIS', ARRAY['IS 628|IS 630'], '{}', 'Open Electives'),
('ISFS 622', 'Quantum Computing in Financial Services', 'Quantum Computing in Financial Services', 1, 'SIS', '{}', '{}', 'Open Electives'),
('ISSS 602', 'Data Analytics Lab', 'Data Analytics Lab', 1, 'SIS', '{}', '{}', 'Open Electives'),
('ISSS 603', 'Applied Data Science for Customer Insights', 'Applied Data Science for Customer Insights', 1, 'SIS', '{}', '{}', 'Open Electives'),
('ISSS 604', 'Applied Data Science in Operations', 'Applied Data Science in Operations', 1, 'SIS', '{}', '{}', 'Open Electives'),
('ISSS 606', 'Applied Data Science in Social Networks', 'Applied Data Science in Social Networks', 1, 'SIS', '{}', '{}', 'Open Electives'),
('ISSS 608', 'Visual Analytics and Applications', 'Visual Analytics and Applications', 1, 'SIS', '{}', '{}', 'Open Electives'),
('ISSS 612', 'Big Data: Tools and Techniques', 'Big Data: Tools and Techniques', 1, 'SIS', '{}', '{}', 'Open Electives'),
('ISSS 625', 'Query Processing and Optimisation', 'Query Processing and Optimisation', 1, 'SIS', '{}', '{}', 'Open Electives');

-- Insert module slots
INSERT INTO module_slots (module_id, section, day_of_week, start_time, end_time, venue) VALUES
((SELECT id FROM modules WHERE code = 'CS 601'), 'G1', 5, '12:00', '15:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'CS 605'), 'G1', 0, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'CS 605'), 'G2', 1, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'CS 608'), 'G1', 2, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'CS 610'), 'G1', 2, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'CS 610'), 'G2', 0, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'CS 611'), 'G1', 3, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'IS 602'), 'G1', 2, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'IS 602'), 'G2', 1, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'IS 603'), 'G1', 3, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'IS 619'), 'G1', 0, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'IS 621'), 'G1', 1, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'IS 622'), 'G1', 4, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'IS 623'), 'G1', 2, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'IS 628'), 'G1', 4, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'IS 630'), 'G1', 3, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'IS 635'), 'G1', 0, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'ISFS 605'), 'G1', 1, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'ISFS 610'), 'G1', 4, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'ISFS 620'), 'G1', 2, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'ISFS 622'), 'G1', 5, '12:00', '15:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'ISSS 602'), 'G1', 5, '08:15', '11:30', 'TBA'),
((SELECT id FROM modules WHERE code = 'ISSS 603'), 'G1', 4, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'ISSS 604'), 'G1', 2, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'ISSS 606'), 'G1', 3, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'ISSS 608'), 'G1', 5, '12:00', '15:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'ISSS 612'), 'G1', 1, '19:00', '22:15', 'TBA'),
((SELECT id FROM modules WHERE code = 'ISSS 625'), 'G1', 0, '19:00', '22:15', 'TBA');
