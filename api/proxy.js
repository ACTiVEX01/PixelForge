// api/proxy.js
// Vercel Edge Function — runs on Vercel's edge network, not Node.js
// This bypasses InfinityFree's bot-detection by sending real browser headers

export const config = {
  runtime: 'edge',
};

const BACKEND = 'https://blockmines.page.gd/api/index.php';

export default async function handler(request) {
  const url    = new URL(request.url);
  const params = url.searchParams.toString();
  const upstream = `${BACKEND}?${params}`;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  let response;
  try {
    response = await fetch(upstream, {
      method: 'GET',
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control':   'no-cache',
        'Referer':         'https://blockmines.page.gd/',
        'Connection':      'keep-alive',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Upstream fetch failed: ' + err.message }),
      { status: 502, headers: corsHeaders() }
    );
  }

  const raw = await response.text();

  // Strip any HTML InfinityFree injects before the JSON
  const start = raw.indexOf('{');
  const end   = raw.lastIndexOf('}');

  if (start === -1 || end === -1) {
    return new Response(
      JSON.stringify({ error: 'No JSON in response', preview: raw.slice(0, 300) }),
      { status: 502, headers: corsHeaders() }
    );
  }

  return new Response(raw.slice(start, end + 1), {
    status:  200,
    headers: corsHeaders(),
  });
}

function corsHeaders() {
  return {
    'Content-Type':                'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control':               'no-store',
  };
}
