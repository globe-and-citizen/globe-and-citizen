# Polymarket Tracker Removal

## Summary

The Polymarket Trackers profile feature was removed from the application. Users can no longer open or navigate to the tracker management page.

## Changes

- Removed the Polymarket Trackers profile view and its tracker table, create, edit, preview, refresh, and delete controls.
- Removed tracker links from the profile tools and services menus.
- Removed the dedicated tracker icon and tracker-only fetch and delete API helpers.
- Changed the retired `/profile/polymarket-price-tracker` URL to redirect to the profile landing page.
- Preserved the separate Polymarket analytics, correlation, and admin-news functionality.
- No database or schema changes were made in this frontend repository.

## Design Decisions

The retired URL redirects to `/profile` so saved links do not fall through to the dynamic public-profile route. Other Polymarket tools remain available because they are independent of the tracker management page.

## Usage

No configuration is required. The tracker entry is no longer displayed, and visits to the former profile URL return users to their profile landing page.

## Limitations

This change removes the tracker from the frontend application only. It does not modify services or stored alert data outside this repository.

## Future Improvements

Backend alert endpoints and persisted tracker records can be retired separately if they are no longer used by any other client.
