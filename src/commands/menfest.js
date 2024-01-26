async function handleMenfestCommand(sock, pesanMasuk, messages) {
  // Check if the incoming message contains the ".menfest" command
  const splitCommand = pesanMasuk.split("|");

  // Menyimpan hasil pemisahan ke dalam variabel terpisah
  const nomerWa = splitCommand[0].replace(".menfest", "").replace(/\s/g, ""); // Remove spaces
  const pesanText = splitCommand[1];
  const dari = splitCommand[2];

  if (nomerWa && pesanText) {
    const fromName = dari || "No Name";
    // Membuat pesan yang akan dikirim
    const replyText = `[📬] *Ada Yang Mengirim Anda Pesan*\n\nPesan: \n${pesanText}\n\n*Dari: ${fromName}*`;

    // Mengirim pesan ke nomerWa
    await sock.sendMessage(`${nomerWa}@s.whatsapp.net`, { text: replyText });

    // Memberi informasi bahwa pesan telah terkirim
    await sock.sendMessage(
      messages[0].key.remoteJid,
      {
        text: `[🟢] *Pesan Anonim telah terkirim* \n\nNomer Tujuan: ${nomerWa}\n\nIsi Pesan: \n${pesanText}`,
      },
      { quoted: messages[0] }
    );
  } else {
    // Memberi informasi jika format pesan tidak sesuai
    await sock.sendMessage(
      messages[0].key.remoteJid,
      {
        text: `[🔴] Format pesan tidak sesuai. Gunakan format: .menfest nomerWa(62812345678)|pesan(Aku Ganteng)|dari(Orang Keren)`,
      },
      { quoted: messages[0] }
    );
  }
}

module.exports = { handleMenfestCommand };
