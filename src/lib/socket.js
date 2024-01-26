const { useMultiFileAuthState, default: makeWASocket } = require("@whiskeysockets/baileys");
const { default: pino } = require("pino");

async function socketWhatsapp() {
  const auth = await useMultiFileAuthState("auth");
  const sock = makeWASocket({
    printQRInTerminal: true,
    browser: ["Server", "Firefox", "1.0.0"],
    auth: auth.state,
    logger: pino({ level: "silent" }),
  });
  return sock;
}

module.exports = socketWhatsapp
