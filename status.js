export default function handler(_req, res) {
  const configured = Boolean(process.env.TG_API_ID && process.env.TG_API_HASH && process.env.TG_SESSION);
  res.status(200).json({
    checkerConfigured: configured,
    connected: false,
    message: configured ? "Telegram API configured" : "Telegram API credentials/session are missing"
  });
}
