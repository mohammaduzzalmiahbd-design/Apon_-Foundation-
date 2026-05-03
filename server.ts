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
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
  }

  // API routes (if any)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Fallback to serving index.html for CSR with custom meta tags
  // Using app.get with a wildcard that works in Express 5
  app.get('/:all*', async (req, res, next) => {
    const url = req.originalUrl;
    const query = req.query;

    // Skip for API routes or files with extensions
    if (url.startsWith('/api') || url.includes('.')) {
      return next();
    }

    try {
      let template: string;
      if (process.env.NODE_ENV !== "production") {
        if (!vite) {
          return res.status(500).send("Vite server not initialized");
        }
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        const indexPath = path.resolve(__dirname, 'dist/index.html');
        if (!fs.existsSync(indexPath)) {
           return res.status(404).send("Production build not found. Please build the app first.");
        }
        template = fs.readFileSync(indexPath, 'utf-8');
      }

      // Default Meta Values
      let title = "আপন ফাউন্ডেশন - মানব সেবায় আমরা";
      let description = "আপন ফাউন্ডেশন একটি অরাজনৈতিক ও অলাভজনক সামাজিক সংগঠন। মহানুভবতা ও মানব সেবায় আমরা কাজ করি।";
      let image = "/logo.png";

      // Customize Meta for Blood Donors
      if (query.view === 'BLOOD_DONORS') {
        title = "রক্তদাতা সেবা - আপন ফাউন্ডেশন";
        description = "রক্তদান জীবন বাঁচায় - আপন ফাউন্ডেশনের মাধ্যমে রক্তদাতা খুঁজুন বা নিবন্ধন করুন।";
        // Using a reliable high-quality public image for blood donation preview
        image = "https://images.unsplash.com/photo-1615461066841-6116ecaaba7f?q=80&w=1200&h=630&auto=format&fit=crop"; 
      }

      // Replace meta tags in template using a more robust approach
      let html = template;
      
      const host = req.get('host') || '';
      const protocol = req.protocol || 'https';
      const absoluteBase = `${protocol}://${host}`;
      const absoluteImage = image.startsWith('http') ? image : `${absoluteBase}${image}`;
      const absoluteUrl = `${protocol}://${host}${url}`;

      const replacements: Record<string, string> = {
        'title': `<title>${title}</title>`,
        'og:title': `<meta property="og:title" content="${title}" />`,
        'og:description': `<meta property="og:description" content="${description}" />`,
        'og:image': `<meta property="og:image" content="${absoluteImage}" />`,
        'og:url': `<meta property="og:url" content="${absoluteUrl}" />`,
        'twitter:title': `<meta name="twitter:title" content="${title}" />`,
        'twitter:description': `<meta name="twitter:description" content="${description}" />`,
        'twitter:image': `<meta name="twitter:image" content="${absoluteImage}" />`,
        'itemprop:name': `<meta itemprop="name" content="${title}" />`,
        'itemprop:description': `<meta itemprop="description" content="${description}" />`,
        'itemprop:image': `<meta itemprop="image" content="${absoluteImage}" />`,
      };

      // Header replacements
      html = html.replace(/<title>.*?<\/title>/, replacements['title']);
      html = html.replace(/<meta property="og:title" content=".*?" \/>/, replacements['og:title']);
      html = html.replace(/<meta property="og:description" content=".*?" \/>/, replacements['og:description']);
      html = html.replace(/<meta property="og:image" content=".*?" \/>/, replacements['og:image']);
      html = html.replace(/<meta property="og:url" content=".*?" \/>/, replacements['og:url']);
      
      // Handle twitter tags (checking for name= and property=)
      html = html.replace(/<meta (name|property)="twitter:title" content=".*?" \/>/, replacements['twitter:title']);
      html = html.replace(/<meta (name|property)="twitter:description" content=".*?" \/>/, replacements['twitter:description']);
      html = html.replace(/<meta (name|property)="twitter:image" content=".*?" \/>/, replacements['twitter:image']);

      // Handle itemprop tags
      html = html.replace(/<meta itemprop="name" content=".*?" \/>/, replacements['itemprop:name']);
      html = html.replace(/<meta itemprop="description" content=".*?" \/>/, replacements['itemprop:description']);
      html = html.replace(/<meta itemprop="image" content=".*?" \/>/, replacements['itemprop:image']);

      // Add extra tags for WhatsApp richness
      const extraTags = `
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:site_name" content="আপন ফাউন্ডেশন" />
      `;
      html = html.replace('</head>', `    ${extraTags}\n  </head>`);

      res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
    } catch (e: any) {
      if (process.env.NODE_ENV !== "production") {
        vite.ssrFixStacktrace(e);
      }
      console.log(e.stack);
      res.status(500).end(e.stack);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
