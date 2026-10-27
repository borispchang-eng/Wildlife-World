// Wildlife World v63: one-server Render build or Netlify linked to its Render backend.
window.WILDLIFE_SERVER_URL=location.hostname.endsWith('.netlify.app')?'https://wildlife-world.onrender.com':(location.protocol==='http:'||location.protocol==='https:'?location.origin:'');
