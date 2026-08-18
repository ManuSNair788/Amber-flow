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
const AUTH_DIR = process.env.AUTH_DIR || './auth_info_baileys';

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

  // Listen for incoming messages to provide the Group ID privately
  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg.message) return;

      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      const textLower = text.toLowerCase().trim();
      
      // DEBUG LOGGING: So we can see what the bot is hearing!
      if (textLower) {
        console.log(`[DEBUG] Bot heard a message: "${textLower}"`);
      }

      if (textLower.startsWith('!id') || textLower.startsWith('!getid')) {
        console.log(`[DEBUG] !id command triggered by: ${msg.key.remoteJid}`);
        let senderJid = msg.key.fromMe ? sock!.user?.id : (msg.key.participant || msg.key.remoteJid);
        if (senderJid && senderJid.includes(':')) {
          senderJid = senderJid.split(':')[0] + '@s.whatsapp.net';
        }
        if (!senderJid) return;

        // Check if they provided a group name to search for (e.g. "!id Leap Scholar")
        const args = textLower.split(' ');
        if (args.length > 1) {
          const searchName = textLower.substring(textLower.indexOf(' ') + 1).trim();
          console.log(`[DEBUG] Searching for groups matching: ${searchName}`);
          const groups = await sock!.groupFetchAllParticipating();
          const matchedGroups = Object.values(groups).filter(g => g.subject.toLowerCase().includes(searchName));
          
          let replyText = '';
          if (matchedGroups.length === 0) {
            replyText = `🤖 Could not find any group matching "${searchName}".`;
          } else {
            replyText = `🤖 *Group IDs matching "${searchName}":*\n\n`;
            matchedGroups.forEach(g => {
              replyText += `- *${g.subject}*: ${g.id}\n`;
            });
          }
          await sock!.sendMessage(senderJid, { text: replyText });
          console.log(`[DEBUG] Sent search results to ${senderJid}`);
        } else {
          // No arguments provided, just get the ID of the current chat
          const chatId = msg.key.remoteJid;
          if (chatId) {
            await sock!.sendMessage(senderJid, { 
              text: `🤖 *Private Admin Message*\nThe ID for the group/chat "${chatId}" is:\n\n*${chatId}*` 
            });
            console.log(`[DEBUG] Sent chat ID to ${senderJid}`);
          }
        }
      }
    } catch (err) {
      console.error('[DEBUG] Error inside messages.upsert:', err);
    }
  });
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
  console.log('Incoming request from Vercel:', req.body);
  try {
    let { to, body } = req.body;
    
    if (!to || !body) {
      return res.status(400).json({ error: 'Missing to or body parameters' });
    }

    // Baileys requires @s.whatsapp.net for individuals and @g.us for groups
    if (to.includes('@c.us')) {
      to = to.replace('@c.us', '@s.whatsapp.net');
    } else if (!to.includes('@')) {
      to = `${to}@s.whatsapp.net`;
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
    console.log(`🎉 New Group Created! Name: ${group_name} | ID: ${group.id}`);
    
    // Ultramsg returns the group ID which can be used to send messages later
    return res.json({ sent: 'true', message: 'ok', id: group.id });
  } catch (error: any) {
    console.error('Error creating group:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 3. Get All Groups
// GET /groups
// Query: ?token=poai_local_token_123
app.get('/groups', requireAuth, async (req, res) => {
  try {
    const groups = await sock!.groupFetchAllParticipating();
    const groupList = Object.values(groups).map(g => ({
      id: g.id,
      name: g.subject
    }));
    return res.json(groupList);
  } catch (error: any) {
    console.error('Error fetching groups:', error);
    return res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`WhatsApp API Gateway starting on port ${PORT}...`);
  connectToWhatsApp();
});
