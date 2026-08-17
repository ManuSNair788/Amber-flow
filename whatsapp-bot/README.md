# Self-Hosted WhatsApp API Gateway

This is a standalone Node.js microservice that uses `@whiskeysockets/baileys` to expose a REST API mimicking the Ultramsg API. It can be used as a drop-in replacement for Ultramsg to send messages and create groups.

## Setup Instructions

1. Open your terminal and navigate to this folder:
   ```bash
   cd whatsapp-bot
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the API server:
   ```bash
   npm run dev
   ```

4. **Authentication:** 
   When the server starts, it will print a QR code in the terminal. Open WhatsApp on your phone, go to **Linked Devices**, and scan the QR code. Once scanned, the bot is authenticated and ready to receive API requests! The session is saved in the `auth_info_baileys` folder, so you don't need to scan it again unless you log out from your phone.

## API Endpoints

This server listens on `http://localhost:3001` (by default) and requires the `API_TOKEN` defined in `.env` as the `token` in the request body.

### 1. Send Message
**Endpoint:** `POST /messages/chat`
**Content-Type:** `application/x-www-form-urlencoded`
**Body:**
- `token`: Your API token (e.g. `poai_local_token_123`)
- `to`: The phone number (e.g. `919876543210` or `1234567890-123456@g.us`)
- `body`: The message text

### 2. Create Group
**Endpoint:** `POST /groups/create`
**Content-Type:** `application/x-www-form-urlencoded`
**Body:**
- `token`: Your API token
- `group_name`: Name of the group
- `contacts`: Comma-separated list of phone numbers (e.g. `919876543210,919999999999`)

## Integrating with the Next.js App
When you are ready to switch from Ultramsg to this local API, update your Next.js `.env.local`:
```env
ULTRAMSG_INSTANCE_ID=local
ULTRAMSG_TOKEN=poai_local_token_123
```

And update `app/(dashboard)/queue/actions.ts` to replace `https://api.ultramsg.com/${instanceId}/...` with `http://localhost:3001/...`.
