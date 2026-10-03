# Prediction and Viewpoint Filter Sidebar

## Summary
The Markets / Predictions and Viewpoints pages share a collapsible left filter sidebar for filtering by calendar month, custom date range, and author. Applied filters are stored in each page URL so a filtered review can be bookmarked or shared.

## Changes
- Added a shared `ContentFiltersSidebar` component to Markets / Predictions and Viewpoints.
- Moved the existing period and author controls into a left filter rail with independently collapsible Period and Author sections.
- Added a searchable author selector populated from users who have published the corresponding content type.
- Added a shared, borderless `Filter` / `Hide filter` button above and right-aligned with the result list, including an active-filter count.
- Made the sidebar collapsed by default and reduced the page gutters so the result grid has more usable width.
- Added smooth width, spacing, opacity, and slide transitions when the sidebar expands or collapses.
- Increased the collapsed result grid to four columns on wide screens so cards remain compact instead of spreading across oversized columns.
- Added Apply and Clear actions, date-range validation, loading, empty, and error states.
- Extended the posts API client with `month`, `from`, `to`, and `author_id` query parameters.
- Reset pagination when filters change and preserve filters while moving between pages.

## Design Decisions
- Filtering is performed by the API rather than against the current browser page, which keeps result counts and pagination accurate.
- The filter rail uses a lightweight, unboxed layout inspired by product-catalog sidebars so results remain the visual focus, while its borderless toggle stays above the list in both states.
- One shared sidebar component keeps the two pages visually and behaviorally consistent.
- Draft filter changes are applied together with an explicit Apply action, avoiding a request for every control change.
- Filter state uses URL query parameters (`month`, `from`, `to`, `author`) to make reviews reproducible and shareable.
- Month and custom range are mutually exclusive period modes; the author filter can be combined with either.

## Usage
Open Markets / Predictions or Viewpoints and select Filter at the upper right of the list to reveal the sidebar. Choose Month or Date range, optionally search for and select an author, then select Apply filters. Select Hide filter to collapse the sidebar again. Clear all removes every applied filter. On smaller screens, the sidebar collapses after filters are applied. Existing filtered URLs restore the selected criteria automatically.

## Limitations
- Date filtering uses the prediction post's creation timestamp.
- Each author selector includes users who have published at least one item of that page's content type.
- The API currently interprets calendar boundaries in UTC.
- Whether the filter rail is open or collapsed is local UI state and is not stored in the URL.

## Future Improvements
- Add preset periods such as current month, previous month, and quarter.
- Add CSV export for filtered council reviews.
