import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Vite middleware for development
  let vite: any;
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // We use custom to manually serve index.html with transformations
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static assets first
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Robust Fallback Handler for SPA routing + Metadata Injection
  // In Express 5, use *all to catch every route safely
  app.get("*all", async (req, res, next) => {
    const url = req.originalUrl;

    // Skip for API routes
    if (url.startsWith('/api')) {
      return next();
    }

    // Only handle GET requests for navigation (not for .js, .css, etc.)
    const isAsset = (/\.[a-z0-9]+$/i).test(url.split('?')[0]);
    if (req.method !== 'GET' || isAsset) {
      return next();
    }

    try {
      let template: string;
      if (process.env.NODE_ENV !== "production") {
        if (!vite) return next();
        const indexPath = path.resolve(process.cwd(), 'index.html');
        template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        const indexPath = path.resolve(process.cwd(), 'dist/index.html');
        if (!fs.existsSync(indexPath)) {
          return next();
        }
        template = fs.readFileSync(indexPath, 'utf-8');
      }

      // Metadata logic
      const query = req.query;
      let title = "আপন ফাউন্ডেশন - মানব সেবায় আমরা";
      let description = "আপন ফাউন্ডেশন একটি অরাজনৈতিক ও অলাভজনক সামাজিক সংগঠন। মহানুভবতা ও মানব সেবায় আমরা কাজ করি।";
      let image = "/logo.png";

      if (query.view === 'BLOOD_DONORS') {
        title = "রক্তদাতা সেবা - আপন ফাউন্ডেশন";
        description = "রক্তদান জীবন বাঁচায় - আপন ফাউন্ডেশনের মাধ্যমে রক্তদাতা খুঁজুন বা নিবন্ধন করুন।";
        image = "https://images.unsplash.com/photo-1615461066841-6116ecaaba7f?q=80&w=1200&h=630&auto=format&fit=crop"; 
      }

      const host = req.get('host') || 'localhost:3000';
      const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
      const absoluteBase = `${protocol}://${host}`;
      const absoluteImage = image.startsWith('http') ? image : `${absoluteBase}${image}`;
      const absoluteUrl = `${absoluteBase}${url}`;

      let html = template;
      html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

      const replaceMeta = (htmlContent: string, propertyName: string, newValue: string, isName = false) => {
        const attr = isName ? 'name' : 'property';
        const regex = new RegExp(`<meta\\s+${attr}="${propertyName}"\\s+content=".*?"\\s*\\/?>`, 'i');
        const newTag = `<meta ${attr}="${propertyName}" content="${newValue}" />`;
        return regex.test(htmlContent) ? htmlContent.replace(regex, newTag) : htmlContent.replace('</head>', `    ${newTag}\n  </head>`);
      };

      html = replaceMeta(html, 'og:title', title);
      html = replaceMeta(html, 'og:description', description);
      html = replaceMeta(html, 'og:image', absoluteImage);
      html = replaceMeta(html, 'og:url', absoluteUrl);
      html = replaceMeta(html, 'twitter:title', title, true);
      html = replaceMeta(html, 'twitter:description', description, true);
      html = replaceMeta(html, 'twitter:image', absoluteImage, true);
      html = replaceMeta(html, 'itemprop:name', title);
      html = replaceMeta(html, 'itemprop:description', description);
      html = replaceMeta(html, 'itemprop:image', absoluteImage);

      const whatsappTags = `
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="আপন ফাউন্ডেশন" />
      `;
      if (!html.includes('og:site_name')) html = html.replace('</head>', `    ${whatsappTags}\n  </head>`);

      res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
    } catch (e: any) {
      console.error("Server Error:", e.message);
      next(e);
    }
  });


  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
