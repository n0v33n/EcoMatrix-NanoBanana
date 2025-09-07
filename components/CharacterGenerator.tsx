/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import type { Character } from '../types';
import { FaceFusion } from './FaceFusion';
import { CharacterIcon } from './Icons';

interface CharacterGeneratorProps {
    characters: Character[];
    newCharacter: Omit<Character, 'id'>;
    isAnalyzingFace: boolean;
    isOpen?: boolean;
    onToggle?: (e: React.SyntheticEvent<HTMLDetailsElement>) => void;
    onNewCharacterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onAddCharacter: (e: React.FormEvent) => void;
    onRemoveCharacter: (id: string) => void;
    onImageUpload: (base64Image: string) => void;
    onImageClear: () => void;
}

// FIX: Changed ref type from HTMLElement to HTMLDetailsElement to correctly type the forwarded ref for the <details> element.
const CharacterGeneratorComponent: React.ForwardRefRenderFunction<HTMLDetailsElement, CharacterGeneratorProps> = ({
    characters,
    newCharacter,
    isAnalyzingFace,
    isOpen,
    onToggle,
    onNewCharacterChange,
    onAddCharacter,
    onRemoveCharacter,
    onImageUpload,
    onImageClear
}, ref) => {
    return (
        <details className="character-generator-details" ref={ref} open={isOpen} onToggle={onToggle}>
            <summary>Character Generator</summary>
            <div className="character-generator-content">
                <p className="subtitle">Define characters to include in your comic.
                    <br />
                    <b>Heroes:</b> Scientists, activists, eco-robots, animals.
                    <br />
                    <b>Villains:</b> Carbon monsters, pollution tycoons.
                </p>
                <form onSubmit={onAddCharacter} className="character-form">
                    <div className="form-group">
                        <label htmlFor="char-name">Name</label>
                        <input type="text" id="char-name" name="name" className="prompt-input" placeholder="e.g., Captain Planet" value={newCharacter.name} onChange={onNewCharacterChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="char-type">Type</label>
                        <select id="char-type" name="type" className="prompt-input" value={newCharacter.type} onChange={onNewCharacterChange}>
                            <option value="Hero">Hero</option>
                            <option value="Villain">Villain</option>
                            <option value="Sidekick">Sidekick</option>
                        </select>
                    </div>
                    <FaceFusion
                        onImageUpload={onImageUpload}
                        onImageClear={onImageClear}
                        imagePreviewUrl={newCharacter.faceImage || null}
                        isAnalyzing={isAnalyzingFace}
                    />
                    <div className="form-group">
                        <label htmlFor="char-appearance">Appearance</label>
                        <textarea id="char-appearance" name="appearance" className="prompt-input" rows={3} placeholder="e.g., Green hair, suit made of recycled materials. Or upload an image to auto-generate." value={newCharacter.appearance} onChange={onNewCharacterChange}></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="char-personality">Personality / Traits</label>
                        <textarea id="char-personality" name="personality" className="prompt-input" rows={2} placeholder="e.g., Brave, optimistic, loves nature" value={newCharacter.personality} onChange={onNewCharacterChange}></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="char-powers">Powers</label>
                        <textarea id="char-powers" name="powers" className="prompt-input" rows={2} placeholder="e.g., Solar energy blasts, recycling shields" value={newCharacter.powers} onChange={onNewCharacterChange}></textarea>
                    </div>
                    <button type="submit" className="btn btn-secondary" style={{ width: '100%' }} disabled={isAnalyzingFace}>
                        {isAnalyzingFace ? 'Analyzing...' : 'Add Character'}
                        {isAnalyzingFace && <div className="loading-spinner"></div>}
                    </button>
                </form>
                {characters.length > 0 && (
                    <div className="character-list">
                        <h3>Your Characters</h3>
                        {characters.map(char => (
                            <div key={char.id} className="character-card">
                                <button onClick={() => onRemoveCharacter(char.id)} className="remove-char-btn" aria-label={`Remove ${char.name}`}>&times;</button>
                                <div className="character-card-header">
                                    {char.faceImage && <img src={char.faceImage} alt={char.name} className="character-thumbnail" />}
                                    <div className="character-card-info">
                                        <h4><CharacterIcon type={char.type} /> {char.name} <span className="character-type-badge">{char.type}</span></h4>
                                    </div>
                                </div>
                                {(char.appearance || char.faceDescription) && <p><strong>Appearance:</strong> {char.faceDescription || char.appearance}</p>}
                                {char.personality && <p><strong>Personality:</strong> {char.personality}</p>}
                                {char.powers && <p><strong>Powers:</strong> {char.powers}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </details>
    );
};

export const CharacterGenerator = React.forwardRef(CharacterGeneratorComponent);