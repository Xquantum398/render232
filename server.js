const express = require("express");
const { HttpsProxyAgent } = require("https-proxy-agent");

const app = express();
app.disable("x-powered-by");
app.disable("etag");

const PORT = process.env.PORT || 10000;
const STATIC_LOGO = "https://i.hizliresim.com/8xzjgqv.jpg";
const BASE_URL = "https://f2q.zirvedesin247.cfd/";
const REFERRER = "https://101baywintv.live/";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

// --- Proxy ---
const PROXY = {
  host: "45.38.107.97",
  port: 6014,
  username: "kcsoxakz",
  password: "ik06zijcghnb",
};

const proxyUrl = `http://${PROXY.username}:${PROXY.password}@${PROXY.host}:${PROXY.port}`;
const proxyAgent = new HttpsProxyAgent(proxyUrl);

// --- Kanallar ---
const CHANNELS = [
  ["patron", "ts 1 HD"],
  ["b2", "5s 2 HD"],
  ["b3", "4s 3 HD"],
];

const STREAMS = {
  "patron": `${BASE_URL}patron/mono.m3u8`,
  "b2": `${BASE_URL}b2/mono.m3u8`,
  "b3": `${BASE_URL}b3/mono.m3u8`,
};

// --- Middleware ---
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Range",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (req.method === "OPTIONS") return res.status(204).end();
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

function makeProxyUrl(req, target) {
  return absoluteUrl(req, "/proxy") + "?url=" + encodeURIComponent(target);
}

// Upstream istekleri proxy üzerinden
async function fetchUpstream(url, method = "GET") {
  return fetch(url, {
    method,
    redirect: "follow",
    agent: proxyAgent,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      "Accept": "*/*",
      "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
      "Accept-Encoding": "gzip, deflate, br",
      "Referer": "https://f2q.zirvedesin247.cfd/",
      "Origin": "https://101baywintv.live/",
      "Connection": "keep-alive",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Ch-Ua": '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
    },
  });
}

// --- Player HTML ---
function playerHTML(req) {
  const channels = CHANNELS.map(([id, name]) => ({
    id,
    name,
    url: absoluteUrl(req, `/${id}/mono.m3u8`),
  }));

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Canlı Yayın Player</title>
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js"></script>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0f0f0f;color:#fff;font-family:system-ui,-apple-system,sans-serif;min-height:100vh}
  header{background:#1a1a1a;padding:14px 20px;border-bottom:1px solid #333;display:flex;align-items:center;gap:12px}
  header img{width:32px;height:32px;object-fit:cover;border-radius:6px}
  header h1{font-size:18px;font-weight:600}
  .container{max-width:1100px;margin:0 auto;padding:20px;display:flex;flex-direction:column;gap:20px}
  .player-box{background:#000;aspect-ratio:16/9;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.5)}
  video{width:100%;height:100%;display:block;background:#000}
  .channels{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
  .channel-btn{background:#1e1e1e;border:1px solid #333;border-radius:10px;padding:13px 14px;color:#fff;font-size:14px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:all .15s}
  .channel-btn:hover{background:#2a2a2a;border-color:#555}
  .channel-btn.active{background:#1a73e8;border-color:#1a73e8}
  .channel-btn img{width:26px;height:26px;object-fit:cover;border-radius:4px}
  .status{font-size:13px;color:#aaa;margin-top:10px}
  .error{color:#ff6b6b}
</style>
</head>
<body>
<header>
  <img src="${STATIC_LOGO}" alt="Logo">
  <h1>Canlı Yayın Player</h1>
</header>
<main class="container">
  <div class="player-box">
    <video id="video" controls playsinline></video>
  </div>
  <section>
    <div class="channels" id="channels"></div>
    <div id="status" class="status">Kanal seçin...</div>
  </section>
</main>
<script>
const channels = ${JSON.stringify(channels)};
const video = document.getElementById("video");
const list = document.getElementById("channels");
const statusEl = document.getElementById("status");
let hls = null;
channels.forEach(ch => {
  const btn = document.createElement("button");
  btn.className = "channel-btn";
  const img = document.createElement("img");
  img.src = ${JSON.stringify(STATIC_LOGO)};
  img.alt = "";
  const span = document.createElement("span");
  span.textContent = ch.name;
  btn.append(img, span);
  btn.onclick = () => play(ch, btn);
  list.appendChild(btn);
});
function play(ch, btn) {
  document.querySelectorAll(".channel-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  statusEl.className = "status";
  statusEl.textContent = "Yükleniyor: " + ch.name;
  if (hls) { hls.destroy(); hls = null; }
  video.pause();
  video.removeAttribute("src");
  video.load();
  if (window.Hls && Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      maxBufferLength: 25,
      maxMaxBufferLength: 50
    });
    hls.loadSource(ch.url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(() => {
        statusEl.textContent = "Yayın hazır. Oynat'a basın.";
      });
    });
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        statusEl.textContent = "Yayın yüklenemedi: " + ch.name;
        statusEl.className = "status error";
        hls.destroy();
        hls = null;
      }
    });
    video.onplaying = () => {
      statusEl.textContent = "Oynatılıyor: " + ch.name;
      statusEl.className = "status";
    };
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = ch.url;
    video.onloadedmetadata = () => video.play().catch(()=>{});
    video.onplaying = () => statusEl.textContent = "Oynatılıyor: " + ch.name;
    video.onerror = () => {
      statusEl.textContent = "Yayın yüklenemedi: " + ch.name;
      statusEl.className = "status error";
    };
  } else {
    statusEl.textContent = "Bu tarayıcı HLS desteklemiyor.";
    statusEl.className = "status error";
  }
}
</script>
</body>
</html>`;
}

// --- Routes ---
app.get("/", (req, res) => res.type("html").send(playerHTML(req)));
app.get("/player", (req, res) => res.type("html").send(playerHTML(req)));

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/channels", (req, res) => {
  res.json(CHANNELS.map(([id, name]) => ({
    id,
    name,
    source: STREAMS[id],
  })));
});

app.get("/playlist.m3u", (req, res) => {
  const lines = ["#EXTM3U"];
  for (const [id, name] of CHANNELS) {
    lines.push(
      `#EXTINF:-1 tvg-id="${id}" tvg-logo="${STATIC_LOGO}" group-title="Spor",TR:${name}`,
      absoluteUrl(req, `/${id}/mono.m3u8`)
    );
  }
  res.type("application/vnd.apple.mpegurl").send(lines.join("\n") + "\n");
});

app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target || typeof target !== "string" || !target.startsWith("http")) {
    return res.status(400).send("Invalid proxy url");
  }
  try {
    const upstream = await fetchUpstream(target, req.method);
    if (!upstream.ok && upstream.status >= 400) {
      return res.status(upstream.status).send(`Upstream error ${upstream.status}`);
    }
    const contentType = upstream.headers.get("content-type");
    if (contentType) res.set("Content-Type", contentType);
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(502).json({ error: "PROXY_FAILED", message: err.message });
  }
});

app.get("/:id/mono.m3u8", async (req, res) => {
  const id = req.params.id;
  const stream = STREAMS[id];
  if (!stream) return res.status(404).send("Kanal bulunamadı.");

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
    text = text.replace(/(https?:\/\/[^\s"']+)/g, (full) => {
      if (full.includes(req.get("host"))) return full;
      return makeProxyUrl(req, full);
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

app.use((req, res) => res.status(404).send("Not Found"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Proxy aktif: ${PROXY.host}:${PROXY.port}`);
});
