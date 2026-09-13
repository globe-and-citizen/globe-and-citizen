# News Processing Workflow

## Summary

The article workflow now uses one canonical Polymarket prediction instead of separate Prediction and Hedge selections. The form and market picker also use tighter, responsive spacing and consistent shared control states.

The selected prediction is persisted with the article and is read-only after publication.

## Changes

- Removed Hedge fields, validation, selection state, modal handling, review output, generated content, and reset behavior.
- Kept Prediction as the required market selection and article source.
- Retained the title, slug, TLGP, rules analysis, full analysis, and cover image requirements.
- Added explicit field labels and normalized responsive input, button, counter, error, focus, and disabled states.
- Made the market picker header, results, footer, and cover image controls wrap without horizontal overflow.
- Count rich-text limits from visible text instead of generated HTML markup.
- Kept uploaded and Polymarket image choices available so switching images does not discard an upload.
- Sends the selected market URL, identifiers, question, outcome, token, image, and unique Polymarket tag labels in the post `prediction` field.
- Shows persisted predictions as locked information in the edit dialog and omits prediction source fields from edit payloads.
- Renders one shared read-only prediction section in article editing, admin preview, and the published post view.
- Aligns Edit Post with the creation workflow: Title & Slug, locked Prediction, TLGP, Rules Analysis, Full Analysis, and the same Polymarket/uploaded cover-image choices.
- Parses persisted workflow HTML into its individual edit sections and recomposes the same canonical HTML structure on save.
- Keeps prediction data outside editable article HTML; older generated prediction blocks are removed from display and edit content when structured prediction data exists.
- Surfaces backend update errors instead of treating non-success responses as successful edits.

## Design Decisions

Prediction is canonical because the published article source, generated article section, cover image context, and analysis copy already use prediction semantics. Shared form, dialog, input, textarea, button, and editor styles are reused rather than introducing workflow-specific controls.

Prediction immutability is enforced in both layers: the edit UI has no prediction controls, and the backend rejects attempted prediction or prediction URL changes.

Only the Polymarket tag `label` values are retained. Labels are collected from event and market responses, trimmed, and deduplicated case-insensitively so the persisted data is suitable for later filtering without coupling posts to the rest of Polymarket's tag metadata.

## Usage

Open the news creation page, enter the article fields, and select one Polymarket market and Yes/No position in the Prediction section. Choose the market thumbnail or an uploaded cover image, then publish the article.

When editing a published article, use the same TLGP, Rules Analysis, Full Analysis, and cover-image sections used during creation. The persisted prediction is displayed for reference and cannot be changed. Changing the title regenerates the read-only slug.

## Limitations

- The workflow supports one selected Polymarket market per article.
- Cover image uploads are limited to 2 MB.
- Publishing still uses the existing news article API and its current author/source defaults.
- Existing articles created before the prediction migration can still edit their legacy source fields because they do not have structured prediction data.
- Tag labels are captured when a prediction is selected; existing posts are not backfilled with Polymarket tags.
- Legacy articles without workflow headings open their existing content in Full Analysis and may require the missing workflow sections before saving.

## Future Improvements

- Add focused component tests for market selection and publish payload generation.
- Persist drafts so partially completed articles can be resumed.
