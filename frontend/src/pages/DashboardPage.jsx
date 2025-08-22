import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Header from '../components/Header';
import UploadForm from '../components/UploadForm';
import PdfCard from '../components/PdfCard';

const DashboardPage = () => {
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPdfs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/v1/pdfs');
            setPdfs(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch your documents.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPdfs();
    }, [fetchPdfs]);

    const handleDelete = async (pdfId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        
        try {
            await api.delete(`/api/v1/pdfs/${pdfId}`);
            // Refresh list by filtering out the deleted PDF
            setPdfs(prevPdfs => prevPdfs.filter(pdf => pdf._id !== pdfId));
        } catch (err) {
            alert('Failed to delete document.');
            console.error(err);
        }
    };

    return (
        <>
            <Header />
            <main className="container">
                <UploadForm onUploadSuccess={fetchPdfs} />
                <section className="pdf-list-section">
                    <h2>Your Converted Documents</h2>
                    <div id="pdf-list-container">
                        {loading && <p>Loading documents...</p>}
                        {error && <p className="message error">{error}</p>}
                        {!loading && pdfs.length === 0 && (
                            <p>You have no documents yet. Upload one to get started!</p>
                        )}
                        {pdfs.map(pdf => (
                            <PdfCard key={pdf._id} pdf={pdf} onDelete={handleDelete} />
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
};

export default DashboardPage;