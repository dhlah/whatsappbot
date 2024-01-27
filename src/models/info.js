const mongoose = require("mongoose");

const infoSchema = new mongoose.Schema({
  uuid: String,
  title: String,
  content: String,
  infotime: Date,
}, { collection: 'Info' });

module.exports = mongoose.model("Info", infoSchema);
