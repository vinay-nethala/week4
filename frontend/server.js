import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// Required for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------- HEALTH ENDPOINT ---------------- */
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/* ---------------- SERVE FRONTEND ---------------- */
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "src")));

app.listen(PORT, () => {
  console.log(`✅ Frontend server running on http://localhost:${PORT}`);
});
