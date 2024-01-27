const mongoose = require("mongoose");

const tugasSchema = new mongoose.Schema({
  uuid: String,
  mataPelajaran: String,
  dikumpulkan: String,
  notes: String,
}, { collection: 'TugasPelajaran' });

module.exports = mongoose.model("TugasPelajaran", tugasSchema);
