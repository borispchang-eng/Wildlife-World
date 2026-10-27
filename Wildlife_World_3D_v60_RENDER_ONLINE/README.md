# Wildlife World 3D v60 — Five Ways to Play

This edition restores all five choices to the redesigned cinematic welcome screen:
- Visitor — starts a guest session instantly.
- Create Account — create an explorer account **stored in this browser on this website**.
- Log In — sign in to a saved explorer account on that browser/site.
- Admin — opens the existing locally gated game-admin interface (not secure server authentication).
- In-Class Game — guest classroom mode; resets the game after each round.

The welcome choices, form labels and descriptions switch between English and Traditional Chinese using the upper-right language button. The existing 3D renderer, multiplayer, horses, wildlife, rescue missions and Adventure Menu were left intact. A 'Switch player' button is available on the adventure selection screen.

## NETLIFY ZIP (website only)
Upload the ZIP directly through Netlify's Deploys page. Multiplayer will NOT work from Netlify alone: set `window.WILDLIFE_SERVER_URL` in `server-config.js` to your deployed Render service's HTTPS URL and redeploy. Both sites must run compatible server versions.

## RENDER ONLINE ZIP (website + multiplayer)
Extract ZIP into a GitHub repository and create a Render Web Service using `npm install` and `npm start`. The service will host the website, room-code connections and the game together under a single URL. The `/api/status` route confirms server status.

## Accounts and safety
The original game supports local-browser accounts, not cloud accounts; they do not automatically synchronize between visitors, devices or Netlify domains. The Admin option is only a client-side game panel and should not be relied on for authentication or security. Avoid reusing sensitive passwords. Multiplayer requires a functioning server.
