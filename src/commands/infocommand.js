const Info = require("../models/info"); // Assuming you have defined Mongoose model for 'Info'
const { v4: uuidv4 } = require("uuid");

const nomerAdmin = "628811957071";

async function handleInfoBaru(sock, messages, pesanMasuk) {
  if (messages[0].key.remoteJid === `${nomerAdmin}@s.whatsapp.net`) {
    const splitCommand = pesanMasuk.split("|");

    const title = splitCommand[0].replace(".infobaru", "").trim();
    const content = splitCommand[1].trim();
    const infotime = splitCommand[2].trim();

    if (title && content && infotime) {
      try {
        const dataInfo = await Info.create({
          uuid: uuidv4(),
          title: title,
          content: content,
          infotime: infotime,
        });

        let replyText = "*[Info Panel]*\n\nInfo Baru Berhasil Ditambahkan\n";
        replyText += `\n[🗂]Judul : ${dataInfo.title}\n[📜]Catatan: ${dataInfo.content}\n[⏳]Saat : ${dataInfo.infotime}`;
        replyText += "\n\n-codingbot";

        sock.sendMessage(
          messages[0].key.remoteJid,
          { text: replyText },
          { quoted: messages[0] }
        );
      } catch (error) {
        console.error("Error adding info:", error);
        sock.sendMessage(
          messages[0].key.remoteJid,
          {
            text: "*[Info Panel]*\n\n[🔴] Terjadi kesalahan saat menambahkan info baru.",
          },
          { quoted: messages[0] }
        );
      }
    } else {
      sock.sendMessage(
        messages[0].key.remoteJid,
        {
          text: "*[Info Panel]*\n\n[🔴] Format Tidak Sesuai\n\nGunakan Format: \n*.infobaru judul|deskripsi|waktu[tahun{yyyy}-bulan{mm}-hari{dd}]*\n\nContoh: \n.infobaru Razia Rambut|Nga Dicukur dicukur sama kesiswaan|2024-02-01\n\n-codingbot",
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

async function handleHapusInfo(sock, messages, pesanMasuk) {
  if (messages[0].key.remoteJid === `${nomerAdmin}@s.whatsapp.net`) {
    const uuid = pesanMasuk.replace(".hapusinfo", "").replace(/\s/g, "");
    if (uuid) {
      try {
        const hapusInfo = await Info.deleteOne({ uuid: uuid });
        if (hapusInfo.deletedCount > 0) {
          let replyText = "*[Info Panel]*\n";
          replyText += `\n[🟢] Info dengan ID ${uuid}, Sudah Dihapus`;
          sock.sendMessage(
            messages[0].key.remoteJid,
            { text: replyText },
            { quoted: messages[0] }
          );
        } else {
          sock.sendMessage(
            messages[0].key.remoteJid,
            { text: "*[Info Panel]*\n\n[🔴] Info Tidak Ditemukan" },
            { quoted: messages[0] }
          );
        }
      } catch (error) {
        console.error("Error deleting info:", error);
        sock.sendMessage(
          messages[0].key.remoteJid,
          {
            text: "*[Info Panel]*\n\n[🔴] Terjadi kesalahan saat menghapus info.",
          },
          { quoted: messages[0] }
        );
      }
    } else {
      sock.sendMessage(
        messages[0].key.remoteJid,
        { text: "*[Info Panel]*\n\n[🔴] Info Tidak Ditemukan" },
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

async function handleDaftarInfo(sock, messages) {
  if (messages[0].key.remoteJid === `${nomerAdmin}@s.whatsapp.net`) {
    try {
      const info = await Info.find().sort({ infotime: 1 });
      if (info.length > 0) {
        let replyText = "*[Info Panel]*\n\n*Daftar Info*\n\n";
        info.forEach((item) => {
          replyText += `id: \n${item.uuid}\n`;
          replyText += `Judul : ${item.title}\n`;
          replyText += `Catatan : ${item.content}\n`;
          replyText += `Waktu : ${item.infotime}\n\n`;
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
          { text: "[🔴] Tidak Ada Info Ditemukan Di Database" },
          { quoted: messages[0] }
        );
      }
    } catch (error) {
      console.error("Error fetching info:", error);
      sock.sendMessage(
        messages[0].key.remoteJid,
        {
          text: "*[Info Panel]*\n\n[🔴] Terjadi kesalahan saat mengambil info.",
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

module.exports = { handleDaftarInfo, handleHapusInfo, handleInfoBaru };
