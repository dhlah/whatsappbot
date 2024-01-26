const moment = require("moment-timezone");
const prisma = require("../lib/db.js");

// Function to convert English day name to Indonesian
function convertToIndonesianDayName(englishDayName) {
  const dayNameMapping = {
    monday: "Senin",
    tuesday: "Selasa",
    wednesday: "Rabu",
    thursday: "Kamis",
    friday: "Jumat",
    saturday: "Sabtu",
    sunday: "Minggu",
  };

  return dayNameMapping[englishDayName.toLowerCase()] || englishDayName;
}

async function handleInfoCommand(sock, messages) {
  // Set the timezone to Indonesia/Jakarta
  moment.tz.setDefault("Asia/Jakarta");

  // Get tomorrow's day using moment
  const tomorrow = moment().add(1, "day");
  const tomorrowFormatted = tomorrow.format("YYYY-MM-DD");
  const harikedua = moment().add(2, "day").format("YYYY-MM-DD");
  const hariketiga = moment().add(3, "day").format("YYYY-MM-DD");
  const indonesianDayName = convertToIndonesianDayName(tomorrow.format("dddd"));
  const yesterday = moment().subtract(1, "day");
  const yesterdayFormated = yesterday.format("YYYY-MM-DD");

  try {
    //delete yesterday data

    const deletedTugas = await prisma.tugasPelajaran.deleteMany({
      where: {
        dikumpulkan: yesterdayFormated,
      },
    });

    const deletedInfo = await prisma.info.deleteMany({
      where: {
        infotime: yesterdayFormated,
      },
    });

    // Query the database for tomorrow's schedule
    const schedule = await prisma.jadwalPelajaran.findMany({
      where: {
        hari: indonesianDayName.toLowerCase(),
      },
      select: {
        mataPelajaran: true,
      },
      orderBy: {
        waktuMulai: "asc",
      },
    });

    // Query the database for tomorrow's assignments
    const tugasharibesok = await prisma.tugasPelajaran.findMany({
      where: {
        dikumpulkan: tomorrowFormatted,
      },
      select: {
        mataPelajaran: true,
        dikumpulkan: true,
        notes: true,
      },
    });
    const tugasharikedua = await prisma.tugasPelajaran.findMany({
      where: {
        dikumpulkan: harikedua,
      },
      select: {
        mataPelajaran: true,
        dikumpulkan: true,
        notes: true,
      },
    });
    const tugashariketiga = await prisma.tugasPelajaran.findMany({
      where: {
        dikumpulkan: hariketiga,
      },
      select: {
        mataPelajaran: true,
        dikumpulkan: true,
        notes: true,
      },
    });

    const assignments = [
      ...tugasharibesok,
      ...tugasharikedua,
      ...tugashariketiga,
    ];

    // Query the database for tomorrow's additional info
    const additionalInfo = await prisma.info.findMany({
      where: {
        infotime: tomorrowFormatted,
      },
      select: {
        title: true,
        content: true,
      },
    });

    const bajuPelajaran = await prisma.bajuPelajaran.findMany({
      where: {
        hari: indonesianDayName.toLowerCase(),
      },
      select: {
        namaBaju: true,
      },
    });

    // Build the message content
    let replyText = `*Informasi Untuk ${indonesianDayName}, ${tomorrow.format(
      "MMMM DD, YYYY"
    )}*\n\n`;

    //handle baju dipakai
    replyText += "*[👔] Baju Yang Dipakai* : \n\n";
    if (bajuPelajaran.length > 0) {
      bajuPelajaran.forEach((item) => {
        replyText += `■ ${item.namaBaju}\n`;
      });
    } else {
      replyText += "[⚠] Tidak ada Baju Yang Dipakai Hari Ini. \n";
    }
    replyText += "\n";

    // Handle Jadwal Pelajaran
    replyText += "*[🗂] Mapel* : \n\n";
    if (schedule.length > 0) {
      schedule.forEach((item) => {
        replyText += `■ ${item.mataPelajaran}\n`;
      });
      replyText += "\n";
    } else {
      replyText += "[⚠] Tidak ada jadwal pelajaran untuk hari ini. \n\n";
    }
    replyText += "*[📚] Tugas* : \n\n";
    // Handle Tugas Pelajaran
    if (assignments.length > 0) {
      assignments.forEach((item) => {
        replyText += `■ ${item.mataPelajaran}, ${item.notes}, \nDikumpulkan: ${item.dikumpulkan}\n\n`;
      });
    } else {
      replyText += "[⚠] Tidak ada tugas pelajaran untuk hari ini. \n\n";
    }
    replyText += "*[📜] Info* : \n\n";
    // Handle Additional Info
    if (additionalInfo.length > 0) {
      additionalInfo.forEach((item) => {
        replyText += `■ ${item.title}, ${item.content}\n`;
      });
    } else {
      replyText += "[⚠] Tidak ada informasi tambahan untuk hari ini. \n";
    }

    replyText += "\n-codingbot";
    // Send the message
    console.log(messages[0].key.remoteJid);
    await sock.sendMessage(
      messages[0].key.remoteJid,
      { text: replyText },
      { quoted: messages[0] }
    );
  } catch (error) {
    console.error("Error fetching info:", error);
    await sock.sendMessage(
      messages[0].key.remoteJid,
      { text: "Terjadi kesalahan saat mengambil informasi." },
      { quoted: messages[0] }
    );
  }
}

module.exports = { handleInfoCommand };
