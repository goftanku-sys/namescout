import "dotenv/config";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";

const apiId = Number(process.env.TG_API_ID);
const apiHash = process.env.TG_API_HASH;
if (!apiId || !apiHash) {
  console.error("Set TG_API_ID and TG_API_HASH in a local .env file first.");
  process.exit(1);
}
const client = new TelegramClient(new StringSession(""), apiId, apiHash, { connectionRetries: 5 });
await client.start({
  phoneNumber: async () => await input.text("Telegram phone number: "),
  password: async () => await input.text("Telegram 2FA password (if enabled): "),
  phoneCode: async () => await input.text("Login code from Telegram: "),
  onError: err => console.error(err)
});
console.log("\\nCopy this value to Vercel as TG_SESSION. Keep it secret:\\n");
console.log(client.session.save());
await client.disconnect();
