import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const names = Array.isArray(req.body?.usernames) ? req.body.usernames : [];
  if (!names.length || names.length > 100) return res.status(400).json({ error: "Send 1–100 usernames per request." });
  const valid = [...new Set(names.filter(n => typeof n === "string" && /^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(n)))];
  if (!valid.length) return res.status(200).json({ results: [] });

  const apiId = Number(process.env.TG_API_ID);
  const apiHash = process.env.TG_API_HASH;
  const sessionString = process.env.TG_SESSION;
  if (!apiId || !apiHash || !sessionString) {
    return res.status(503).json({ error: "Telegram API is not configured. Add TG_API_ID, TG_API_HASH and TG_SESSION in Vercel Environment Variables." });
  }

  const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, { connectionRetries: 2 });
  try {
    await client.connect();
    const results = [];
    for (const username of valid) {
      try {
        const available = await client.invoke(new Api.account.CheckUsername({ username }));
        results.push({ username, status: available ? "available" : "taken" });
      } catch (e) {
        const msg = String(e?.errorMessage || e?.message || "");
        if (/USERNAME_OCCUPIED|USERNAME_INVALID|USERNAME_PURCHASE_AVAILABLE|USERNAME_NOT_OCCUPIED/i.test(msg)) {
          results.push({ username, status: /NOT_OCCUPIED|PURCHASE_AVAILABLE/i.test(msg) ? "available" : "taken" });
        } else {
          results.push({ username, status: "unknown", reason: msg.slice(0, 120) });
        }
      }
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    return res.status(200).json({ results });
  } catch (e) {
    return res.status(503).json({ error: e?.message || "Telegram connection failed." });
  } finally {
    try { await client.disconnect(); } catch {}
  }
}
