# Wildlife World 3D v63 — Admin Menu + Online Diagnostics

## Changes
- Admin is now inside the in-game Menu. It appears only for an account signed in as Administrator. The old floating Admin button is hidden; all existing Admin controls remain.
- Junior and Senior multiplayer join panel includes **Test Online Connection**. It tests both `/api/status` and an actual WebSocket handshake. A **Server Status** link shows the current server response.
- The server identifies itself as **version 63** at `/api/status`. The v61 quest page, language switch, horse riding, rescuable animals, 10 biomes, and room codes are preserved.

## Host the ONLINE game: Render (recommended)
1. Extract `Wildlife_World_3D_v63_RENDER_ONLINE.zip` to a temporary folder.
2. Upload the **contents** of that folder directly to the root of your GitHub repository, so `index.html`, `server.js`, `package.json`, `ui-v57.js` and the CSS files are in the same directory. Do **not** nest them in a `Wildlife_World_3D_v63...` folder.
3. In Render → Wildlife-World → Settings → Build: **Root Directory** must be **empty**. Set Build Command `npm install`, Start Command `npm start`.
4. Deploy the latest commit. Check `https://wildlife-world.onrender.com/api/status` until it reports `"online":true` and `"version":63`.
5. Open the Render **website** (not the Netlify site) and choose Visitor → Junior Quest → room 10001. Ask a friend to use the same URL and code. Use **Test Online Connection** on the room page to diagnose problems.

## If keeping a Netlify website
First deploy the full v63 Render server as above, then upload `Wildlife_World_3D_v63_NETLIFY.zip` to Netlify. That frontend points to `https://wildlife-world.onrender.com` automatically. Netlify alone does not provide the WebSocket server.

## Common errors
- **Version less than 63 or `/api/status` returns 404:** Render is running an old directory/commit. Verify Root Directory, repository, branch, and deployment logs.
- **Failed to fetch:** The Render service is asleep, unavailable, or blocked by a connection issue; open the Server Status link and check Render logs.
- **WebSocket failed:** Make sure you deployed as a Render **Web Service**, not a static site. Check for blocked connections on the browser/network.
- **Room full:** Each room supports up to 10 players. Try another five-digit code.
- **The first visit is slow:** A free Render server may take time to wake from inactivity.

These tests verify local code and connections, not the state of your remote Render account. Admin account security is still browser-local and should not be treated as secure server authentication. Room rankings are in memory and reset on server restart.
