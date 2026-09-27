const express = require('express');
const cors    = require('cors');
const path    = require('path');
const QRCode  = require('qrcode');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// ── WhatsApp client ────────────────────────────────────────────────────
// Login is done once by scanning a QR code with your phone
// (WhatsApp → Linked devices → Link a device). The session is saved in
// the .wwebjs_auth folder, so you don't need to scan again next time.
const wa = {
  status: 'starting',   // starting | qr | ready | disconnected | error
  qr:     null,         // QR code as data:image/png
  me:     null,         // { number, name }
  error:  null,
};

let client = null;

function createClient() {
  const puppeteer = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  };
  // Optional: use your own Chrome instead of the downloaded one
  if (process.env.CHROME_PATH) puppeteer.executablePath = process.env.CHROME_PATH;

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '.wwebjs_auth') }),
    puppeteer,
  });

  client.on('qr', async qr => {
    wa.status = 'qr';
    wa.qr     = await QRCode.toDataURL(qr, { margin: 1, width: 280 });
    console.log('Scan the QR code shown in the app (Connect WhatsApp).');
  });

  client.on('authenticated', () => {
    wa.status = 'starting';
    wa.qr     = null;
  });

  client.on('ready', () => {
    wa.status = 'ready';
    wa.qr     = null;
    wa.error  = null;
    wa.me = {
      number: client.info?.wid?.user || '',
      name:   client.info?.pushname || '',
    };
    console.log(`WhatsApp connected as +${wa.me.number}`);
  });

  client.on('auth_failure', msg => {
    wa.status = 'error';
    wa.error  = 'Login failed: ' + msg;
  });

  client.on('disconnected', reason => {
    console.log('WhatsApp disconnected:', reason);
    wa.status = 'disconnected';
    wa.me     = null;
    wa.qr     = null;
    restartClient();
  });

  wa.status = 'starting';
  client.initialize().catch(err => {
    console.error('WhatsApp init error:', err.message);
    wa.status = 'error';
    wa.error  = err.message;
    setTimeout(restartClient, 10000); // try again in 10 s
  });
}

async function restartClient() {
  try { if (client) await client.destroy(); } catch (_) {}
  client = null;
  setTimeout(createClient, 1500);
}

// Clean a phone number to digits only, adding the default country code
// when the number is a plain local number (e.g. 10 digits in India).
function normalisePhone(raw, countryCode) {
  let digits = String(raw || '').replace(/\D/g, '');
  const cc   = String(countryCode || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (cc && digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (cc && digits.length <= 10) digits = cc + digits;
  return digits;
}

// GET /api/wa/status — connection state + QR code (if waiting for scan)
app.get('/api/wa/status', (req, res) => {
  res.json(wa);
});

// POST /api/wa/logout — unlink this computer from WhatsApp
app.post('/api/wa/logout', async (req, res) => {
  try {
    if (client && wa.status === 'ready') await client.logout();
  } catch (_) {}
  wa.status = 'starting';
  wa.me     = null;
  restartClient();
  res.json({ ok: true });
});

// POST /api/wa/send
// Body: { phone, countryCode, caption, attachmentBase64, filename }
app.post('/api/wa/send', async (req, res) => {
  const { phone, countryCode, caption, attachmentBase64, filename } = req.body;

  if (!client || wa.status !== 'ready') {
    return res.status(409).json({ error: 'WhatsApp is not connected' });
  }
  if (!phone || !attachmentBase64) {
    return res.status(400).json({ error: 'Missing phone or certificate' });
  }

  const number = normalisePhone(phone, countryCode);
  if (number.length < 8) {
    return res.status(400).json({ error: `Invalid number "${phone}"` });
  }

  try {
    let numberId = null;
    try {
      numberId = await client.getNumberId(number);
    } catch (e) {
      console.warn('Number check failed, sending anyway:', e.message);
      numberId = { user: number, server: 'c.us' };
    }
    if (!numberId) {
      return res.status(404).json({ error: `+${number} is not on WhatsApp` });
    }

    // WhatsApp Web (July 2026) renamed id._serialized to id.$1 — support both.
    const chatId =
      numberId._serialized ||
      numberId.$1 ||
      (numberId.user ? `${numberId.user}@${numberId.server || 'c.us'}` : `${number}@c.us`);

    const media = new MessageMedia('image/png', attachmentBase64, filename || 'certificate.png');
    await client.sendMessage(chatId, media, { caption: caption || '', sendSeen: false });

    res.json({ ok: true, to: number });
  } catch (err) {
    console.error('Send error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Certificate sender running → http://localhost:${PORT}/index.html`);
  createClient();
});
