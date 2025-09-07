/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface HistoryPanelProps {
    comicHistory: string[];
    onClearHistory: () => void;
    onViewHistoryItem: (prompt: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ comicHistory, onClearHistory, onViewHistoryItem }) => {
    if (comicHistory.length === 0) {
        return null;
    }

    return (
        <section className="history-panel" aria-labelledby="history-heading">
            <div className="history-header">
                <h2 id="history-heading">Your Comic History</h2>
                <button onClick={onClearHistory} className="btn-text">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" /></svg>
                    Clear History
                </button>
            </div>
            <div className="history-grid">
                {comicHistory.map((promptText, index) => (
                    <div
                        key={index}
                        className="history-card"
                        onClick={() => onViewHistoryItem(promptText)}
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onViewHistoryItem(promptText)}
                        role="button"
                        aria-label={`Use prompt: ${promptText}`}
                    >
                        <p className="history-card-prompt">{promptText}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};
