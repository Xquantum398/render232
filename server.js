const express = require("express");
const app = express();

app.disable("x-powered-by");
app.disable("etag");

const PORT = process.env.PORT || 10000;

const STATIC_LOGO = "https://i.hizliresim.com/8xzjgqv.jpg";
const BASE_URL = "https://zeus728177.cfd/";
const REFERRER = "https://zeustv270.live/";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

const CHANNELS = [
  ["patron", "beIN Sports 1 HD"],
  ["zirve", "beIN Sports 1 HD"], 
  ["taraftarium", "beIN Sports 1 HD"], 
  ["b1", "beIN Sports 1 HD"], 
  ["b2", "beIN Sports 2 HD"],
  ["b3", "beIN Sports 3 HD"],
  ["b4", "beIN Sports 4 HD"],
  ["b5", "beIN Sports 5 HD"],
  ["bm1", "beIN SPORTS HD 1 MAX"],
  ["bm2", "beIN SPORTS HD 2 MAX"],
  ["ss", "S SPORTS 1 HD"],
  ["ss2", "S SPORTS 2 HD"],
  ["t1", "Tivibu SPORTS 1 HD"],
  ["t2", "Tivibu SPORTS 2 HD"],
  ["t3", "Tivibu SPORTS 3 HD"],
  ["t4", "Tivibu SPORTS 4 HD"],
  ["smarts", "Smart SPORTS 1 HD"],
  ["sms2", "Smart SPORTS  2 HD"],
  ["smarts2", "Smart SPORTS 1 HD"],
  ["trtspor", "TRT SPORTS HD "],
  ["trtspor2", "TRT Yıldız SPORTS HD"],
  ["trt1", "TRT 1 HD "],
  ["as", "A SPORTS HD "],
  ["atv", "ATV HD "],
  ["tv8", "TV 8 HD 3"],
  ["tv85", "TV 8,5 HD 4"],
  ["eu1", "EUROSPORT SPORTS HD 1"],
  ["eu2", "EUROSPORT SPORTS HD 2"],
  ["ex1", "EXXEN SPORTS 1 HD"],
  ["ex2", "EXXEN SPORTS 2 HD"],
  ["ex3", "EXXEN SPORTS 3 HD"],
  ["ex4", "EXXEN SPORTS 4 HD"],
  ["ex5", "EXXEN SPORTS 5 HD"],
  ["ex6", "EXXEN SPORTS 6 HD"],
  ["ex7", "EXXEN SPORTS 7 HD"],
  ["ex8", "EXXEN SPORTS 8 HD"],
];

const STREAMS = {
  "patron": `${BASE_URL}patron/mono.m3u8`,
  "zirve": `${BASE_URL}zirve/mono.m3u8`,
  "taraftarium": `${BASE_URL}taraftarium/mono.m3u8`,
  "b1": `${BASE_URL}b1/mono.m3u8`,
  "b2": `${BASE_URL}b2/mono.m3u8`,
  "b3": `${BASE_URL}b3/mono.m3u8`,
  "b4": `${BASE_URL}b4/mono.m3u8`,
  "b5": `${BASE_URL}b5/mono.m3u8`,
  "bm1": `${BASE_URL}bm1/mono.m3u8`,
  "bm2": `${BASE_URL}bm2/mono.m3u8`,
  "ss": `${BASE_URL}ss/mono.m3u8`,
  "ss2": `${BASE_URL}ss2/mono.m3u8`,
  "t1": `${BASE_URL}t1/mono.m3u8`,
  "t2": `${BASE_URL}t2/mono.m3u8`,
  "t3": `${BASE_URL}t3/mono.m3u8`,
  "t4": `${BASE_URL}t4/mono.m3u8`,
  "smarts": `${BASE_URL}smarts/mono.m3u8`,
  "sms2": `${BASE_URL}sms2/mono.m3u8`,
  "smarts2": `${BASE_URL}smarts2/mono.m3u8`,
  "trtspor": `${BASE_URL}trtspor/mono.m3u8`,
  "trtspor2": `${BASE_URL}trtspor2/mono.m3u8`,
  "trt1": `${BASE_URL}trt1/mono.m3u8`,
  "as": `${BASE_URL}as/mono.m3u8`,
  "atv": `${BASE_URL}atv/mono.m3u8`,
  "tv8": `${BASE_URL}tv8/mono.m3u8`,
  "tv85": `${BASE_URL}tv85/mono.m3u8`,
  "eu1": `${BASE_URL}eu1/mono.m3u8`,
  "eu2": `${BASE_URL}eu2/mono.m3u8`,
  "ex1": `${BASE_URL}ex1/mono.m3u8`,
  "ex2": `${BASE_URL}ex2/mono.m3u8`,
  "ex3": `${BASE_URL}ex3/mono.m3u8`,
  "ex4": `${BASE_URL}ex4/mono.m3u8`,
  "ex5": `${BASE_URL}ex5/mono.m3u8`,
  "ex6": `${BASE_URL}ex6/mono.m3u8`,
  "ex7": `${BASE_URL}ex7/mono.m3u8`,
  "ex8": `${BASE_URL}ex8/mono.m3u8`,
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
  return fetch(url, {
    method,
    redirect: "follow",
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "*/*",
      Referer: REFERRER,
      Origin: new URL(REFERRER).origin,
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

// Ana sayfa → Player
app.get("/", (req, res) => {
  res.type("html").send(playerHTML(req));
});

app.get("/player", (req, res) => {
  res.type("html").send(playerHTML(req));
});

// Health
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Kanal listesi
app.get("/channels", (req, res) => {
  res.json(
    CHANNELS.map(([id, name]) => ({
      id,
      name,
      source: STREAMS[id],
    }))
  );
});

// IPTV Playlist
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

// Proxy (Worker’daki mantık)
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

    // Stream body’yi direkt aktar
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

    // Worker’daki gibi: tüm http/https linklerini proxy’ye çevir
    text = text.replace(/(https?:\/\/[^\s"']+)/g, (full) => {
      // zaten bizim proxy ise dokunma
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

// 404
app.use((req, res) => {
  res.status(404).send("Not Found");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
