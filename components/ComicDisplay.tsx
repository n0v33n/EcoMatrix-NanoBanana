/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ComicDisplayProps {
    isGenerating: boolean;
    comicError: string | null;
    comicImageUrls: string[] | null;
    prompt: string;
    contrast: number;
    currentPage: number;
    storyParts: string[] | null;
    isNarrating: boolean;
    isEditing: boolean;
    editPrompt: string;
    loadingMessage: string;
    editPanelRef: React.Ref<HTMLDivElement>;
    forceShowEditPanel?: boolean;
    setCurrentPage: (page: number | ((prev: number) => number)) => void;
    handleNarrationClick: () => void;
    setIsExportModalOpen: (isOpen: boolean) => void;
    setEditPrompt: (prompt: string) => void;
    handleEditComic: () => void;
    handleAmbianceEffect: (effect: string) => void;
}

export const ComicDisplay: React.FC<ComicDisplayProps> = ({
    isGenerating,
    comicError,
    comicImageUrls,
    prompt,
    contrast,
    currentPage,
    storyParts,
    isNarrating,
    isEditing,
    editPrompt,
    loadingMessage,
    editPanelRef,
    forceShowEditPanel = false,
    setCurrentPage,
    handleNarrationClick,
    setIsExportModalOpen,
    setEditPrompt,
    handleEditComic,
    handleAmbianceEffect,
}) => {
    return (
        <div className="display-area">
            <div className="display-panel">
                {isGenerating && (
                    <div className="comic-skeleton-loader" aria-label="Generating comic strip, please wait." role="status"></div>
                )}
                {comicError && !isGenerating && (
                    <div className="comic-status" role="alert">{comicError}</div>
                )}
                {!isGenerating && !comicError && (
                    <>
                        {!comicImageUrls ? (
                            <div className="placeholder">
                                <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 0 24 24" width="48px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM17 11h-4v4h-2v-4H7V9h4V5h2v4h4v2z" /></svg>
                                <p>Your comic will appear here</p>
                            </div>
                        ) : (
                            <div className="carousel-container">
                                <div className="carousel-track" style={{ transform: `translateX(-${currentPage * 100}%)` }}>
                                    {comicImageUrls.map((url, index) => (
                                        <div className={`carousel-slide ${index === currentPage ? 'active-page' : ''}`} key={index}>
                                            <img
                                                src={url}
                                                alt={`Comic page ${index + 1} for prompt: ${prompt}`}
                                                className="comic-image"
                                                style={{ filter: `contrast(${contrast}%)` }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {comicImageUrls.length > 1 && (
                                    <>
                                        <button
                                            className="carousel-btn prev"
                                            onClick={() => setCurrentPage(p => (p === 0 ? comicImageUrls.length - 1 : p - 1))}
                                            aria-label="Previous page"
                                        >
                                            &#10094;
                                        </button>
                                        <button
                                            className="carousel-btn next"
                                            onClick={() => setCurrentPage(p => (p === comicImageUrls.length - 1 ? 0 : p + 1))}
                                            aria-label="Next page"
                                        >
                                            &#10095;
                                        </button>
                                        <div className="carousel-dots">
                                            {comicImageUrls.map((_, index) => (
                                                <button
                                                    key={index}
                                                    className={`carousel-dot ${index === currentPage ? 'active' : ''}`}
                                                    onClick={() => setCurrentPage(index)}
                                                    aria-label={`Go to page ${index + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                                <div className="comic-actions">
                                    {storyParts && storyParts.length > 0 && (
                                        <button className="btn btn-overlay" onClick={handleNarrationClick} aria-label={isNarrating ? 'Stop narration' : 'Narrate story page'}>
                                            {isNarrating ? (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0z" fill="none" /><path d="M6 6h12v12H6z" /></svg>
                                                    Stop
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                                                    Narrate
                                                </>
                                            )}
                                        </button>
                                    )}
                                    <button className="btn btn-overlay" onClick={() => setIsExportModalOpen(true)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px">
                                            <path d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75z" />
                                            <path d="M3.75 13.5a.75.75 0 00-1.5 0v6a3 3 0 003 3h12a3 3 0 003-3v-6a.75.75 0 00-1.5 0v6a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-6z" />
                                        </svg>
                                        Share / Export
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            {(comicImageUrls || forceShowEditPanel) && !isGenerating && (
                <div className="edit-panel" ref={editPanelRef}>
                    <h3>Edit Your Comic</h3>
                    <p className="subtitle">Use Nano Banana to refine the current page.</p>

                    <div className="ambiance-effects">
                        <label className="setting-label">Quick Effects</label>
                        <div className="ambiance-buttons">
                            <button className="btn-ambiance" onClick={() => handleAmbianceEffect('day')} disabled={isEditing}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 010 1.06l-1.591 1.591a.75.75 0 11-1.06-1.062l1.591-1.591a.75.75 0 011.06 0zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM17.803 17.803a.75.75 0 01-1.06 0l-1.591-1.591a.75.75 0 111.06-1.06l1.591 1.59a.75.75 0 010 1.062zM12 21.75a.75.75 0 01-.75-.75v-2.25a.75.75 0 011.5 0v2.25a.75.75 0 01-.75.75zM4.106 18.894a.75.75 0 010-1.06l1.591-1.591a.75.75 0 111.06 1.06l-1.591 1.591a.75.75 0 01-1.06 0zM2.25 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM6.106 5.106a.75.75 0 011.06 0l1.591 1.591a.75.75 0 01-1.06 1.06l-1.591-1.59a.75.75 0 010-1.062z" /></svg>
                                Day
                            </button>
                            <button className="btn-ambiance" onClick={() => handleAmbianceEffect('night')} disabled={isEditing}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.75 3.412a.75.75 0 01.172 1.488A9.001 9.001 0 0012 19.5a.75.75 0 010 1.5a10.5 10.5 0 0010.428-9.988.75.75 0 01-.586-.889 10.5 10.5 0 00-9.564-6.6zM6.08 7.965a.75.75 0 01-1.06 0l-.72-.72a.75.75 0 010-1.06l.72-.72a.75.75 0 111.06 1.06l-.19.19.19.19a.75.75 0 010 1.06zM8.25 12a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 018.25 12zM6.08 16.035a.75.75 0 010-1.06l.19-.19-.19-.19a.75.75 0 111.06-1.06l.72.72a.75.75 0 010 1.06l-.72.72a.75.75 0 01-1.06 0z" /></svg>
                                Night
                            </button>
                             <button className="btn-ambiance" onClick={() => handleAmbianceEffect('rainy')} disabled={isEditing}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 18a.75.75 0 01-1.5 0v-2.25a.75.75 0 011.5 0V18zM15 19.5a.75.75 0 00-1.5 0v-2.25a.75.75 0 001.5 0V19.5zM6.75 15a.75.75 0 01-1.5 0v-2.25a.75.75 0 011.5 0V15zM18.817 10.625a.75.75 0 01-1.04-.219 5.253 5.253 0 00-9.553-2.457.75.75 0 01-1.423-.495A6.75 6.75 0 0119.5 9.75a.75.75 0 01-.683.875z" /><path d="M4.363 9.487a.75.75 0 01-.219-1.04 7.5 7.5 0 0111.009-1.33.75.75 0 11-.704 1.28A6 6 0 005.144 9.43a.75.75 0 01-.781.057z" /></svg>
                                Rainy
                            </button>
                             <button className="btn-ambiance" onClick={() => handleAmbianceEffect('sunny')} disabled={isEditing}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v.516a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM12 18a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM18.15 7.425a.75.75 0 010 1.06l-.365.365a.75.75 0 11-1.06-1.06l.365-.365a.75.75 0 011.06 0zM21.75 13.5a.75.75 0 01-.75.75h-.516a.75.75 0 010-1.5h.516a.75.75 0 01.75.75zM17.785 18.15a.75.75 0 01-1.06 0l-.365-.365a.75.75 0 111.06-1.06l.365.365a.75.75 0 010 1.06zM12 21.75a.75.75 0 01-.75-.75v-.516a.75.75 0 011.5 0v.516a.75.75 0 01-.75.75zM5.85 17.785a.75.75 0 010-1.06l.365-.365a.75.75 0 111.06 1.06l-.365.365a.75.75 0 01-1.06 0zM2.25 13.5a.75.75 0 01.75-.75h.516a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM6.215 5.85a.75.75 0 011.06 0l.365.365a.75.75 0 01-1.06 1.06l-.365-.365a.75.75 0 010-1.06z" /></svg>
                                Sunny
                            </button>
                        </div>
                    </div>
                    
                    <div className="prompt-container">
                        <textarea
                            id="edit-prompt-input"
                            className="prompt-input"
                            placeholder="e.g., Add a friendly sun wearing sunglasses..."
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            disabled={isEditing}
                            rows={3}
                        />
                    </div>
                    <button
                        className="btn btn-secondary"
                        onClick={handleEditComic}
                        disabled={isEditing || !editPrompt.trim()}
                        style={{ width: '100%' }}
                    >
                        {isEditing ? loadingMessage : 'Apply Edit'}
                        {isEditing && <div className="loading-spinner"></div>}
                    </button>
                </div>
            )}
        </div>
    );
};