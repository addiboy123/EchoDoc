const express = require('express')
const router = express.Router()
const { updatePdf,getPdfById,getAllPdf,deletePdf,createPdf } = require('../controllers/pdf')
router.route('/').post(createPdf).get(getAllPdf)
router.route('/:id').patch(updatePdf).delete(deletePdf).get(getPdfById)


module.exports = router