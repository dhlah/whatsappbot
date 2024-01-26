async function handleMenuCommand(sock, messages) {
  if (messages[0].key.remoteJid === "6287714041949@s.whatsapp.net") {
    let replyText = "Halo, Bang\n";
    replyText += "*Daftar Perintah* : \n\n";
    replyText += "• .menu\n"
    replyText += "• .info\n"
    replyText += "• .jadwalpelajaran\n"
    replyText += "• .jadwalsholat\n"
    replyText += "• .status\n"
    replyText += "\n*Daftar Perintah Admin* : \n\n";
    replyText += "• .tambahtugas\n"
    replyText += "• .hapustugas\n"
    replyText += "• .daftartugas\n"
    replyText += "\n-codingbot"
    sock.sendMessage(
        messages[0].key.remoteJid,
        { text: replyText },
        { quoted: messages[0] }
      );
  } else {
    sock.sendMessage(
      messages[0].key.remoteJid,
      { text: "Akses Ditolak" },
      { quoted: messages[0] }
    );
  }
}

module.exports = { handleMenuCommand };
