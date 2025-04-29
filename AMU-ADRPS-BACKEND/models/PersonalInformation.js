// models/PersonalInformation.js
const mongoose = require("mongoose");

const personalInformationSchema = new mongoose.Schema({
  englishName: { type: String, required: true },
  amharicName: { type: String, required: true },
  idNo: { type: String, required: true },
  department: { type: String, required: true },
  faculty: { type: String, required: true },
  program: { type: String, required: true },
  isEnrolled: { type: Boolean, required: true },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PersonalInformation", personalInformationSchema);