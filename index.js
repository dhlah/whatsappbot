const {
  useMultiFileAuthState,
  makeInMemoryStore,
  DisconnectReason,
  default: makeWASocket,
} = require("@whiskeysockets/baileys");
const { handleMenfestCommand } = require("./src/commands/menfest.js");
const { handleJadwalSholatCommand } = require("./src/commands/jadwalsholat.js");
const { handleStatusCommand } = require("./src/commands/status.js");
const {
  handleJadwalMapelCommand,
} = require("./src/commands/jadwalpelajaran.js");
const { handleInfoCommand } = require("./src/commands/info.js");
const { handleMenuCommand } = require("./src/commands/menu.js");
const {
  handleTambahTugas,
  handleHapusTugas,
  handleDaftarTugas,
} = require("./src/commands/tugas.js");
const express = require("express");
const cron = require("node-cron");
const cors = require("cors");
const { Boom } = require("@hapi/boom");
const { handleScheduleInfo } = require("./src/commands/scheduleInfo.js");
const socketWhatsapp = require("./src/lib/socket.js");
const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");
const { session } = { session: "auth" };
const app = express();
const port = 3000;
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const qrcode = require("qrcode");
const { default: pino } = require("pino");
const bodyParser = require("body-parser");
const {
  handleDaftarInfo,
  handleInfoBaru,
  handleHapusInfo,
} = require("./src/commands/infocommand.js");

let sock;
let qr;
let soket;

cron.schedule(
  "0 19 * * *",
  async () => {
    const sock = await socketWhatsapp();
    await handleScheduleInfo(sock);
    console.log("test");
  },
  {
    timezone: "Asia/Jakarta", // Ganti sesuai zona waktu Anda
  }
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/assets", express.static(__dirname + "/client/assets"));

app.get("/scan", (req, res) => {
  res.sendFile("./client/server.html", {
    root: __dirname,
  });
});

app.get("/", (req, res) => {
  res.json({ status: 200, message: "OK" });
});

app.get("/", (req, res) => {
  res.json({ message: "OK" });
});

//! FUNGSI WHATSAPP !//

const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

async function connectToWhatsApp() {
  const auth = await useMultiFileAuthState("auth");
  sock = makeWASocket({
    printQRInTerminal: true,
    browser: ["Server", "Firefox", "1.0.0"],
    auth: auth.state,
    logger: pino({ level: "silent" }),
  });
  sock.ev.on("creds.update", auth.saveCreds);
  store.bind(sock.ev);
  sock.multi = true;
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      let reason = new Boom(lastDisconnect.error).output.statusCode;
      if (reason === DisconnectReason.badSession) {
        console.log(
          `Bad Session File, Please Delete ${session} and Scan Again`
        );
        sock.logout();
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log("Connection closed, reconnecting....");
        connectToWhatsApp();
      } else if (reason === DisconnectReason.connectionLost) {
        console.log("Connection Lost from Server, reconnecting...");
        connectToWhatsApp();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(
          "Connection Replaced, Another New Session Opened, Please Close Current Session First"
        );
        sock.logout();
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(
          `Device Logged Out, Please Delete ${session} and Scan Again.`
        );
        sock.logout();
      } else if (reason === DisconnectReason.restartRequired) {
        console.log("Restart Required, Restarting...");
        connectToWhatsApp();
      } else if (reason === DisconnectReason.timedOut) {
        console.log("Connection TimedOut, Reconnecting...");
        connectToWhatsApp();
      } else {
        sock.end(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`);
      }
    } else if (connection === "open") {
      console.log(
        "🟢 Koneksi Terhubung Ke Nomer Whatsapp +" + sock.user.id.split(":")[0]
      );
    }
    if (update.qr) {
      qr = update.qr;
      updateQR("qr");
    } else if ((qr = undefined)) {
      updateQR("loading");
    } else {
      if (update.connection === "open") {
        updateQR("qrscanned");
        return;
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    //tentukan jenis pesan berbentuk text
    const pesan =
      messages[0].message &&
      messages[0].message.extendedTextMessage &&
      messages[0].message.extendedTextMessage.text
        ? messages[0].message.extendedTextMessage.text
        : messages[0].message?.conversation;

    //nowa dari pengirim pesan sebagai id
    const noWa = messages[0].key.remoteJid;
    if (!pesan) {
      console.log("Nga Ada Pesan");
    } else {
      const pesanMasuk = pesan.toLowerCase();
      if (pesanMasuk === "p") {
        sock.sendMessage(noWa, { text: "P Juga" }, { quoted: messages[0] });
      } else if (pesanMasuk === `@${sock.user.id.split(":")[0]}`) {
        sock.sendMessage(
          noWa,
          { text: "Ya? Ada Apa Mas?" },
          { quoted: messages[0] }
        );
      } else if (pesanMasuk === ".menu") {
        await handleMenuCommand(sock, messages);
      } else if (pesanMasuk === ".status") {
        await handleStatusCommand(sock, messages, noWa);
      } else if (pesanMasuk.startsWith(".jadwalpelajaran")) {
        await handleJadwalMapelCommand(sock, messages, noWa);
      } else if (pesanMasuk === ".jadwalsholat") {
        await handleJadwalSholatCommand(sock, messages, noWa);
      } else if (pesanMasuk.startsWith(".menfest")) {
        await handleMenfestCommand(sock, pesan, messages);
      } else if (pesanMasuk === ".info") {
        handleInfoCommand(sock, messages);
      } else if (pesanMasuk.startsWith(".tambahtugas")) {
        await handleTambahTugas(sock, messages, pesan);
      } else if (pesanMasuk.startsWith(".hapustugas")) {
        await handleHapusTugas(sock, messages, pesanMasuk);
      } else if (pesanMasuk.startsWith(".tugas")) {
        await handleDaftarTugas(sock, messages);
      } else if (pesanMasuk.startsWith(".daftarinfo")) {
        await handleDaftarInfo(sock, messages);
      } else if (pesanMasuk.startsWith(".infobaru")) {
        await handleInfoBaru(sock, messages, pesan);
      } else if (pesanMasuk.startsWith(".hapusinfo")) {
        await handleHapusInfo(sock, messages, pesan);
      }
    }
  });
}

//! FUNGSI SCAN WEB INTERFACE !//
const isConnected = () => {
  if (sock.user) {
    return true;
  } else {
    return false;
  }
};

io.on("connection", async (socket) => {
  soket = socket;
  // console.log(sock)
  if (qr) {
    updateQR("qr");
  } else if (isConnected) {
    updateQR("connected");
  }
});

//? FUNCTIONS

const updateQR = (data) => {
  switch (data) {
    case "qr":
      qrcode.toDataURL(qr, (err, url) => {
        soket?.emit("qr", url);
        soket?.emit("log", "QR Code received, please scan!");
      });
      break;
    case "connected":
      soket?.emit("qrstatus", "./assets/check.svg");
      soket?.emit("log", "WhatsApp terhubung!");
      break;
    case "qrscanned":
      soket?.emit("qrstatus", "./assets/check.svg");
      soket?.emit("log", "QR Code Telah discan!");
      break;
    case "loading":
      soket?.emit("qrstatus", "./assets/loader.gif");
      soket?.emit("log", "Registering QR Code , please wait!");
      break;
    default:
      break;
  }
};

server.listen(port, () => {
  console.log(`🟢 Whatsapp Websocket Dan API berjalan pada port : ${port}`);
});

connectToWhatsApp();
