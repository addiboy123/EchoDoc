// models/Pdf.js
const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema(
  {
    pdf_link: { type: String, required: true },
    audio_link: { type: String, required: true },
    pdf_name: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pdf', pdfSchema);
