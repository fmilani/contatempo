-- Labels are now typed into the description, saved as `#<label:id>` where they sit in the text.
-- An entry's labels are still kept in time_entry_labels, for filtering and totals; the app keeps
-- the two in step on every save.
--
-- Entries labelled before this have no labels in their text, so each gets its labels appended,
-- in name order, so none disappear from view. The schema doesn't change.

update public.time_entries as entry
set description = btrim(
  entry.description || ' ' || (
    select string_agg('#<label:' || label.id || '>', ' ' order by lower(label.name))
    from public.time_entry_labels as link
    join public.labels as label on label.id = link.label_id
    where link.entry_id = entry.id
  )
)
where exists (select 1 from public.time_entry_labels as link where link.entry_id = entry.id)
  and entry.description not like '%#<label:%';
