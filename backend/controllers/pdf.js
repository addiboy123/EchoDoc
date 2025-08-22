// controllers/pdf.js
const axios = require('axios');
const pdfParse = require('pdf-parse');
const Pdf = require('../models/Pdf');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');


const KOKORO_BASE_URL = process.env.KOKORO_BASE_URL;
const KOKORO_API_KEY = process.env.KOKORO_API_KEY; 

// ----- helpers -----
async function fetchArrayBuffer(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  return res.data; // Buffer
}

async function uploadBufferToCloudinary(buffer, folder, publicIdExt = 'mp3') {
  // Cloudinary upload from buffer (no temp file)
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { resource_type: 'video', folder, format: publicIdExt },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    upload.end(buffer);
  });
}

async function ttsWithKokoro(text) {
  try {
    const response = await axios.post(
      `${KOKORO_BASE_URL}/api/v1/audio/speech`, // Fixed: Added /api/v1 prefix
      {
        model: "model_q8f16",        // Fixed: Correct model name from docs
        voice: "af_heart",           // This should work
        input: text,
        response_format: "mp3",      // Optional: specify format
      },
      {
        headers: {
          Authorization: `Bearer ${KOKORO_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    return response.data;
  } catch (err) {
    console.error("Kokoro TTS error:");
    console.error("Status:", err.response?.status);
    console.error("Status Text:", err.response?.statusText);
    
    // Convert buffer to string to see the actual error message
    if (err.response?.data) {
      try {
        const errorMessage = Buffer.from(err.response.data).toString('utf8');
        console.error("Error Message:", errorMessage);
      } catch (parseErr) {
        console.error("Could not parse error message:", parseErr);
      }
    }
    
    throw err;
  }
}

// =============================================
// ============== CONTROLLERS ==================
// =============================================

// POST /api/pdf
// Body: { pdf_link, pdf_name, userId? }  (userId optional if using req.user.userId)
const createPdf = async (req, res) => {
  try {
    const { pdf_link, pdf_name } = req.body;
    const userId = req.user?.userId || req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required (or provide via auth middleware)' });
    }
    if (!pdf_link || !pdf_name) {
      return res.status(400).json({ message: 'pdf_link and pdf_name are required' });
    }

    // 1) download pdf
    const pdfBuffer = await fetchArrayBuffer(pdf_link);

    // 2) extract text
    const parsed = await pdfParse(pdfBuffer);
    const text = (parsed.text || '').trim();
    if (!text) return res.status(400).json({ message: 'No extractable text found in PDF' });

    // 3) TTS with Kokoro
    const audioBuffer = await ttsWithKokoro(text);

    // 4) Upload audio to Cloudinary
    const audioUpload = await uploadBufferToCloudinary(audioBuffer, 'pdf_audio', 'mp3');

    // 5) Save in DB
    const pdfDoc = await Pdf.create({
      pdf_link,
      audio_link: audioUpload.secure_url,
      pdf_name,
    });

    // 6) Link to user
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { pdfs: pdfDoc._id } },
      { new: true }
    );

    return res.status(201).json({ message: 'PDF processed', pdf: pdfDoc });
  } catch (err) {
    console.error('createPdf error:', err);
    return res.status(500).json({ message: 'Error processing PDF', error: err.message });
  }
};

// GET /api/pdf?userId=...
// Returns all PDFs of the provided user
const getAllPdf = async (req, res) => {
  try {
    const userId = req.user?.userId || req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required (or provide via auth middleware)' });
    }

    const user = await User.findById(userId).select('pdfs');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const pdfs = await Pdf.find({ _id: { $in: user.pdfs } }).sort({ createdAt: -1 });
    return res.status(200).json(pdfs);
  } catch (err) {
    console.error('getAllPdf error:', err);
    return res.status(500).json({ message: 'Error fetching PDFs', error: err.message });
  }
};

// GET /api/pdf/:id
// Fetch a single PDF by its PDF document _id
const getPdfById = async (req, res) => {
  try {
    const { id } = req.params;
    const pdf = await Pdf.findById(id);
    if (!pdf) return res.status(404).json({ message: 'PDF not found' });
    return res.status(200).json(pdf);
  } catch (err) {
    console.error('getPdfById error:', err);
    return res.status(500).json({ message: 'Error fetching PDF', error: err.message });
  }
};

// DELETE /api/pdf/:id
// Delete a PDF by its _id and pull it from the user’s pdfs list (if provided)
const deletePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || req.query.userId || req.body.userId;

    const pdf = await Pdf.findByIdAndDelete(id);
    if (!pdf) return res.status(404).json({ message: 'PDF not found' });

    if (userId) {
      await User.findByIdAndUpdate(userId, { $pull: { pdfs: id } });
    }

    return res.status(200).json({ message: 'PDF deleted successfully' });
  } catch (err) {
    console.error('deletePdf error:', err);
    return res.status(500).json({ message: 'Error deleting PDF', error: err.message });
  }
};

// PATCH /api/pdf/:id
// Body: { pdf_link, pdf_name? } -> re-extracts text, regenerates speech, uploads, updates links & name
const updatePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const { pdf_link, pdf_name } = req.body;

    if (!pdf_link) {
      return res.status(400).json({ message: 'pdf_link is required to update the resume' });
    }

    // 1) Download new PDF
    const newPdfBuffer = await fetchArrayBuffer(pdf_link);

    // 2) Extract text
    const parsed = await pdfParse(newPdfBuffer);
    const text = (parsed.text || '').trim();
    if (!text) return res.status(400).json({ message: 'No extractable text found in the new PDF' });

    // 3) TTS
    const audioBuffer = await ttsWithKokoro(text);

    // 4) Upload audio
    const audioUpload = await uploadBufferToCloudinary(audioBuffer, 'pdf_audio', 'mp3');

    // 5) Update DB doc
    const updatePayload = {
      pdf_link,
      audio_link: audioUpload.secure_url,
    };
    if (pdf_name) updatePayload.pdf_name = pdf_name;

    const updated = await Pdf.findByIdAndUpdate(id, updatePayload, { new: true });
    if (!updated) return res.status(404).json({ message: 'PDF not found' });

    return res.status(200).json({ message: 'PDF updated successfully', pdf: updated });
  } catch (err) {
    console.error('updatePdf error:', err);
    return res.status(500).json({ message: 'Error updating PDF', error: err.message });
  }
};

module.exports = {
  createPdf,
  getAllPdf,
  getPdfById,
  deletePdf,
  updatePdf,
};
