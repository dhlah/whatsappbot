const mongoose = require("mongoose");

const bajuPelajaranSchema = new mongoose.Schema({
  namaBaju: String,
  hari: String,
}, { collection: 'BajuPelajaran' });

const BajuPelajaran = mongoose.model("BajuPelajaran", bajuPelajaranSchema);

module.exports = BajuPelajaran;
