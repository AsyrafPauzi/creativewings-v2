-- Seed default badges so the gamification system has something to award against.
insert into public.badges (slug, name, description, tier) values
  ('first-submission',  'First Submission',  'Submitted your very first entry on Creative Wings.', 'bronze'),
  ('three-submissions', 'Triple Threat',     'Submitted three entries across any campaign.',        'silver'),
  ('shortlisted',       'Shortlisted',       'Your entry was shortlisted by a campaign organiser.', 'gold'),
  ('campaign-winner',   'Campaign Winner',   'You won first place in a Creative Wings campaign.',   'gold'),
  ('community-builder', 'Community Builder', 'Listed organiser running a published campaign.',      'silver')
on conflict (slug) do nothing;
