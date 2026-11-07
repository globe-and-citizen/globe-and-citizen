# Polymarket Telegram Price Alerts

## Summary

The Polymarket price tracker is available again. Authenticated users securely connect a Telegram conversation, then create single-market or multi-market price alerts and receive messages when their configured condition is reached.

## Changes

- Restored the profile tracker screen, navigation entry, alert wizard, list, preview, edit, refresh, and delete actions.
- Reconnected the frontend to the existing authenticated alert API.
- Replaced per-alert Discord webhooks with a server-managed Telegram bot and an account-linking flow that obtains the destination directly from Telegram.
- Added `notify_telegram` and `telegram_chat_id` alert fields through database migration `000041`.
- Added durable Telegram account connections through database migration `000042`.
- Added short-lived, one-use deep links backed by Redis and a Telegram webhook protected by `TELEGRAM_WEBHOOK_SECRET`.
- Updated the alert worker to format Telegram messages for single and sum alerts and to retain an active alert when delivery fails.
- Added a bounded Telegram transport retry, an isolated HTTP/1.1 client for reliable Bot API delivery, and redacted transport errors so bot tokens cannot appear in worker logs.
- Removed the unsupported equality operator from the restored alert form.
- Reloaded saved Polymarket metadata automatically when an editor enters the market-selection step and made the selected-market label react directly to the refreshed options, so the dropdown shows the market name immediately instead of retaining a numeric market ID until it is clicked.

## Design Decisions

The Telegram bot token is stored only in the backend environment as `TELEGRAM_BOT_TOKEN`; it is never submitted by or returned to users. A signed-in user requests a ten-minute, one-use bot link. When the user presses Start, Telegram supplies the authoritative chat ID to the protected webhook and the backend links it to that Globe & Citizen account. Alerts resolve the current account connection at delivery time, so reconnecting changes the destination without editing every alert. Existing Discord columns remain in place for database compatibility, but the worker no longer delivers Discord notifications.

## Usage

1. Create a Telegram bot with BotFather. Configure its username as `TELEGRAM_BOT_USERNAME` and a strong random `TELEGRAM_WEBHOOK_SECRET` on the API. Configure the bot webhook to point to `/v1/telegram/webhook` using the same secret token.
2. Configure `TELEGRAM_BOT_TOKEN` on the price-alert worker.
3. Deploy migrations `000041` and `000042`.
4. Open **Profile → Polymarket price alerts**, enable Telegram, click **Connect Telegram**, and press Start in the bot conversation.
5. Return to the alert form after it displays **Telegram connected**, then save the alert. The worker evaluates active alerts every 30 seconds.
6. When editing an existing alert, continue to the second step. The wizard automatically reloads each saved Polymarket URL, refreshes the dropdown options, and preserves the selected market and outcome.

For local Telegram API testing, `TELEGRAM_API_URL` can override the default `https://api.telegram.org` endpoint.

`TELEGRAM_BOT_USERNAME` must be the exact BotFather username only, such as `GlobeCitizenBot`. Do not include `@`, `https://t.me/`, a trailing colon, or spaces.

## Limitations

- The bot must already have access to the destination chat.
- The current connection button links a private bot conversation; guided group/channel linking is not yet exposed in the UI.
- Existing Discord-only alerts are preserved but will not send until the user connects Telegram and edits the alert to enable Telegram delivery.
- The worker still depends on PostgreSQL, Redis, and current Polymarket price data.
- If Polymarket metadata cannot be fetched while opening an alert for editing, the saved identifiers remain selected but the form may temporarily show the numeric market fallback.

## Future Improvements

- Show delivery health and the most recent delivery error in the tracker UI.
- Remove legacy Discord columns after existing deployments have migrated.
