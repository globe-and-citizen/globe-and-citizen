# News Processing Workflow

## Summary

The article workflow persists paired Polymarket Prediction and Hedge selections alongside the written analysis. Creation, editing, preview, and published-article views share the same structured market data and responsive presentation.

## Changes

- Requires Prediction and Hedge market selections for structured prediction articles.
- Uses the shared market picker for event search, URL loading, market selection, and Yes/No outcomes.
- Persists market URLs, identifiers, questions, outcomes, token IDs, images, and normalized tag labels.
- Allows either Prediction or Hedge to be replaced from Edit Post.
- Shows responsive light-theme price-history charts automatically during creation and beside published Prediction and Hedge details.
- Routes chart data through the G&C backend and Layer8-aware fetch path; the SPA never calls Polymarket directly.
- Keeps title, slug, TLGP, Rules Analysis, Full Analysis, and cover-image behavior aligned between creation and editing.
- Enforces Rules Analysis limits of 650 words and 3000 characters.
- Keeps uploaded and Polymarket image choices available when selections change.
- Parses persisted workflow HTML into editable sections and recomposes the canonical structure on save.
- No database or schema changes were required for price charts.

## Design Decisions

Prediction and Hedge use the same structured market shape but remain separate domain fields. Stored CLOB token IDs are sufficient to generate charts automatically, so iframe markup and embed configuration are not persisted. The shared backend price-history proxy remains the only Polymarket data boundary for the SPA.

Charts use a white background, visible border, percentage y-axis, date x-axis, horizontal grid rows, and tooltips. Trading controls, live activity, and dark mode are intentionally excluded. Market details and charts sit side by side on tablet and desktop widths and stack on mobile.

## Usage

Create or edit an article and select Prediction and Hedge markets. Their price-history charts load automatically as soon as token IDs are available and appear with the published article. Choose the Prediction thumbnail or an uploaded image, complete the analysis sections, and save or publish normally.

## Limitations

- Legacy articles without structured market token IDs cannot show automatic charts.
- Price-history availability depends on the backend proxy and upstream Polymarket service.
- The workflow supports one Prediction market and one Hedge market per article.
- Cover image uploads are limited to 2 MB.
- Legacy articles without workflow headings may require missing analysis sections before saving.

## Future Improvements

- Add authenticated browser coverage for market replacement and responsive chart layouts.
- Add configurable chart ranges if article readers need shorter time windows.
