/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShare: () => void;
    onDownload: () => void;
    onExportPdf: () => void;
    onExportWebcomic: () => void;
    hasMultiplePages: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onShare, onDownload, onExportPdf, onExportWebcomic, hasMultiplePages }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose} aria-label="Close export options">&times;</button>
                <h2>Share & Export</h2>
                <p className="subtitle">Choose an option for your comic.</p>
                <div className="modal-actions">
                    <button onClick={onShare}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" /></svg>
                        Share Current Page
                    </button>
                    <button onClick={onDownload}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
                        Download as Image (PNG)
                    </button>
                    <button onClick={onExportPdf}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm-6.5-2.5h1v1h-1v-1zm5.5 0h1v1h-1v-1zM4 6H2v14c0 1.1.9 2 2 2h14v-2-H4V6z" /></svg>
                        Export as Document (PDF)
                    </button>
                    {hasMultiplePages && (
                        <button onClick={onExportWebcomic}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M8 11h8v2H8v-2zm-2 6h12v-2H6v2zm2-10h8V5H8v2z" /></svg>
                            Export as Webcomic (Vertical PNG)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
