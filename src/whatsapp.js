const fs = require("fs");
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");
const handleStoreCommand = require("./commands/store.js");
const { handleMenfestCommand } = require("./commands/menfest.js");
const { handleJadwalSholatCommand } = require("./commands/jadwalsholat.js");
const prisma = require("./lib/db.js");
const { handleStatusCommand } = require("./commands/status.js");
const { handleJadwalMapelCommand } = require("./commands/jadwalpelajaran.js");
const { handleInfoCommand } = require("./commands/info.js");
const socket = require("./lib/socket.js");
const { handleMenuCommand } = require("./commands/menu.js");
const {
  handleTambahTugas,
  handleHapusTugas,
  handleDaftarTugas,
} = require("./commands/tugas.js");
const fileStatus = "./src/lib/status.json";

function changeStatus(status) {
  fs.readFile(fileStatus, "utf8", (err, data) => {
    if (err) {
      console.error("Error membaca file:", err);
      return;
    }

    // Mengonversi isi file menjadi objek JavaScript
    const jsonData = JSON.parse(data);

    // Mengubah nilai umur
    jsonData.WhatsappConnect = status;

    // Mengonversi objek JavaScript kembali ke string JSON
    const jsonStringUpdated = JSON.stringify(jsonData, null, 2);

    // Menyimpan kembali hasil ke file JSON
    fs.writeFile(fileStatus, jsonStringUpdated, "utf8", (err) => {
      if (err) {
        console.error("Error menyimpan file:", err);
        return;
      }
      console.log("🟢 Koneksi Ke Whatsapp Terhubung");
    });
  });
}

async function connectToWhatsApp() {
  const sock = await socket();
  const auth = await useMultiFileAuthState("auth");
  sock.ev.on("creds.update", auth.saveCreds);
  sock.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") {
      console.log(
        "🟢 Koneksi Terhubung Ke Nomer Whatsapp +" + sock.user.id.split(":")[0]
      );
      changeStatus(true);
    }
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
    await sock.readMessages([messages[0].key]);
    //kecilkan semua pesan yang masuk lowercase
    if (!pesan) {
      console.log("Error");
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
      }
    }
  });
}

module.exports = { connectToWhatsApp };
