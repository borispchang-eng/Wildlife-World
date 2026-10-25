# Wildlife World v41 – Planet Earth Quests

**Replaces the v37 Rescue Race server.** The two online rooms are Junior Quest (10 players) and Senior Quest (10 players). There are **no** free-explore, private-room, practice-world, Rescue Race or secret-egg rooms.

## Update the existing GitHub/Render server

Replace the files in your existing GitHub folder `Wildlife-World-Rescue-Race-Only-Live-Server-v37` with the contents of this folder. Keep the same directory name because Render already uses it as the Root Directory. Commit the new files. Render should auto-deploy, or use Manual Deploy > Deploy latest commit.

When Render shows Live, visit `https://wildlife-world.onrender.com/api/status`. It should show `mode: planet-earth-quests` and two rooms (junior, senior), each `max: 10`. If it still shows rescue-race-only, the server has NOT been updated.

### Local test
`node server.js`
Visit `http://localhost:3000/`. No third-party Node packages needed.

## Netlify

Upload the separate `Wildlife-World-Earth-Quests-iPad-Netlify-v41.zip` to your existing Netlify project. Players will see Junior Quest and Senior Quest only and the game uses `https://wildlife-world.onrender.com` automatically. Each player is greeted with an automatic costume shop after joining.

## Gameplay notes

Planet Earth is a contiguous game map with 10 biome regions; players see one another inside the same difficulty room. Separate Junior/Senior score tables are kept by the Node server. Local daily rewards, costume tokens, and accounts are browser-local, not cross-device authenticated. The sample server does not implement strong anti-cheat or private account authentication.

A free or low-cost Render instance may sleep when idle; it can take time to wake up. Render file storage may not persist `quest-rankings.json` across redeployments unless you arrange a persistent store.
