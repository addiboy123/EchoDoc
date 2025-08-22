// src/components/UploadForm.jsx

import React, { useState } from 'react';
// We still use our configured 'api' instance for calls to our own backend
import api from '../api/axios'; 

const UploadForm = ({ onUploadSuccess }) => {
    const [pdfName, setPdfName] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [status, setStatus] = useState({ message: '', type: '' });
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pdfFile || !pdfName) {
            setStatus({ message: 'Please provide both a name and a PDF file.', type: 'error' });
            return;
        }

        setIsUploading(true);
        setStatus({ message: 'Step 1/2: Uploading PDF to secure storage...', type: 'info' });

        try {
            // --- UPDATED CLOUDINARY UPLOAD LOGIC ---
            const formData = new FormData();
            formData.append('file', pdfFile);
            formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
            
            // Use fetch for the Cloudinary upload
            const response = await fetch(cloudinaryUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Cloudinary upload failed.');
            }

            const cloudinaryData = await response.json();
            const pdfLink = cloudinaryData.secure_url;
            // --- END OF UPDATED LOGIC ---

            setStatus({ message: 'Step 2/2: Processing PDF and generating audio...', type: 'info' });

            // Step 2: Send link to our backend (using our configured axios instance is fine here)
            await api.post('/api/v1/pdfs', { pdf_link: pdfLink, pdf_name: pdfName });

            setStatus({ message: 'Success! Your document has been converted.', type: 'success' });
            onUploadSuccess(); // Callback to refresh the PDF list in the parent
            setPdfName('');
            setPdfFile(null);
            e.target.reset(); // Reset file input

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
            setStatus({ message: `Error: ${errorMessage}`, type: 'error' });
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    // ... The JSX for the return statement remains unchanged ...
    return (
        <section className="upload-section">
            <h2>Upload a New PDF</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="pdf-name">Document Name</label>
                    <input
                        type="text"
                        id="pdf-name"
                        value={pdfName}
                        onChange={(e) => setPdfName(e.target.value)}
                        placeholder="e.g., 'Chapter 1 Notes'"
                        required
                        disabled={isUploading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="pdf-file">PDF File</label>
                    <input
                        type="file"
                        id="pdf-file"
                        accept="application/pdf"
                        onChange={(e) => setPdfFile(e.target.files[0])}
                        required
                        disabled={isUploading}
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isUploading}>
                    {isUploading ? 'Processing...' : 'Upload & Convert'}
                </button>
            </form>
            {status.message && <div className={`message ${status.type}`}>{status.message}</div>}
        </section>
    );
};

export default UploadForm;