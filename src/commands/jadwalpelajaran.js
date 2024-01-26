const moment = require("moment");
const prisma = require("../lib/db.js");

async function getJadwalPelajaran(hari) {
  try {
    if (hari) {
      // Jika hari ditentukan, cari jadwal berdasarkan hari tersebut
      const jadwal = await prisma.jadwalPelajaran.findMany({
        where: {
          hari: hari.toLowerCase(),
        },
        orderBy: {
            waktuMulai: "asc",
        },
      });
      return jadwal;
    } else {
      // Jika tidak ada hari yang ditentukan, ambil jadwal hari ini
      const hariIni = moment().locale("id").format("dddd").toLowerCase();
      const jadwalHariIni = await prisma.jadwalPelajaran.findMany({
        where: {
          hari: hariIni,
        },
        orderBy: {
            waktuMulai: "asc",
        },
      });
      return jadwalHariIni;
    }
  } catch (error) {
    console.error("Error fetching jadwal pelajaran:", error);
    return null;
  }
}

async function handleJadwalMapelCommand(sock, messages, noWA) {
  const commandArgs = messages[0].message.conversation.split(" "); // Memisahkan kata dalam pesan
  const hariInput =
    commandArgs.length > 1 ? commandArgs[1].toLowerCase() : null; // Mengambil hari jika ada, atau null jika tidak ada

  const jadwal = await getJadwalPelajaran(hariInput);

  if (jadwal && jadwal.length > 0) {
    let replyText = "";
    if (hariInput) {
      // Jika mencari berdasarkan hari tertentu
      replyText += `*Jadwal Pelajaran Hari ${
        hariInput.charAt(0).toUpperCase() + hariInput.slice(1)
      }*\n\n`;
    } else {
      // Jika mencari jadwal hari ini
      const hariIni = moment().locale("id").format("dddd");
      replyText += `*Jadwal Pelajaran Hari Ini (${hariIni})*\n\n`;
    }

    for (const pelajaran of jadwal) {
      replyText += `${pelajaran.mataPelajaran} - ${pelajaran.waktuMulai} - ${pelajaran.waktuSelesai}\n`;
    }

    await sock.sendMessage(
      messages[0].key.remoteJid,
      { text: replyText },
      { quoted: messages[0] }
    );
  } else {
    await sock.sendMessage(
      messages[0].key.remoteJid,
      { text: `[🔴] Tidak Ada Pelajaran Pada Hari Yang Kamu Cari` },
      { quoted: messages[0] }
    );
  }
}

module.exports = { handleJadwalMapelCommand };
