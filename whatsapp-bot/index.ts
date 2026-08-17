import express from 'express';
import cors from 'cors';
import pino from 'pino';
import dotenv from 'dotenv';
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';

dotenv.config();

const app = express();
app.use(cors());
// Ultramsg uses application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3001;
const AUTH_DIR = './auth_info_baileys';

let sock: ReturnType<typeof makeWASocket> | null = null;
let isReady = false;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // We'll print it manually so we can format it
    logger: pino({ level: 'silent' }), // Hide noisy logs
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log('\n--- SCAN THIS QR CODE TO AUTHENTICATE ---');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
      isReady = false;
      if (shouldReconnect) {
        connectToWhatsApp();
      } else {
        console.log('Logged out. Please delete the auth_info_baileys folder and restart to scan again.');
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp API is ready!');
      isReady = true;
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

// ----------------------------------------------------
// API ROUTES (MIMICKING ULTRAMSG)
// ----------------------------------------------------

// Middleware to check if ready and authorized
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.body.token || req.query.token;
  if (!token || token !== process.env.API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
  if (!isReady || !sock) {
    return res.status(503).json({ error: 'WhatsApp client is not ready yet. Please check terminal.' });
  }
  next();
};

// 1. Send Message
// POST /messages/chat
// Body: { token, to, body }
app.post('/messages/chat', requireAuth, async (req, res) => {
  try {
    let { to, body } = req.body;
    
    if (!to || !body) {
      return res.status(400).json({ error: 'Missing to or body parameters' });
    }

    // Baileys requires @s.whatsapp.net for individuals and @g.us for groups
    if (to.includes('@c.us')) {
      to = to.replace('@c.us', '@s.whatsapp.net');
    }

    const sentMsg = await sock!.sendMessage(to, { text: body });
    return res.json({ sent: 'true', message: 'ok', id: sentMsg?.key.id });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 2. Create Group
// POST /groups/create
// Body: { token, group_name, contacts }
app.post('/groups/create', requireAuth, async (req, res) => {
  try {
    const { group_name, contacts } = req.body;
    
    if (!group_name || !contacts) {
      return res.status(400).json({ error: 'Missing group_name or contacts parameters' });
    }

    // Contacts come as a comma-separated string from Ultramsg format
    const contactArray = contacts.split(',').map((c: string) => {
      let num = c.trim().replace('+', '');
      if (num.includes('@c.us')) num = num.replace('@c.us', '@s.whatsapp.net');
      if (!num.includes('@')) num = num + '@s.whatsapp.net';
      return num;
    });

    const group = await sock!.groupCreate(group_name, contactArray);
    
    // Ultramsg returns the group ID which can be used to send messages later
    return res.json({ sent: 'true', message: 'ok', id: group.id });
  } catch (error: any) {
    console.error('Error creating group:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`WhatsApp API Gateway starting on port ${PORT}...`);
  connectToWhatsApp();
});
