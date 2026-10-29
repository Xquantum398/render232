const express = require("express");
const { HttpsProxyAgent } = require("https-proxy-agent");
const app = express();

app.disable("x-powered-by");
app.disable("etag");

const PORT = process.env.PORT || 10000;

// --- Güncel Veriler ---
const STATIC_LOGO = "https://i.hizliresim.com/8xzjgqv.jpg";
const BASE_URL = "https://f2q.zirvedesin247.cfd/";
const ORIGIN = "https://101baywintv.live";
const REFERRER = "https://101baywintv.live/";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36";

const CHANNELS = [
  ["b1", "ts 1 HD"],
  ["b2", "5s 2 HD"],
  ["b3", "4s 3 HD"],
];

const STREAMS = {
  "b1": `${BASE_URL}b1/index.txt`,
  "b2": `${BASE_URL}b2/mono.m3u8`,
  "b3": `${BASE_URL}b3/mono.m3u8`,
};

// Proxy (varsa buraya yaz veya environment variable olarak PROXY kullan)
const PROXY = process.env.PROXY || null; // örnek: "http://user:pass@ip:port"

// --- Middleware ---
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Range",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (!["GET", "HEAD"].includes(req.method)) {
    return res.status(405).send("Method Not Allowed");
  }
  next();
});

function absoluteUrl(req, path) {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}${path}`;
}

function proxyUrl(req, target) {
  return absoluteUrl(req, "/proxy") + "?url=" + encodeURIComponent(target);
}

async function fetchUpstream(url, method = "GET") {
  const options = {
    method,
    headers: {
      "User-Agent": USER_AGENT,
      "Accept": "*/*",
      "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Origin": ORIGIN,
      "Referer": REFERRER,
      "Sec-Ch-Ua": '"Not:A-Brand";v="8", "Chromium";v="156", "Google Chrome";v="156"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site",
      "Priority": "u=1, i",
    },
  };

  if (PROXY) {
    options.agent = new HttpsProxyAgent(PROXY);
  }

  return fetch(url, options);
}

// Proxy endpoint
app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) {
    return res.status(400).json({ error: "URL gerekli" });
  }

  try {
    const upstream = await fetchUpstream(target);
    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: "UPSTREAM_ERROR",
        status: upstream.status,
        source: target,
      });
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    res.set("Content-Type", contentType);
    res.set("Cache-Control", "no-store");

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(502).json({
      error: "PROXY_FAILED",
      message: err.message,
    });
  }
});

// mono.m3u8 → playlist çek + tüm linkleri proxy’le
app.get("/:id/mono.m3u8", async (req, res) => {
  const id = req.params.id;
  const stream = STREAMS[id];
  if (!stream) {
    return res.status(404).send("Kanal bulunamadı.");
  }

  try {
    const upstream = await fetchUpstream(stream);
    if (!upstream.ok) {
      return res.status(502).json({
        error: "UPSTREAM_ERROR",
        status: upstream.status,
        channel: id,
        source: stream,
      });
    }

    let text = await upstream.text();

    // Tüm http/https linklerini proxy’ye çevir
    text = text.replace(/(https?:\/\/[^\s"']+)/g, (full) => {
      if (full.includes(req.get("host"))) return full;
      return proxyUrl(req, full);
    });

    res
      .type("application/vnd.apple.mpegurl")
      .set("Cache-Control", "no-store")
      .send(text);
  } catch (err) {
    console.error("Playlist error:", err.message);
    res.status(502).json({
      error: "STREAM_FETCH_FAILED",
      channel: id,
      source: stream,
      message: err.message,
    });
  }
});

// Ana sayfa
app.get("/", (req, res) => {
  const list = CHANNELS.map(([id, name]) => {
    return `<li><a href="/${id}/mono.m3u8" target="_blank">${name}</a></li>`;
  }).join("");

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Live Player</title>
      <style>
        body { font-family: Arial, sans-serif; background: #111; color: #eee; padding: 30px; }
        a { color: #4af; text-decoration: none; font-size: 18px; }
        a:hover { text-decoration: underline; }
        li { margin: 10px 0; }
      </style>
    </head>
    <body>
      <h2>Canlı Kanallar</h2>
      <ul>${list}</ul>
    </body>
    </html>
  `);
});

// 404
app.use((req, res) => {
  res.status(404).send("Not Found");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
