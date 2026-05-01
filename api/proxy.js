// api/proxy.js  — Vercel Serverless Function
// Place this file at the ROOT of your Vercel repo as:  api/proxy.js
//
// How it works:
//   Browser  →  GET /api/proxy?action=get_posts  →  Vercel Function
//   Vercel   →  GET https://blockmines.page.gd/api/index.php?action=get_posts  (server-side, no CORS)
//   Vercel   →  returns JSON to browser  (same origin — no CORS error)

const BACKEND = 'https://blockmines.page.gd/api/index.php';

export default async function handler(req, res) {
  // Build the upstream URL — forward ALL query params
  const params = new URLSearchParams(req.query);
  const upstreamUrl = `${BACKEND}?${params.toString()}`;

  try {
    // Fetch from InfinityFree with full browser-like headers
    // This bypasses InfinityFree's bot/referrer detection
    const backendRes = await fetch(upstreamUrl, {
      method: req.method === 'POST' ? 'POST' : 'GET',
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':          'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer':         'https://blockmines.page.gd/',
        'Origin':          'https://blockmines.page.gd',
        'Connection':      'keep-alive',
        ...(req.method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      },
      // Forward POST body if present
      ...(req.method === 'POST' && req.body
        ? { body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body) }
        : {}),
    });

    const raw = await backendRes.text();

    // Strip any InfinityFree-injected HTML before the JSON
    const jsonStart = raw.indexOf('{');
    const jsonEnd   = raw.lastIndexOf('}');
    const clean     = jsonStart >= 0 && jsonEnd >= 0
      ? raw.slice(jsonStart, jsonEnd + 1)
      : raw;

    // Try to parse and re-serialize clean JSON
    let data;
    try {
      data = JSON.parse(clean);
    } catch {
      // If still not valid JSON return the raw text for debugging
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(502).send('Backend returned non-JSON:\n' + raw.slice(0, 500));
    }

    // Respond to the browser
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*'); // safe — proxy adds its own CORS
    return res.status(200).json(data);

  } catch (err) {
    return res.status(502).json({ error: 'Proxy error: ' + err.message });
  }
}
