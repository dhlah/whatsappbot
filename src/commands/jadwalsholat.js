const axios = require("axios");

async function getJadwalSholat() {
  const sekarang = new Date();

  const tanggal = sekarang.getDate();
  const bulan = sekarang.getMonth() + 1;
  const tahun = sekarang.getFullYear();

  try {
    const response = await axios.get(
      `https://api.myquran.com/v2/sholat/jadwal/1210/${tahun}/${bulan}/${tanggal}`
    );

    return response.data.data.jadwal;
  } catch (error) {
    console.error("Error fetching prayer schedule:", error);
    return null;
  }
}


async function handleJadwalSholatCommand(sock, messages, noWA) {
  const jadwalSholat = await getJadwalSholat();
  const currentTime = new Date().toLocaleTimeString();

  if (jadwalSholat) {
    const {
      tanggal,
      imsak,
      subuh,
      terbit,
      dhuha,
      dzuhur,
      ashar,
      maghrib,
      isya,
    } = jadwalSholat;

    const replyText = `*Jadwal Sholat*\nKota Karawang\n\n[🕓] Tanggal : ${tanggal}\n[⏳] Jam : ${currentTime}\n\n[🌅] Imsak : ${imsak}\n[🌄] Subuh : ${subuh}\n[🌞] Terbit : ${terbit}\n[🌇] Dhuha : ${dhuha}\n[☀️] Dzuhur : ${dzuhur}\n[🌅] Ashar : ${ashar}\n[🌆] Maghrib : ${maghrib}\n[🌙] Isya : ${isya}`;

    await sock.sendMessage(
      messages[0].key.remoteJid,
      { text: replyText },
      { quoted: messages[0] }
    );
  } else {
    // Handle error jika gagal mendapatkan jadwal sholat
    console.error("Gagal mendapatkan jadwal sholat.");
  }
}

module.exports = { handleJadwalSholatCommand };
