# Wildlife World v37 — Two-Player Rescue Race Only

This release removes World Servers 1–4 and private internet rooms.
The only multiplayer game is **2-Player Rescue Race**, room code **12345**.

## Launch the live server

Requires Node.js 18 or later. Run `npm start` (or `node server.js`).
Set the `PORT` environment variable if your hosting provider needs one.
Open the game on the **same server's URL**: players only type room code `12345`.
If hosting the game separately on Netlify, the site owner must set `WILDLIFE_SERVER_URL`
inside the provided `server-config.js` file to the backend's hosted URL **once**.
Players never need to enter an internet URL. There is no online service until the backend is deployed.

## Rules

- Exactly two players may join room 12345.
- Three-second countdown, followed by 90 seconds.
- Each player may attempt up to twelve animal rescue questions.
- Only **correct** answers earn points. The server maintains the live total.
- Most correct rescues wins. Equal scores end in a tie.
- The Rescue Race winner leaderboard is saved on the server to rescue-race-rankings.json.
- Junior, Senior, Free Explore, costumes, levels, missions and daily rewards remain playable offline.

## Notes

The browser account system is local to each device, and this school-demo multiplayer server
is not a cheat-resistant or identity-verified production system.
