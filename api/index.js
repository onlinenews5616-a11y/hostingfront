module.exports = async (req, res) => {
  const shopifyDomain = "jobhub.jl.liveblog365.com";
  const proxyHost = req.headers.host;

  const targetURL = `https://${shopifyDomain}${req.url}`;

  try {
    let bodyBuffer = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      bodyBuffer = await new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
      });
    }

    let fetchURL = targetURL;
    let response;
    let redirectCount = 0;

    while (redirectCount < 5) {
      response = await fetch(fetchURL, {
        method: req.method,
        headers: {
          ...req.headers,
          host: new URL(fetchURL).hostname,
          "X-Forwarded-Host": proxyHost,
          "X-Forwarded-Proto": "https",
        },
        body: bodyBuffer || null,
        redirect: "manual",
      });

      if (response.status >= 300 && response.status < 400) {
        let location = response.headers.get("location") || "";

        if (location.includes(shopifyDomain)) {
          location = location
            .replace(`https://${shopifyDomain}`, `https://${proxyHost}`)
            .replace(`http://${shopifyDomain}`, `https://${proxyHost}`);
          res.setHeader("location", location);
          res.status(response.status).end();
          return;
        }

        if (location.includes(proxyHost)) {
          res.setHeader("location", location);
          res.status(response.status).end();
          return;
        }

        fetchURL = location.startsWith("http") ? location : `https://${shopifyDomain}${location}`;
        redirectCount++;
        continue;
      }

      break;
    }

    const skipHeaders = ["content-encoding", "transfer-encoding", "content-length"];
    response.headers.forEach((value, key) => {
      if (skipHeaders.includes(key)) return;
      if (key === "set-cookie") {
        value = value.replace(/Domain=[^;]+;?/gi, "");
      }
      res.setHeader(key, value);
    });

    const contentType = response.headers.get("content-type") || "";

    const rewriteText = (body) =>
      body
        .split(`https://${shopifyDomain}`).join(`https://${proxyHost}`)
        .split(`http://${shopifyDomain}`).join(`https://${proxyHost}`);

    // ✅ HTML rewrite + all custom changes
    if (contentType.includes("text/html")) {
      let body = rewriteText(await response.text());

      // ✅ 1. Inject Google Search Console verification
      body = body.replace(
        "<head>",
        `<head>\n<meta name="google-site-verification" content="oOB4GFrNSNdykfLPFYsy8byFMtrbAiccGJfrX7_UcOU" />`
      );

      // ✅ 2. Change site name to "Remote Jobs" everywhere
      body = body
        .split("frontendnode-production.up.railway.app").join("Remote Jobs")
        .split("frontendnode-oufb-production.up.railway.app").join("Remote Jobs")
        .split("HireZilla").join("Remote Jobs");

     // ✅ 3. Change Apply Now button URL
body = body.replace(
  /https:\/\/ihire\.allboardsolutions\.in\/job\/[^"'\s]*/g,
  "https://remotejob09.job4intern.com/pages/job-application"
);
// Also catch any other apply links pointing to thetodayupdate.com
body = body.replace(
  /https:\/\/remote\.thetodayupdate\.com[^"'\s]*/g,
  "https://remotejob09.job4intern.com/pages/job-application"
);
// Also catch remotejobs.trendingnewsgo.com apply links
body = body.replace(
  /https:\/\/remotejobs\.trendingnewsgo\.com[^"'\s]*/g,
  "https://remotejobs09.job4intern.com/pages/job-application"
);

      // ✅ 4. Inject custom CSS to change colors and design
      const customCSS = `
<style>
  /* ── New Color Scheme ── */
  :root {
    --primary: #1a1a2e !important;
    --primary-dark: #16213e !important;
    --primary-light: #e8e8f8 !important;
    --accent: #e94560 !important;
    --accent-dark: #c73652 !important;
    --bg: #f0f0f8 !important;
    --card: #ffffff !important;
    --border: #d0d0e8 !important;
    --text: #1a1a2e !important;
    --muted: #6b6b8a !important;
    --light: #eaeaf8 !important;
  }

  /* ── Navbar ── */
  nav, .navbar {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
    box-shadow: 0 2px 20px rgba(26,26,46,0.3) !important;
  }

  /* ── Logo ── */
  .nav-logo, .logo {
    font-size: 1.6rem !important;
    color: #fff !important;
    letter-spacing: -0.02em !important;
  }

  /* ── Hero Section ── */
  .hero {
    background: linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
    padding: 7rem 2rem 5rem !important;
    border-radius: 0 0 40px 40px !important;
  }

  .hero h1, h1 {
    color: #ffffff !important;
  }

  .hero h1 span, h1 span {
    color: #e94560 !important;
  }

  .hero-badge {
    background: rgba(233,69,96,0.15) !important;
    color: #e94560 !important;
    border-color: rgba(233,69,96,0.3) !important;
  }

  .hero-badge-dot {
    background: #e94560 !important;
  }

  /* ── Search Box ── */
  .search-wrapper {
    border-radius: 16px !important;
    border: 2px solid rgba(255,255,255,0.1) !important;
    background: rgba(255,255,255,0.95) !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important;
  }

  .search-btn {
    background: linear-gradient(135deg, #e94560, #c73652) !important;
    border-radius: 12px !important;
  }

  .search-btn:hover {
    background: linear-gradient(135deg, #c73652, #a52840) !important;
  }

  /* ── Category Pills ── */
  .category-pill:hover {
    border-color: #e94560 !important;
    color: #e94560 !important;
    background: rgba(233,69,96,0.08) !important;
  }

  /* ── Job Cards ── */
  .job-card:hover {
    border-color: #e94560 !important;
    box-shadow: 0 8px 30px rgba(233,69,96,0.15) !important;
  }

  .job-card::after {
    background: linear-gradient(90deg, #1a1a2e, #e94560) !important;
  }

  .job-title:hover {
    color: #e94560 !important;
  }

  /* ── Apply Button ── */
  .apply-button-main {
    background: linear-gradient(135deg, #e94560, #c73652) !important;
    box-shadow: 0 4px 20px rgba(233,69,96,0.4) !important;
    border-radius: 12px !important;
    font-size: 1rem !important;
    padding: 1.2rem 3rem !important;
  }

  .apply-button-main:hover {
    background: linear-gradient(135deg, #c73652, #a52840) !important;
    box-shadow: 0 8px 30px rgba(233,69,96,0.5) !important;
    transform: translateY(-3px) !important;
  }

  /* ── Section Title ── */
  .section-title svg {
    color: #e94560 !important;
  }

  /* ── Footer ── */
  .footer {
    background: linear-gradient(160deg, #1a1a2e 0%, #16213e 100%) !important;
  }

  .footer-category-card:hover {
    background: rgba(233,69,96,0.15) !important;
    border-color: #e94560 !important;
  }

  a.footer-link:hover {
    color: #e94560 !important;
  }

  .footer-logo:hover {
    color: #e94560 !important;
  }

  /* ── Pagination ── */
  .pagination-btn {
    background: #1a1a2e !important;
  }

  .pagination-btn:hover {
    background: #e94560 !important;
  }

  /* ── Nav primary link ── */
  .nav-link.primary {
    background: #e94560 !important;
  }

  .nav-link.primary:hover {
    background: #c73652 !important;
  }

  /* ── Apply card sidebar ── */
  .apply-card {
    background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%) !important;
  }

  .apply-stat-number {
    color: #e94560 !important;
  }

  .apply-feature svg {
    color: #e94560 !important;
  }

  /* ── Job detail meta hover ── */
  .job-detail-meta-item:hover {
    border-color: #e94560 !important;
    color: #e94560 !important;
  }

  /* ── Btn primary ── */
  .btn-primary {
    background: #1a1a2e !important;
    border-color: #1a1a2e !important;
  }

  .btn-secondary:hover {
    border-color: #e94560 !important;
    color: #e94560 !important;
  }
</style>
`;

      // Inject custom CSS before closing </head>
      body = body.replace("</head>", `${customCSS}\n</head>`);

      // ✅ 5. Update JobPosting schema dates
      body = body.replace(
        /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
        (match, json) => {
          try {
            const schema = JSON.parse(json);
            const update = (obj) => {
              if (!obj || typeof obj !== "object") return obj;
              if (Array.isArray(obj)) return obj.map(update);
              if (obj["@type"] === "JobPosting") {
                obj["datePosted"] = "2026-05-06";
                obj["validThrough"] = "2026-12-31";
              }
              Object.keys(obj).forEach((k) => { obj[k] = update(obj[k]); });
              return obj;
            };
            return `<script type="application/ld+json">${JSON.stringify(update(schema))}</script>`;
          } catch {
            return match;
          }
        }
      );

      res.setHeader("content-type", "text/html; charset=utf-8");
      return res.status(response.status).send(body);
    }

    // CSS rewrite
    if (contentType.includes("text/css")) {
      const body = rewriteText(await response.text());
      res.setHeader("content-type", "text/css");
      return res.status(response.status).send(body);
    }

    // Sitemap & XML rewrite
    if (req.url.includes("sitemap") || contentType.includes("xml")) {
      const body = rewriteText(await response.text());
      res.setHeader("content-type", "application/xml; charset=utf-8");
      return res.status(response.status).send(body);
    }

    // JS rewrite
    if (contentType.includes("javascript")) {
      const body = rewriteText(await response.text());
      res.setHeader("content-type", contentType);
      return res.status(response.status).send(body);
    }

    // Binary passthrough
    const buffer = await response.arrayBuffer();
    return res.status(response.status).send(Buffer.from(buffer));

  } catch (error) {
    res.status(500).send("Proxy error: " + error.message);
  }
};
