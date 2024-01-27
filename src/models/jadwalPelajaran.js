const mongoose = require("mongoose");

const jadwalPelajaranSchema = new mongoose.Schema({
  hari: String,
  mataPelajaran: String,
  ruangan: String,
  waktuMulai: String,
  waktuSelesai: String,
}, { collection: 'JadwalPelajaran' });

const JadwalPelajaran = mongoose.model(
  "JadwalPelajaran",
  jadwalPelajaranSchema
);

module.exports = JadwalPelajaran;
