# NameScout — Vercel deployment

## 1. Deploy the website
1. Create a GitHub repository and upload all files in this folder.
2. Sign in at https://vercel.com and choose **Add New → Project**.
3. Import the GitHub repository. Framework preset: **Other**. Build command: leave empty. Output directory: `public`.
4. Deploy. Vercel will host the frontend and `/api/*` serverless functions.

## 2. Configure Telegram checking
The website generator works immediately after deployment. Live Telegram checking requires your own Telegram API credentials and a logged-in MTProto session.

1. Get `api_id` and `api_hash` at https://my.telegram.org → API development tools.
2. On a trusted computer, in this project folder run `npm install`.
3. Run `node create-session.js` (the script is included in this project). It asks for your phone number, Telegram login code and optional 2FA password in your terminal. It prints a session string.
4. In Vercel → Project → Settings → Environment Variables add:
   - `TG_API_ID`
   - `TG_API_HASH`
   - `TG_SESSION`
5. Redeploy after adding variables.

**Session safety:** the session string grants access to your Telegram account. Never share it, commit it to GitHub, paste it into chat, or expose it in frontend code. Use a separate Telegram account if you prefer. You can revoke sessions from Telegram Settings → Devices.

## Notes
- Checking does not reserve a username. Availability can change immediately.
- Telegram rate limits requests; check in batches of 20 and avoid repeated bulk checks.
- Ordinary usernames are checked. Collectible usernames may be subject to separate Fragment rules.
- A check can return `unknown` for rate limits/network errors; it is not proof that a name is taken or free.
