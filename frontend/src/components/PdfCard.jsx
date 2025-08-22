import React, { useState } from 'react';

const PdfCard = ({ pdf, onDelete }) => {
    // State to control the visibility of the PDF preview
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    const togglePreview = () => {
        setIsPreviewVisible(prevState => !prevState);
    };

    return (
        // The wrapper's class changes dynamically based on the state
        <div className={`pdf-card-wrapper ${isPreviewVisible ? 'preview-active' : ''}`}>
            <div className="pdf-card">
                <div>
                    <h3>{pdf.pdf_name}</h3>
                    <audio controls src={pdf.audio_link} style={{ width: '100%', marginTop: '1rem' }}>
                        Your browser does not support the audio element.
                    </audio>
                </div>

                <div className="pdf-card-actions">
                    <button onClick={togglePreview} className="preview-btn">
                        <i className={`ph-fill ${isPreviewVisible ? 'ph-eye-slash' : 'ph-eye'}`}></i>
                        <span>{isPreviewVisible ? 'Hide Preview' : 'Show Preview'}</span>
                    </button>
                    
                    <a href={pdf.pdf_link} target="_blank" rel="noopener noreferrer">
                        <i className="ph-fill ph-file-pdf"></i>
                        <span>View PDF</span>
                    </a>
                    
                    <button onClick={() => onDelete(pdf._id)} className="delete-btn">
                        <i className="ph-fill ph-trash"></i>
                        <span>Delete</span>
                    </button>
                </div>
            </div>

            {/* Conditionally render the iframe based on the state */}
            {isPreviewVisible && (
                <div className="pdf-preview-container">
                    {/* Appending #toolbar=0 hides the default Adobe toolbar for a cleaner look */}
                    <iframe 
                        src={`${pdf.pdf_link}#toolbar=0&navpanes=0`} 
                        title={`Preview of ${pdf.pdf_name}`}
                    ></iframe>
                </div>
            )}
        </div>
    );
};

export default PdfCard;