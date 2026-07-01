-- Seed default badges so the gamification system has something to award against.
insert into public.badges (slug, name, description, tier) values
  ('first-submission',  'First Submission',  'Submitted your very first entry on Creative Wings.', 'bronze'),
  ('three-submissions', 'Triple Threat',     'Submitted three entries across any campaign.',        'silver'),
  ('shortlisted',       'Shortlisted',       'Your entry was shortlisted by a campaign organiser.', 'gold'),
  ('campaign-winner',   'Campaign Winner',   'You won first place in a Creative Wings campaign.',   'gold'),
  ('community-builder', 'Community Builder', 'Listed organiser running a published campaign.',      'silver')
on conflict (slug) do nothing;

insert into public.badge_rules (badge_id, rule_type, threshold)
select id, 'submission_count'::cw_badge_rule_type, 1 from public.badges where slug = 'first-submission'
on conflict (badge_id, rule_type) do nothing;

insert into public.badge_rules (badge_id, rule_type, threshold)
select id, 'submission_count'::cw_badge_rule_type, 3 from public.badges where slug = 'three-submissions'
on conflict (badge_id, rule_type) do nothing;

insert into public.badge_rules (badge_id, rule_type, threshold)
select id, 'shortlisted'::cw_badge_rule_type, 1 from public.badges where slug = 'shortlisted'
on conflict (badge_id, rule_type) do nothing;

insert into public.badge_rules (badge_id, rule_type, threshold)
select id, 'campaign_winner'::cw_badge_rule_type, 1 from public.badges where slug = 'campaign-winner'
on conflict (badge_id, rule_type) do nothing;

insert into public.badge_rules (badge_id, rule_type, threshold)
select id, 'organizer_published'::cw_badge_rule_type, 1 from public.badges where slug = 'community-builder'
on conflict (badge_id, rule_type) do nothing;
