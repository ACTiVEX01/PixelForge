// api/proxy.js — Vercel Edge Function
// export config tells Vercel to use Edge runtime (not Node.js)
export const config = { runtime: 'edge' };

const BACKEND = 'https://blockmines.page.gd/api/index.php';

export default async function handler(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const { searchParams } = new URL(request.url);
  const upstream = `${BACKEND}?${searchParams.toString()}`;

  let raw;
  try {
    const res = await fetch(upstream, {
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer':         'https://blockmines.page.gd/',
        'Connection':      'keep-alive',
      },
    });
    raw = await res.text();
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Fetch failed: ' + err.message }),
      { status: 502, headers: corsHeaders() }
    );
  }

  // Strip any InfinityFree-injected HTML before the JSON
  const start = raw.indexOf('{');
  const end   = raw.lastIndexOf('}');
  if (start === -1 || end === -1) {
    return new Response(
      JSON.stringify({ error: 'Invalid response from backend', preview: raw.slice(0, 200) }),
      { status: 502, headers: corsHeaders() }
    );
  }

  return new Response(raw.slice(start, end + 1), {
    status: 200,
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
