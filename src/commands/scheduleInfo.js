const moment = require("moment-timezone");
const JadwalPelajaran = require("../models/jadwalPelajaran"); // Assume you have defined Mongoose model for 'JadwalPelajaran'
const TugasPelajaran = require("../models/tugas"); // Assume you have defined Mongoose model for 'TugasPelajaran'
const Info = require("../models/info"); // Assume you have defined Mongoose model for 'Info'
const BajuPelajaran = require("../models/baju"); // Assume you have defined Mongoose model for 'BajuPelajaran'

const grupWhatsapp = "120363024197079611@g.us";

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

async function handleScheduleInfo(sock) {
  moment.tz.setDefault("Asia/Jakarta");

  const tomorrow = moment().add(1, "day");
  const tomorrowFormatted = tomorrow.format("YYYY-MM-DD");
  const harikedua = moment().add(2, "day").format("YYYY-MM-DD");
  const hariketiga = moment().add(3, "day").format("YYYY-MM-DD");
  const indonesianDayName = convertToIndonesianDayName(tomorrow.format("dddd"));
  const yesterday = moment().subtract(1, "day");
  const yesterdayFormated = yesterday.format("YYYY-MM-DD");

  try {
    const deletedTugas = await TugasPelajaran.deleteMany({
      dikumpulkan: yesterdayFormated,
    });

    const deletedInfo = await Info.deleteMany({
      infotime: yesterdayFormated,
    });

    const schedule = await JadwalPelajaran.find({
      hari: indonesianDayName.toLowerCase(),
    })
      .select("mataPelajaran")
      .sort({ waktuMulai: "asc" });

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

    const additionalInfo = await Info.find({
      infotime: tomorrowFormatted,
    }).select("title content");

    const bajuPelajaran = await BajuPelajaran.find({
      hari: indonesianDayName.toLowerCase(),
    }).select("namaBaju");

    let replyText = `*Informasi Untuk ${indonesianDayName}, ${tomorrow.format(
      "MMMM DD, YYYY"
    )}*\n\n`;

    replyText += "*[👔] Baju Yang Dipakai* : \n\n";
    if (bajuPelajaran.length > 0) {
      bajuPelajaran.forEach((item) => {
        replyText += `■ ${item.namaBaju}\n`;
      });
    } else {
      replyText += "[⚠] Tidak ada Baju Yang Dipakai Hari Ini. \n";
    }
    replyText += "\n";

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
    if (assignments.length > 0) {
      assignments.forEach((item) => {
        replyText += `■ ${item.mataPelajaran}, ${item.notes}, \nDikumpulkan: ${item.dikumpulkan}\n\n`;
      });
    } else {
      replyText += "[⚠] Tidak ada tugas pelajaran untuk hari ini. \n\n";
    }
    replyText += "*[📜] Info* : \n\n";
    if (additionalInfo.length > 0) {
      additionalInfo.forEach((item) => {
        replyText += `■ ${item.title}, ${item.content}\n`;
      });
    } else {
      replyText += "[⚠] Tidak ada informasi tambahan untuk hari ini. \n";
    }

    replyText += "\n-codingbot";

    await sock.sendMessage(grupWhatsapp, { text: replyText });
  } catch (error) {
    console.error("Error fetching info:", error);
    await sock.sendMessage(grupWhatsapp, {
      text: "Terjadi kesalahan saat mengambil informasi.",
    });
  }
}

module.exports = { handleScheduleInfo };
