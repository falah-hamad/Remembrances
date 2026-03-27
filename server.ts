import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy for Quran API to avoid CORS issues
  app.get("/api/proxy/surahs", async (req, res) => {
    try {
      const response = await fetch("https://quran.yousefheiba.com/api/surahs");
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: "Failed to fetch surahs from proxy" });
    }
  });

  app.get("/api/proxy/prayer-times", async (req, res) => {
    try {
      const { lat, lng } = req.query;
      const url = `https://quran.yousefheiba.com/api/getPrayerTimes?lat=${lat}&lng=${lng}`;
      console.log(`Fetching prayer times from: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Prayer times response:", JSON.stringify(data).substring(0, 200) + "...");
      res.json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: "Failed to fetch prayer times from proxy" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
