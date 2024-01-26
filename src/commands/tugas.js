const prisma = require("../lib/db");
const { v4: uuidv4 } = require("uuid");

const nomerAdmin = "6287714041949";
async function handleTambahTugas(sock, messages, pesanMasuk) {
  if (messages[0].key.remoteJid === `${nomerAdmin}@s.whatsapp.net`) {
    const splitCommand = pesanMasuk.split("|");

    // Menyimpan hasil pemisahan ke dalam variabel terpisah
    const mapel = splitCommand[0].replace(".tambahtugas", "") // Remove spaces
    const dikumpulkan = splitCommand[1];
    const catatan = splitCommand[2];

    const dataTugas = await prisma.tugasPelajaran.create({
      data: {
        uuid: uuidv4(),
        mataPelajaran: mapel,
        dikumpulkan: dikumpulkan,
        notes: catatan,
      },
    });

    let replyText = "*[Tugas Panel]*\n\nTugas Baru Berhasil Ditambahkan\n";
    replyText += `\n[📚]Mapel : ${mapel}\n[⏳]Dikumpulkan: ${dikumpulkan}\n[📜]Catatan : ${catatan}`;
    replyText += "\n\n-codingbot";

    sock.sendMessage(
      messages[0].key.remoteJid,
      { text: replyText },
      { quoted: messages[0] }
    );
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

    const hapusTugas = await prisma.tugasPelajaran.delete({
      where: {
        uuid: uuid,
      },
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
        { text: "[🔴] Tugas Tidak Ditemukan" },
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
    const tugas = await prisma.tugasPelajaran.findMany({
      orderBy: {
        dikumpulkan: "asc",
      },
    });
    if (tugas.length > 0) {
      let replyText = "*[Tugas Panel]*\n\n*Daftar Tugas*\n\n";
      tugas.forEach((item) => {
        replyText += `id: \n${item.uuid}\n`
        replyText += `Mapel : ${item.mataPelajaran}\n`
        replyText += `Dikumpulkan : ${item.dikumpulkan}\n`
        replyText += `Catatan : ${item.notes}\n\n`
      });
      replyText += "-codingbot"
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
  } else {
    sock.sendMessage(
      messages[0].key.remoteJid,
      { text: "[🔴] Akses Ditolak" },
      { quoted: messages[0] }
    );
  }
}

module.exports = { handleDaftarTugas, handleHapusTugas, handleTambahTugas };
