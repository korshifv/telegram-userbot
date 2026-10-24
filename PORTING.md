# OpenClaw 2026.10.7 development port

This branch is an **unreleased, unverified** adaptation of [eldaruma/telegram-userbot](https://github.com/eldaruma/telegram-userbot) to OpenClaw **2026.10.7**. The plugin is intended for a dedicated Telegram user account (MTProto/GramJS), not the Telegram Bot API.

## Changes

- Replace removed `channel-runtime`, `channel-reply-pipeline`, and `config-runtime` imports with the new public SDK.
- Replace removed `direct-dm` facade with the public route/envelope/session/dispatch pipeline (matching the existing group reply flow).
- Make DMs opt-in through explicit `allowFrom` or `dmPolicy: "open"`. An unset allowlist denies messages by default.
- Avoid printing the Telegram MTProto session string or chat text in CLI / Gateway logs.
- Force restrictive permissions (0600) on files written with session credentials.

## Development checks

```bash
npm install --ignore-scripts --no-audit --no-fund
node --test tests/compat.test.mjs
npm run build
```

## Deployment (only after review and build success)

Run as the account that owns your OpenClaw installation, **not root**:

```bash
git clone -b openclaw-2026.10 https://github.com/korshifv/telegram-userbot.git ~/src/telegram-userbot
cd ~/src/telegram-userbot
npm install --ignore-scripts --no-audit --no-fund
npm run build
openclaw plugins disable telegram-userbot
openclaw plugins install --link ~/src/telegram-userbot --force
openclaw plugins inspect telegram-userbot --runtime
openclaw plugins doctor
```

Keep the real Telegram `apiHash`, `sessionString` and OpenClaw auth files **out of Git**. Use a dedicated Telegram account; the Telegram session has account-level powers.

Example account configuration (placeholder values, **never commit real credentials**):

```json
{
  "channels": {
    "telegram-userbot": {
      "accounts": {
        "default": {
          "apiId": 123456,
          "apiHash": "<LOCAL_SECRET>",
          "sessionString": "<LOCAL_SECRET>",
          "dmPolicy": "allowlist",
          "allowFrom": ["123456789"],
          "groups": {}
        }
      }
    }
  }
}
```

For a public-facing dedicated account, `dmPolicy: "open"` must be set **explicitly**. Open access means anyone can send untrusted prompts to the agent; restrict its tools and command-owner separately. Inbound chat text is not marked as an authorized management command in this port.

## Known gaps

- Initial compatibility code has not been tested end to end with a Telegram account. Build and Gateway plugin load come first.
- Pairing is available through the public `channel-inbound` helpers when `dmPolicy: "pairing"` is configured.
- Media/reaction support and proactive message sending require live integration tests.
- ClawHub package `1.0.2` is **not** this fork; install locally from this branch.
