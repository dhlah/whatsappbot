const { PrismaClient } = require('@prisma/client');
const fs = require('fs')

const fileStatus = "./src/lib/status.json";
function changeStatus(status) {
  fs.readFile(fileStatus, "utf8", (err, data) => {
    if (err) {
      console.error("Error membaca file:", err);
      return;
    }

    // Mengonversi isi file menjadi objek JavaScript
    const jsonData = JSON.parse(data);

    // Mengubah nilai umur
    jsonData.DatabaseConnect = status;

    // Mengonversi objek JavaScript kembali ke string JSON
    const jsonStringUpdated = JSON.stringify(jsonData, null, 2);

    // Menyimpan kembali hasil ke file JSON
    fs.writeFile(fileStatus, jsonStringUpdated, "utf8", (err) => {
      if (err) {
        console.error("Error menyimpan file:", err);
        return;
      }
      console.log("🟢 Database Sudah Terhubung");
    });
  });
}

const prismaClientSingleton = () => {
  changeStatus(true)
  return new PrismaClient();
};

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || prismaClientSingleton();

module.exports = prisma;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma
