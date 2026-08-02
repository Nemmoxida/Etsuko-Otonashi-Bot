# Commands list and usage

Use these slash commands to interact with the bot.

## Quick reference

- /ping - Quick connection test.
- [/add-circle](#add-circle) - Add a circle ID to the corresponding channel.
- [/fetch-club](#fetch-club) - Fetch club information and member progression.
- [/set-target](#set-target) - Track fan-progress targets for a specific account.
- [/check-target](#check-target) - Check the target previously set with /set-target.
- [/circle-search](#circle-search) - Search for circle information and find a circle ID.

---

## Command details

### /add-circle

Add a circle ID and its quota to the current channel.

Usage:

- /add-circle [circle-id] [quota]

Required values:

- circle-id: The circle identifier.
- quota: The quota value to assign.

Example:

- /add-circle 12345 1.000.000

### /fetch-club

Fetch club information and member progression.

Usage:

- /fetch-club

### /set-target

Set a target to track fan progress for a game account.

Usage:

- /set-target [game-id] [target] [deadline]

Required values:

- game-id: The account id.
- target: The target value to track.
- deadline: The date deadline.

Example:

- /set-target 987654 1.000.000 25

### /check-target

Check the target that was previously set with /set-target.

Usage:

- /check-target

Optional value:

- is-public: Show the result publicly(default is 0 which is private).

Example:

- /check-target
- /check-target 1

### /circle-search

Search for circle information, usually to find a circle ID.

Usage:

- /circle-search [circle-name] [leader-name] [is-public]

Required values:

- circle-name: The name of the circle to search for.

Optional values:

- leader-name: Filter results by the leader name.
- is-public: Show the result publicly(default is 0 which is private).

Example:

- /circle-search "Moonlight Studio"
- /circle-search "Moonlight Studio" "Aiko" 1
