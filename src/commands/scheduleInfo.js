const moment = require("moment-timezone");
const JadwalPelajaran = require("../models/jadwalPelajaran");
const TugasPelajaran = require("../models/tugas");
const Info = require("../models/info");
const BajuPelajaran = require("../models/baju");

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

const grupWa = "120363024197079611@g.us";

async function handleInfoCommand(sock) {
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
    // Delete yesterday's data
    await TugasPelajaran.deleteMany({ dikumpulkan: yesterdayFormated });
    await Info.deleteMany({ infotime: yesterdayFormated });

    // Query the database for tomorrow's schedule
    const schedule = await JadwalPelajaran.find({
      hari: indonesianDayName.toLowerCase(),
    })
      .select("mataPelajaran")
      .sort({ waktuMulai: "asc" });

    // Query the database for tomorrow's assignments
    const tugasharibesok = await TugasPelajaran.find({
      dikumpulkan: tomorrowFormatted,
    }).select("mataPelajaran dikumpulkan notes");
    const tugasharikedua = await TugasPelajaran.find({
      dikumpulkan: harikedua,
    }).select("mataPelajaran dikumpulkan notes");
    const tugashariketiga = await TugasPelajaran.find({
      dikumpulkan: hariketiga,
    }).select("mataPelajaran dikumpulkan notes");
    const assignments = [
      ...tugasharibesok,
      ...tugasharikedua,
      ...tugashariketiga,
    ];

    // Query the database for tomorrow's additional info
    const additionalInfo = await Info.find({
      infotime: tomorrowFormatted,
    }).select("title content");

    const bajuPelajaran = await BajuPelajaran.find({
      hari: indonesianDayName.toLowerCase(),
    }).select("namaBaju");

    // Build the message content
    let replyText = `*Informasi Untuk ${indonesianDayName}, ${tomorrow.format(
      "MMMM DD, YYYY"
    )}*\n\n`;

    // Handle baju dipakai
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

    await sock.sendMessage(grupWa, { text: replyText });
  } catch (error) {
    console.error("Error fetching info:", error);
    await sock.sendMessage(grupWa, {
      text: "Terjadi kesalahan saat mengambil informasi.",
    });
  }
}

module.exports = { handleInfoCommand };
