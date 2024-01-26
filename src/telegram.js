const { Telegraf } = require("telegraf");
const { v4: uuidv4 } = require("uuid");
const prisma = require("./lib/db.js");

async function handleTelegramBot() {
  const bot = new Telegraf(process.env.TELEGRAMBOT_TOKEN);

  bot.command("tugas", async (ctx) => {
    try {
      const assignments = await prisma.tugasPelajaran.findMany({
        orderBy: {
          dikumpulkan: "asc",
        },
      });
      let replyText = "Daftar Tugas \n\n";
      if (assignments.length > 0) {
        assignments.forEach((item) => {
          replyText += `id: \n${item.id}\n
            Mapel: ${item.mataPelajaran}\n 
            Catatan: ${item.notes}\n
            Dikumpulkan: ${item.dikumpulkan}\n\n`;
        });
      } else {
        replyText += "[⚠] Tidak ada tugas pelajaran\n\n";
      }
      ctx.reply(replyText);
    } catch (err) {
      ctx.reply("Ada Yang Error");
      console.error(err);
    }
  });

  bot.command("tugasbaru", async (ctx) => {
    if (ctx.from.id == 6366654826) {
      try {
        const messageText = ctx.message.text.replace("/tugasbaru", "").trim();
        const [mapel, tanggal, catatan] = messageText
          .split("|")
          .map((item) => item.trim());

        if (!mapel || !tanggal || !catatan) {
          return ctx.reply(
            "Format pesan salah. Gunakan format: /tugasbaru {mapel}|{tanggal yyyy-mm-dd}|{catatan}"
          );
        }

        // Simpan ke database menggunakan Prisma
        const tugas = await prisma.tugasPelajaran.create({
          data: {
            id: uuidv4(),
            mataPelajaran: mapel,
            dikumpulkan: tanggal,
            notes: catatan,
          },
        });

        return ctx.reply(
          `Tugas berhasil ditambahkan\n\nMapel: ${tugas.mataPelajaran}\nDikumpulkan: ${tugas.dikumpulkan}\nCatatan: ${tugas.notes}`
        );
      } catch (error) {
        console.error("Error:", error);
        return ctx.reply("Terjadi kesalahan. Silakan coba lagi.");
      }
    } else {
      return ctx.reply("Kamu Tidak Memiliki Akses");
    }
  });
  // ... (kode sebelumnya) ...

  bot.command("hapustugas", async (ctx) => {
    if (ctx.from.id == 6366654826) {
      const messageId = ctx.message.message_id;
      const tugasId = ctx.message.text.replace("/hapustugas", "").trim();

      if (!tugasId) {
        return ctx.reply(
          "Format pesan salah. Gunakan format: /hapustugas {id}"
        );
      }

      try {
        const deletedTugas = await prisma.tugasPelajaran.delete({
          where: {
            id: tugasId,
          },
        });

        if (deletedTugas) {
          return ctx.reply(`Tugas dengan ID ${tugasId} berhasil dihapus.`);
        } else {
          return ctx.reply(`Tugas dengan ID ${tugasId} tidak ditemukan.`);
        }
      } catch (error) {
        console.error("Error:", error);
        return ctx.reply("Terjadi kesalahan. Silakan coba lagi.");
      }
    } else {
      return ctx.reply("Kamu Tidak Memiliki Akses"); 
    }
  });

  bot.launch().then(() => console.log("🟢 Telegram Bot Terhubung"));
}

module.exports = handleTelegramBot;
