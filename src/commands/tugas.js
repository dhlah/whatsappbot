const { v4: uuidv4 } = require("uuid");
const TugasModel = require("../models/tugas"); // Assume you have defined Mongoose model for 'tugas'

const nomerAdmin = "6287714041949"

async function handleTambahTugas(sock, messages, pesanMasuk) {
  if (messages[0].key.remoteJid === `${nomerAdmin}@s.whatsapp.net`) {
    const splitCommand = pesanMasuk.split("|");

    // Menyimpan hasil pemisahan ke dalam variabel terpisah
    const mapel = splitCommand[0].replace(".tambahtugas", ""); // Remove spaces
    const dikumpulkan = splitCommand[1];
    const catatan = splitCommand[2];
    if (mapel && dikumpulkan && catatan) {
      try {
        const dataTugas = await TugasModel.create({
          uuid: uuidv4(),
          mataPelajaran: mapel,
          dikumpulkan: dikumpulkan,
          notes: catatan,
        });

        let replyText = "*[Tugas Panel]*\n\nTugas Baru Berhasil Ditambahkan\n";
        replyText += `\n[📚]Mapel : ${mapel}\n[⏳]Dikumpulkan: ${dikumpulkan}\n[📜]Catatan : ${catatan}`;
        replyText += "\n\n-codingbot";

        sock.sendMessage(
          messages[0].key.remoteJid,
          { text: replyText },
          { quoted: messages[0] }
        );
      } catch (error) {
        console.error("Error in creating task:", error);
        sock.sendMessage(
          messages[0].key.remoteJid,
          {
            text: "*[Tugas Panel]*\n\n[🔴] Terjadi kesalahan saat menambahkan tugas",
          },
          { quoted: messages[0] }
        );
      }
    } else {
      sock.sendMessage(
        messages[0].key.remoteJid,
        {
          text: "*[Tugas Panel]*\n\n[🔴] Format Tidak Sesuai\n\nGunakan Format: \n*.tambahtugas Mapel|Dikumpulkan[tahun{yyyy}-bulan{mm}-hari{dd}]|Catatan*\n\nContoh: \n.tambahtugas Bahasa Indonesia|2024-02-01|Membuat Cerpen\n\n-codingbot",
        },
        { quoted: messages[0] }
      );
    }
  } else {
    sock.sendMessage(
      messages[0].key.remoteJid,
      { text: "[🔴] Akses Ditolak" },
      { quoted: messages[0] }
    );
  }
}
async function handleHapusTugas(sock, messages, pesanMasuk) {
  if (messages[0].key.remoteJid === `${nomerAdmin}@s.whatsapp.net`) {
    const uuid = pesanMasuk.replace(".hapustugas", "").replace(/\s/g, "");
    if (uuid) {
      try {
        const hapusTugas = await TugasModel.findOneAndDelete({
          uuid: uuid,
        });
        if (hapusTugas) {
          let replyText = "*[Tugas Panel]*\n";
          replyText += `\n[🟢]Tugas ${hapusTugas.mataPelajaran}, Sudah Dihapus`;
          sock.sendMessage(
            messages[0].key.remoteJid,
            { text: replyText },
            { quoted: messages[0] }
          );
        } else {
          sock.sendMessage(
            messages[0].key.remoteJid,
            { text: "*[Tugas Panel]*\n\n[🔴] Tugas Tidak Ditemukan" },
            { quoted: messages[0] }
          );
        }
      } catch (err) {
        sock.sendMessage(
          messages[0].key.remoteJid,
          { text: "*[Tugas Panel]*\n\n[🔴] Tugas Tidak Ditemukan" },
          { quoted: messages[0] }
        );
      }
    } else {
      sock.sendMessage(
        messages[0].key.remoteJid,
        { text: "*[Tugas Panel]*\n\n[🔴] Tugas Tidak Ditemukan" },
        { quoted: messages[0] }
      );
    }
  } else {
    sock.sendMessage(
      messages[0].key.remoteJid,
      { text: "[🔴] Akses Ditolak" },
      { quoted: messages[0] }
    );
  }
}

async function handleDaftarTugas(sock, messages) {
  if (messages[0].key.remoteJid === `${nomerAdmin}@s.whatsapp.net`) {
    try {
      const tugas = await TugasModel.find().sort({ dikumpulkan: "asc" });
      if (tugas.length > 0) {
        let replyText = "*[Tugas Panel]*\n\n*Daftar Tugas*\n\n";
        tugas.forEach((item) => {
          replyText += `id: \n${item.uuid}\n`;
          replyText += `Mapel : ${item.mataPelajaran}\n`;
          replyText += `Dikumpulkan : ${item.dikumpulkan}\n`;
          replyText += `Catatan : ${item.notes}\n\n`;
        });
        replyText += "-codingbot";
        sock.sendMessage(
          messages[0].key.remoteJid,
          { text: replyText },
          { quoted: messages[0] }
        );
      } else {
        sock.sendMessage(
          messages[0].key.remoteJid,
          { text: "[🔴] Tidak Ada Tugas Ditemukan DI Database" },
          { quoted: messages[0] }
        );
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      sock.sendMessage(
        messages[0].key.remoteJid,
        { text: "[🔴] Terjadi kesalahan saat mengambil daftar tugas." },
        { quoted: messages[0] }
      );
    }
  } else {
    sock.sendMessage(
      messages[0].key.remoteJid,
      { text: "[🔴] Akses Ditolak" },
      { quoted: messages[0] }
    );
  }
}

module.exports = { handleDaftarTugas, handleHapusTugas, handleTambahTugas };
