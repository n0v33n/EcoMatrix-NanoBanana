/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Modality, Type } from '@google/genai';

import { Character, SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from './types';
import { LogoIcon, HelpIcon } from './components/Icons';
import { CharacterGenerator } from './components/CharacterGenerator';
import { ComicDisplay } from './components/ComicDisplay';
import { ExportModal } from './components/ExportModal';
import { HistoryPanel } from './components/HistoryPanel';
import { Tutorial } from './components/Tutorial';
import type { TutorialStep } from './components/Tutorial';

// FIX: Add SpeechRecognition properties to the Window interface to fix TypeScript errors.
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const TUTORIAL_PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMTQ0IiB2aWV3Qm94PSIwIDAgMjU2IDE0NCI+PHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIxNDQiIGZpbGw9IiNkYWUxZTMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2FjYjVjMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV4YW1wbGUgQ29taWMgUGFnZTwvdGV4dD48L3N2Zz4=';


const App: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<string>('light');

  // Comic generation state
  const [prompt, setPrompt] = useState<string>('');
  const [comicImageUrls, setComicImageUrls] = useState<string[] | null>(null);
  const [storyParts, setStoryParts] = useState<string[] | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [comicError, setComicError] = useState<string | null>(null);
  const [contrast, setContrast] = useState<number>(100);
  const [applyComicStyle, setApplyComicStyle] = useState<boolean>(true);
  const [integrateScience, setIntegrateScience] = useState<boolean>(true);
  const [comicArtStyle, setComicArtStyle] = useState<string>('Western Comics');
  const [lineThickness, setLineThickness] = useState<string>('Medium');
  const [shadingTechnique, setShadingTechnique] = useState<string>('Halftone Dots');
  
  // Comic editing state
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Character state
  const [characters, setCharacters] = useState<Character[]>([]);
  const [newCharacter, setNewCharacter] = useState<Omit<Character, 'id'>>({
    name: '',
    type: 'Hero',
    appearance: '',
    personality: '',
    powers: '',
    faceImage: null,
    faceDescription: null,
  });
  const [isAnalyzingFace, setIsAnalyzingFace] = useState<boolean>(false);


  // UI state
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);


  // Voice input state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Comic history state (storing only prompts to avoid storage quota errors)
  const [comicHistory, setComicHistory] = useState<string[]>([]);

  // Draft state
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const draftSaveTimeoutRef = useRef<number | null>(null);
  
  // Tutorial state
  const [isTutorialActive, setIsTutorialActive] = useState<boolean>(false);
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [isCharGenOpen, setIsCharGenOpen] = useState<boolean>(false);
  
  // Refs for tutorial targets
  const promptRef = useRef<HTMLTextAreaElement>(null);
  // FIX: Changed ref type to HTMLDetailsElement to match the forwarded ref's target element.
  const characterGenRef = useRef<HTMLDetailsElement>(null);
  const generateButtonsRef = useRef<HTMLDivElement>(null);
  const editPanelRef = useRef<HTMLDivElement>(null);

  // Effect for setting the theme on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('ecoMatrixTheme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);
  
  // Effect for tutorial
  useEffect(() => {
    // Check if the user has completed the tutorial before
    const tutorialCompleted = localStorage.getItem('ecoMatrixTutorialCompleted');
    if (!tutorialCompleted) {
      // Use a small delay to ensure the UI is fully rendered
      const timer = setTimeout(() => {
        setIsTutorialActive(true);
        setTutorialStep(0);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Effect for applying the theme and saving it
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ecoMatrixTheme', theme);
  }, [theme]);

  // Effect for toast message timeout
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load comic history from localStorage on initial render, with migration logic
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('ecoMatrixComicHistory');
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        // Check if data is already in the new format (array of strings)
        if (Array.isArray(parsedHistory) && (parsedHistory.length === 0 || typeof parsedHistory[0] === 'string')) {
          setComicHistory(parsedHistory);
        }
        // Check if data is in the old format (array of objects) and migrate it
        else if (Array.isArray(parsedHistory) && parsedHistory.length > 0 && typeof parsedHistory[0] === 'object' && parsedHistory[0].prompt) {
          const migratedHistory = parsedHistory.map(item => item.prompt);
          setComicHistory(migratedHistory);
          localStorage.setItem('ecoMatrixComicHistory', JSON.stringify(migratedHistory));
        } else {
          // If format is unknown, clear it to prevent errors
          localStorage.removeItem('ecoMatrixComicHistory');
        }
      }
    } catch (error) {
      console.error("Failed to load or migrate comic history from localStorage", error);
      localStorage.removeItem('ecoMatrixComicHistory'); // Clear potentially corrupted data
    }
  }, []);

  // Check for an existing draft on initial load
  useEffect(() => {
    try {
      const storedDraft = localStorage.getItem('ecoMatrixDraft');
      if (storedDraft) {
        setHasDraft(true);
      }
    } catch (error) {
      console.error("Failed to check for draft in localStorage", error);
    }
  }, []);

  // Effect to auto-save draft with debounce
  useEffect(() => {
    if (draftSaveTimeoutRef.current) {
      clearTimeout(draftSaveTimeoutRef.current);
    }

    draftSaveTimeoutRef.current = window.setTimeout(() => {
      // Only save if there's something to save
      if (prompt.trim() || characters.length > 0 || (comicImageUrls && comicImageUrls.length > 0)) {
        try {
          const draft = {
            prompt,
            comicImageUrls,
            storyParts,
            characters,
          };
          localStorage.setItem('ecoMatrixDraft', JSON.stringify(draft));
          setHasDraft(true);
        } catch (e) {
          console.error("Failed to save draft:", e);
        }
      } else {
        // If everything is empty, clear any existing draft
        try {
          localStorage.removeItem('ecoMatrixDraft');
          setHasDraft(false);
        } catch (e) {
          console.error("Failed to clear draft:", e);
        }
      }
    }, 1000); // 1-second delay

    return () => {
      if (draftSaveTimeoutRef.current) {
        clearTimeout(draftSaveTimeoutRef.current);
      }
    };
  }, [prompt, comicImageUrls, storyParts, characters]);

  // Clean up speech recognition and synthesis on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);
  
  // Reset current page and stop narration when comic images change
  useEffect(() => {
    if (comicImageUrls) {
      setCurrentPage(0);
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    }
  }, [comicImageUrls]);

  // Stop narration when the page is changed manually
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsNarrating(false);
  }, [currentPage]);

  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const showToast = (message: string) => {
    setToastMessage(message);
  };
  
  const commonGenerationSetup = () => {
    setIsGenerating(true);
    setComicError(null);
    setComicImageUrls(null);
    setStoryParts(null);
  };

  const commonGenerationTeardown = (newImageUrls: string[], newPrompt: string, newStoryParts: string[] | null = null) => {
    setComicImageUrls(newImageUrls);
    setStoryParts(newStoryParts);
    setEditPrompt('');
    
    // Add to history (only the prompt)
    const updatedHistory = [newPrompt, ...comicHistory.filter(item => item !== newPrompt)];
    const slicedHistory = updatedHistory.slice(0, 50); // Cap history size
    setComicHistory(slicedHistory);
    
    try {
      localStorage.setItem('ecoMatrixComicHistory', JSON.stringify(slicedHistory));
    } catch (e) {
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.warn("localStorage quota is full. History will not be saved.");
        showToast("Could not save to history: storage is full.");
      } else {
        console.error("Failed to save comic history:", e);
      }
    }
  };
  
  const commonGenerationFinally = () => {
      setIsGenerating(false);
      setLoadingMessage('');
  };

  const getCharacterDescriptions = () => {
    if (characters.length === 0) return '';
    const descriptions = characters.map(c => {
        // Prioritize AI-generated face description for appearance
        const appearanceDesc = c.faceDescription || c.appearance || 'not specified';
        return `- ${c.name} (${c.type}): Appearance: ${appearanceDesc}. Personality: ${c.personality || 'not specified'}. Powers: ${c.powers || 'not specified'}.`;
    }).join('\n');
    return `Please use the following characters in the comic. Ensure their appearance, especially facial features, remains consistent across all panels:\n${descriptions}\n\n---\n\n`;
  };

  const handleGenerateComic = async () => {
    if (!prompt.trim() || isGenerating) return;

    commonGenerationSetup();
    setLoadingMessage('Creating comic strip');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const characterDescriptions = getCharacterDescriptions();
      const scienceInstruction = integrateScience 
            ? "Subtly embed one relevant, verifiable, and kid-friendly climate science fun fact or a simple infographic (like a pie chart or bar graph disguised as a story element) into one of the panels." 
            : "";
      const fullPrompt = `${characterDescriptions}Create a 4-panel comic strip based on this story: "${prompt}". The comic should have a hopeful, inspiring tone and a clean, digital art style. Focus on clear visual storytelling. If characters are described, please incorporate their descriptions. ${scienceInstruction}`;

      const generationResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '16:9',
        },
      });

      if (!generationResponse.generatedImages || generationResponse.generatedImages.length === 0) {
        throw new Error('Initial image generation failed.');
      }
      
      let finalImageBytes: string = generationResponse.generatedImages[0].image.imageBytes;

      if (applyComicStyle) {
        setLoadingMessage('Applying comic style');

        const stylePrompt = `Transform this image to have a ${comicArtStyle.toLowerCase()} art style. The line work should be ${lineThickness.toLowerCase()}. Apply ${shadingTechnique.toLowerCase()} for shading. Add panel borders to clearly separate it into 4 panels. Use vibrant, slightly saturated colors.`;

        const editResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: {
            parts: [
              {
                inlineData: {
                  data: finalImageBytes,
                  mimeType: 'image/png',
                },
              },
              {
                text: stylePrompt,
              },
            ],
          },
          config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
          },
        });

        const imagePart = editResponse.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
          finalImageBytes = imagePart.inlineData.data;
        } else {
          console.warn('Comic styling failed. Falling back to the original image.');
          showToast('Could not apply comic style, showing original.');
        }
      }

      const newComicImageUrl = `data:image/png;base64,${finalImageBytes}`;
      commonGenerationTeardown([newComicImageUrl], prompt);

    } catch (err) {
      console.error('Error generating comic:', err);
      const errorMessage = (err as Error).message || '';
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
          setComicError('The service is busy due to high demand. Please wait a moment and try again.');
      } else {
          setComicError('Sorry, something went wrong while creating your comic. Please try again.');
      }
    } finally {
      commonGenerationFinally();
    }
  };

  const handleGenerateStory = async () => {
    if (!prompt.trim() || isGenerating) return;

    commonGenerationSetup();

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const characterDescriptions = getCharacterDescriptions();
        
        // 1. Generate story
        setLoadingMessage('1/4: Generating story...');
        const scienceInstruction = integrateScience
            ? "In one of the three parts, please naturally weave in a relevant and simple climate science fact suitable for children. For example, a character could mention a statistic, or look at a simple chart on a screen."
            : "";
        const storyPrompt = `${characterDescriptions}Based on the theme "${prompt}", write a short story for kids, divided into three distinct parts for a 3-page comic book. The story should be hopeful and inspiring. If specific characters are described, incorporate them into the story. ${scienceInstruction}`;
        const storyGenResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: storyPrompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  page1: { type: Type.STRING, description: "The story for the first page." },
                  page2: { type: Type.STRING, description: "The story for the second page." },
                  page3: { type: Type.STRING, description: "The story for the third page." },
                },
              }
            },
        });

        const storyParts = JSON.parse(storyGenResponse.text);
        const storyArray = [storyParts.page1, storyParts.page2, storyParts.page3];

        const generatedImageUrls: string[] = [];

        // 2. Generate images for each story part
        for (let i = 0; i < storyArray.length; i++) {
            // Add a longer delay before each image generation to avoid hitting API rate limits,
            // especially on free tiers. This helps prevent 429 "Resource Exhausted" errors.
            await new Promise(resolve => setTimeout(resolve, 5000));

            setLoadingMessage(`${i + 2}/4: Generating page ${i + 1}/3...`);
            const imagePrompt = `A children's comic book page in a clean, digital, and hopeful art style. The scene illustrates: "${storyArray[i]}"`;
            
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: imagePrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: '4:3', // More traditional book page aspect ratio
                },
            });

            if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
                throw new Error(`Image generation failed for page ${i + 1}.`);
            }

            let pageImageBytes = imageResponse.generatedImages[0].image.imageBytes;
            generatedImageUrls.push(`data:image/png;base64,${pageImageBytes}`);
        }
        
        commonGenerationTeardown(generatedImageUrls, prompt, storyArray);

    } catch (err) {
        console.error('Error generating 3-page story:', err);
        const errorMessage = (err as Error).message || '';
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
            setComicError('The service is busy due to high demand. Please wait a moment and try again.');
        } else {
            setComicError('Sorry, something went wrong while creating your story. Please try again.');
        }
    } finally {
        commonGenerationFinally();
    }
};

  const handleEditComic = async () => {
    if (!editPrompt.trim() || !comicImageUrls || isEditing) return;
    performEdit(editPrompt);
  };

  const handleAmbianceEffect = (effect: string) => {
    if (!comicImageUrls || isEditing) return;

    const effectPrompts: { [key: string]: string } = {
        'day': 'Change the lighting to a bright, clear daytime scene.',
        'night': 'Transform this scene to take place at night. Add stars, a moon, and adjust the lighting accordingly.',
        'rainy': 'Change the weather to be rainy. Add rain streaks, puddles, and adjust the lighting to be overcast.',
        'sunny': 'Make the scene look bright and sunny, as if it is golden hour. Add lens flare and warm tones.'
    };

    const effectPrompt = effectPrompts[effect];
    if (effectPrompt) {
        performEdit(effectPrompt, `Applying ${effect} effect...`);
    }
  };
  
  const performEdit = async (prompt: string, loadingText: string = 'Applying your edit...') => {
    setIsEditing(true);
    setComicError(null);
    setLoadingMessage(loadingText);
    
    try {
        if (!comicImageUrls) throw new Error("No comic image available to edit.");

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const base64ImageData = comicImageUrls[currentPage].split(',')[1];
        if (!base64ImageData) {
            throw new Error("Could not extract image data.");
        }

        const editResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: 'image/png' } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = editResponse.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            const newImageUrl = `data:image/png;base64,${imagePart.inlineData.data}`;
            const newImageUrls = [...comicImageUrls];
            newImageUrls[currentPage] = newImageUrl;
            
            setComicImageUrls(newImageUrls);
            
            showToast('Edit applied successfully!');
        } else {
            throw new Error('Editing failed. The model did not return an image.');
        }
    } catch (err) {
        console.error('Error editing comic:', err);
        setComicError('Sorry, something went wrong while editing your comic. Please try again.');
    } finally {
        setIsEditing(false);
        setLoadingMessage('');
        setEditPrompt(''); // Clear prompt after attempting edit
    }
  };

  const handleSuggestPrompt = async () => {
    setIsSuggesting(true);
    setComicError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const suggestionPrompt = `Suggest an inspiring, short story idea about a climate challenge being overcome. The story should be a single sentence and suitable for a comic strip featuring kids. Example: "A group of kids invent a machine that turns plastic waste into colorful toys for their playground."`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: suggestionPrompt,
      });

      const suggestedText = response.text.trim().replace(/^"|"$/g, ''); // Clean up quotes
      setPrompt(suggestedText);

    } catch (err) {
      console.error('Error suggesting prompt:', err);
      setComicError('Sorry, could not fetch a suggestion. Please try again.');
    } finally {
      setIsSuggesting(false);
    }
  };
  
  const handleMicClick = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setComicError("Sorry, your browser doesn't support voice recognition.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setComicError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      setComicError(`Voice input error: ${event.error}`);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const speechResult = event.results[0][0].transcript;
      setPrompt(prev => (prev ? `${prev.trim()} ${speechResult}` : speechResult).trim());
    };

    recognition.start();
  };

  const handleNarrationClick = () => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
        showToast("Sorry, your browser doesn't support narration.");
        return;
    }

    if (isNarrating) {
        window.speechSynthesis.cancel();
        setIsNarrating(false);
        return;
    }

    if (storyParts && storyParts.length > currentPage && storyParts[currentPage]) {
        const utterance = new window.SpeechSynthesisUtterance(storyParts[currentPage]);
        utterance.onstart = () => setIsNarrating(true);
        utterance.onend = () => setIsNarrating(false);
        utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
            console.error("Speech synthesis error:", e.error);
            setIsNarrating(false);
            showToast(`Narration failed: ${e.error || 'Unknown error'}`);
        };
        window.speechSynthesis.speak(utterance);
    }
  };

  const getProcessedImageBlob = (imageUrl: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = imageUrl;

        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.filter = `contrast(${contrast}%)`;
                ctx.drawImage(image, 0, 0);
                canvas.toBlob((blob) => resolve(blob), 'image/png');
            } else {
                resolve(null);
            }
        };
        image.onerror = () => {
            resolve(null);
        };
    });
};

  const handleDownloadComic = async () => {
      if (!comicImageUrls) return;
      const imageUrl = comicImageUrls[currentPage];
      if (!imageUrl) return;
      const blob = await getProcessedImageBlob(imageUrl);
      if (blob) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `Ecomatrix_Comic_Page_${currentPage + 1}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
      } else {
          setComicError("Could not process image for download.");
      }
      setIsExportModalOpen(false);
  };
  
  const handleShareComic = async () => {
    if (!comicImageUrls) return;
    const imageUrl = comicImageUrls[currentPage];

    const blob = await getProcessedImageBlob(imageUrl);
    if (!blob) {
      setComicError("Could not process image for sharing.");
      return;
    }

    const file = new File([blob], 'Ecomatrix_Comic.png', { type: 'image/png' });
    const shareData = {
      files: [file],
      title: 'EcoMatrix Comic',
      text: `Check out this comic I created with EcoMatrix!\n\nPrompt: "${prompt}"`,
    };

    // Use Web Share API if available
    if (navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Silently fail if user cancels share dialog
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
          setComicError('Sharing failed. Please try again.');
        }
      }
    } else {
      // Fallback to clipboard
      try {
        if (!navigator.clipboard?.write) {
            throw new Error("Clipboard API not supported for writing.");
        }
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('Comic copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
        setComicError('Sharing not supported. Please download the image to share it.');
      }
    }
    setIsExportModalOpen(false);
  };
  
  const handleExportPdf = () => {
      setIsExportModalOpen(false);
      showToast("Preparing PDF... Please use your browser's print dialog to 'Save as PDF'.");
      
      // Use a timeout to allow the toast to render before the print dialog blocks the main thread
      setTimeout(() => {
          document.body.classList.add('print-view');
          window.print();
          document.body.classList.remove('print-view');
      }, 500);
  };
  
  const handleExportWebcomic = async () => {
    if (!comicImageUrls || comicImageUrls.length <= 1) return;
    showToast("Generating vertical webcomic image...");
    setIsExportModalOpen(false);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error("Could not create canvas context.");
      }

      const images = await Promise.all(
        comicImageUrls.map(url => new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(new Error(`Failed to load image: ${url}. Error: ${err}`));
          img.src = url;
        }))
      );

      const totalWidth = Math.max(...images.map(img => img.width));
      const totalHeight = images.reduce((sum, img) => sum + img.height, 0);
      canvas.width = totalWidth;
      canvas.height = totalHeight;

      let currentY = 0;
      for (const img of images) {
        ctx.drawImage(img, 0, currentY);
        currentY += img.height;
      }

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'Ecomatrix_Webcomic.png';
      link.click();
      showToast('Webcomic download started!');
    } catch (error) {
      console.error("Failed to export as webcomic:", error);
      setComicError("Could not generate the webcomic image. Please try again.");
    }
};

  const handleViewHistoryItem = (promptToLoad: string) => {
    setPrompt(promptToLoad);
    setComicImageUrls(null);
    setStoryParts(null);
    setComicError(null);
    setEditPrompt('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Prompt loaded! You can generate the comic again.');
  }

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire comic history? This cannot be undone.")) {
      setComicHistory([]);
      try {
        localStorage.removeItem('ecoMatrixComicHistory');
      } catch (error) {
        console.error('Failed to clear history from localStorage', error);
        showToast('Could not clear history from storage.');
      }
    }
  }

  const handleNewCharacterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCharacter(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCharacter = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCharacter.name.trim()) {
          showToast("Character name is required.");
          return;
      }
      setCharacters(prev => [...prev, { ...newCharacter, id: Date.now().toString() }]);
      // Reset form
      setNewCharacter({
          name: '',
          type: 'Hero',
          appearance: '',
          personality: '',
          powers: '',
          faceImage: null,
          faceDescription: null,
      });
      showToast(`Character "${newCharacter.name}" added!`);
  };

  const handleRemoveCharacter = (id: string) => {
      setCharacters(prev => prev.filter(char => char.id !== id));
  };

  const handleImageUpload = async (base64Image: string) => {
    setNewCharacter(prev => ({ ...prev, faceImage: base64Image, faceDescription: '' }));
    setIsAnalyzingFace(true);
    showToast('Analyzing image to create character description...');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        const mimeType = base64Image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
        if (!mimeType || mimeType.length < 2) {
            throw new Error("Could not determine MIME type from base64 string.");
        }

        const imagePart = {
            inlineData: {
                mimeType: mimeType[1],
                data: base64Image.split(',')[1],
            },
        };
        const textPart = {
            text: "Analyze the person in this image and create a concise, visual description for a comic book character. Focus on key facial features, hair style and color, eye color, and any distinct characteristics like glasses or facial hair. Example: 'A character with sharp blue eyes, a strong jawline, short, wavy brown hair, and a confident smile.'",
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        const description = response.text.trim();
        // Set both appearance and faceDescription. The user can still edit appearance if they want.
        setNewCharacter(prev => ({ ...prev, faceDescription: description, appearance: description }));
        showToast('AI description generated and added to Appearance!');
    } catch (error) {
        console.error("Error analyzing face:", error);
        setComicError("Sorry, could not analyze the image. Please try another one.");
        // Clear the failed image
        setNewCharacter(prev => ({ ...prev, faceImage: null, faceDescription: null }));
    } finally {
        setIsAnalyzingFace(false);
    }
  };

  const handleImageClear = () => {
      setNewCharacter(prev => ({
          ...prev,
          faceImage: null,
          faceDescription: null,
          appearance: '' // Also clear appearance if it was auto-filled
      }));
  };

  const handleLoadDraft = () => {
    try {
      const storedDraft = localStorage.getItem('ecoMatrixDraft');
      if (storedDraft) {
        const draft = JSON.parse(storedDraft);
        setPrompt(draft.prompt || '');
        setComicImageUrls(draft.comicImageUrls || null);
        setStoryParts(draft.storyParts || null);
        setCharacters(draft.characters || []);
        showToast("Draft loaded successfully!");
      } else {
        showToast("No draft found to load.");
        setHasDraft(false); // Correct state if draft disappears
      }
    } catch (error) {
      console.error("Failed to load draft from localStorage", error);
      showToast("Could not load draft.");
    }
  };

  const handleClearDraft = () => {
    if (window.confirm("Are you sure you want to clear your current draft? This cannot be undone.")) {
      setPrompt('');
      setComicImageUrls(null);
      setStoryParts(null);
      setCharacters([]);
      // The save-effect will automatically clear the localStorage item
      showToast("Draft cleared.");
    }
  };
  
  const handleStartTutorial = () => {
      setIsTutorialActive(true);
      setTutorialStep(0);
  };
  
  const handleFinishTutorial = () => {
      setIsTutorialActive(false);
      setTutorialStep(0);
      localStorage.setItem('ecoMatrixTutorialCompleted', 'true');
  };
  
  const tutorialSteps: TutorialStep[] = [
    {
      title: 'Welcome to EcoMatrix!',
      content: "Let's take a quick tour to see how you can create inspiring comics about climate solutions.",
    },
    {
      targetRef: promptRef,
      title: '1. Start Your Story',
      content: 'Begin by writing your story idea here. You can also use the "Suggest Idea" button for inspiration or the microphone for voice input.',
      position: 'bottom',
    },
  ];

  return (
    <>
      <header>
        <div className="header-content">
          <LogoIcon className="logo" />
          <div className="title-container">
            <h1 className="app-title">EcoMatrix</h1>
            <p className="app-subtitle">AI comics for a greener future.</p>
          </div>
          <button className="theme-toggle" onClick={handleStartTutorial} aria-label="Start tutorial">
            <HelpIcon />
          </button>
          <button className="theme-toggle" onClick={handleThemeToggle} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M11.8 2.02c-1.12.15-2.17.6-3.08 1.29l.01-.01c-4.47 3.3-5.26 9.55-1.94 13.99 3.3 4.47 9.55 5.26 13.99 1.94 4.47-3.3 5.26-9.55 1.94-13.99-.05-.07-.1-.13-.15-.2-1.3-1.68-3.15-2.9-5.2-3.48-0.34-.1-.68-.15-1.02-.15-.19 0-.38.02-.56.05zm-.8 1.98c.52.05.98.2 1.4.42l.02.01c2.25.99 3.84 3.22 3.84 5.75 0 2.27-1.19 4.29-3 5.46-1.05.67-2.3 1.04-3.6 1.04-2.76 0-5-2.24-5-5 0-2.45 1.75-4.55 4.1-4.94.13-.02.26-.04.39-.06z" opacity=".3"/><path d="M9.37 5.51C9.19 6.15 9.1 6.82 9.1 7.5c0 2.76 2.24 5 5 5 1.08 0 2.08-.34 2.87-.93.26-.19.49-.41.7-.65-2.34 2.34-5.95 2.16-8.07-.31-2.12-2.47-1.95-6.07.31-8.07.24-.23.5-.44.78-.64-.67.73-1.08 1.68-1.08 2.75zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18V6c3.31 0 6 2.69 6 6s-2.69 6-6 6z"/></svg>
            )}
          </button>
        </div>
      </header>
      <main>
        <div className="theme-banner">
          <h2>Crafting a Greener Tomorrow</h2>
          <p>Turn your climate solution ideas into vibrant comics. Start with a story prompt below.</p>
        </div>
        <div className="main-content" aria-labelledby="generator-heading">
          <div className="generator-panel">
            <h2 id="generator-heading">Create Your Climate Comic</h2>
            <p className="subtitle">Turn your story idea into an inspiring comic.</p>
            
            {hasDraft && (
              <div className="draft-actions">
                <p>You have an unsaved draft.</p>
                <div className="draft-buttons">
                  <button onClick={handleLoadDraft} className="btn btn-secondary">Resume Draft</button>
                  <button onClick={handleClearDraft} className="btn-text btn-danger">Clear Draft</button>
                </div>
              </div>
            )}

            <div className="prompt-container">
              <label htmlFor="prompt-input" className="sr-only">Describe your climate challenge story</label>
              <textarea
                id="prompt-input"
                ref={promptRef}
                className="prompt-input"
                placeholder="A community works together to clean a local river..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating || isSuggesting}
                rows={5}
              />
              <button
                className={`mic-btn ${isListening ? 'listening' : ''}`}
                onClick={handleMicClick}
                disabled={isGenerating || isSuggesting}
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                  <path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
                </svg>
              </button>
            </div>
            
            <CharacterGenerator
                ref={characterGenRef} 
                characters={characters}
                newCharacter={newCharacter}
                isOpen={isCharGenOpen}
                onToggle={(e) => setIsCharGenOpen(e.currentTarget.open)}
                isAnalyzingFace={isAnalyzingFace}
                onNewCharacterChange={handleNewCharacterChange}
                onAddCharacter={handleAddCharacter}
                onRemoveCharacter={handleRemoveCharacter}
                onImageUpload={handleImageUpload}
                onImageClear={handleImageClear}
            />

            <div className="action-buttons-grid" ref={generateButtonsRef}>
               <button
                className="btn btn-primary"
                onClick={handleGenerateComic}
                disabled={isGenerating || isSuggesting || !prompt.trim()}
                aria-live="polite"
              >
                {isGenerating ? loadingMessage : 'Generate Comic Strip'}
                {isGenerating && <div className="loading-spinner"></div>}
              </button>
               <button
                className="btn btn-primary"
                onClick={handleGenerateStory}
                disabled={isGenerating || isSuggesting || !prompt.trim()}
                aria-live="polite"
              >
                {isGenerating ? loadingMessage : 'Generate 3-Page Story'}
                {isGenerating && <div className="loading-spinner"></div>}
              </button>
            </div>
             <button
                className="btn btn-secondary"
                onClick={handleSuggestPrompt}
                disabled={isGenerating || isSuggesting}
                style={{width: '100%'}}
              >
                {isSuggesting ? (
                    <div className="loading-spinner"></div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M17.5 4.5c-1.95 0-4.05 1.2-5.5 3.05-1.45-1.85-3.55-3.05-5.5-3.05C3.36 4.5 1 6.86 1 9.75c0 2.81 2.14 5.21 4.75 6.42 0.44 0.2 0.93 0.33 1.45 0.33 0.52 0 1.01-0.13 1.45-0.33C11.21 14.96 13 12.56 13 9.75c0-2.89-2.36-5.25-5.25-5.25C6.45 4.5 5.2 5.23 4.41 6.26 5.42 5.62 6.57 5.25 7.75 5.25c1.95 0 3.5 1.55 3.5 3.5 0 0.27-0.03 0.54-0.09 0.79 0.81 1.5 2.23 2.71 4.23 2.71 0.52 0 1-0.13 1.45-0.33C19.21 14.96 21 12.56 21 9.75c0-2.89-2.36-5.25-5.25-5.25zM7.75 10.25c-0.83 0-1.5-0.67-1.5-1.5s0.67-1.5 1.5-1.5 1.5 0.67 1.5 1.5-0.67 1.5-1.5 1.5z" opacity=".3"/><path d="M17.5 2.5c-2.43 0-5.13 1.53-6.68 3.42C9.27 4.03 6.57 2.5 4.14 2.5 1.49 2.5-0.86 4.86-0.86 7.75c0 3.23 2.31 6.13 5.61 7.27 0.58 0.2 1.23 0.33 1.9 0.33s1.32-0.13 1.9-0.33c0.02 0 0.04-0.01 0.05-0.01 0.01 0 0.03 0.01 0.05 0.01 0.58 0.2 1.23 0.33 1.9 0.33s1.32-0.13 1.9-0.33c3.3-1.14 5.61-4.04 5.61-7.27 0-2.89-2.35-5.25-5.25-5.25zM12.25 12.25C10.25 12.25 8.81 11.04 7.99 9.5c0.06-0.25 0.09-0.52 0.09-0.75 0-1.95-1.55-3.5-3.5-3.5-1.18 0-2.33 0.37-3.34 1.01C1.96 5.37 4.25 4.5 5.5 4.5c1.95 0 4.05 1.2 5.5 3.05C12.45 5.7 14.55 4.5 16.5 4.5c2.25 0 4.54 0.87 5.25 2.25-1.01-0.64-2.16-1.01-3.34-1.01-1.95 0-3.5 1.55-3.5 3.5 0 0.23 0.03 0.5 0.09 0.75-0.82 1.54-2.26 2.75-4.26 2.75zM6.25 8.75c0 0.83 0.67 1.5 1.5 1.5s1.5-0.67 1.5-1.5-0.67-1.5-1.5-1.5-1.5 0.67-1.5 1.5z"/></svg>
                )}
                {isSuggesting ? 'Suggesting...' : 'Suggest Idea'}
              </button>
             <div className="settings-group">
                <div className="setting-item">
                  <label htmlFor="comic-style-toggle" className="setting-label">Apply Comic Book Style (Strip Only)</label>
                  <label className="switch">
                    <input
                      id="comic-style-toggle"
                      type="checkbox"
                      checked={applyComicStyle}
                      onChange={(e) => setApplyComicStyle(e.target.checked)}
                      disabled={isGenerating || isSuggesting}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className={`comic-style-options ${applyComicStyle ? 'visible' : ''}`}>
                    <div className="form-group">
                        <label htmlFor="art-style-select" className="setting-label">Art Style</label>
                        <select
                            id="art-style-select"
                            className="prompt-input"
                            value={comicArtStyle}
                            onChange={(e) => setComicArtStyle(e.target.value)}
                            disabled={isGenerating || isSuggesting}
                        >
                            <option>Western Comics</option>
                            <option>Manga</option>
                            <option>Cartoonish</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="line-thickness-select" className="setting-label">Line Thickness</label>
                        <select
                            id="line-thickness-select"
                            className="prompt-input"
                            value={lineThickness}
                            onChange={(e) => setLineThickness(e.target.value)}
                            disabled={isGenerating || isSuggesting}
                        >
                            <option>Thin</option>
                            <option>Medium</option>
                            <option>Thick</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="shading-select" className="setting-label">Shading</label>
                        <select
                            id="shading-select"
                            className="prompt-input"
                            value={shadingTechnique}
                            onChange={(e) => setShadingTechnique(e.target.value)}
                            disabled={isGenerating || isSuggesting}
                        >
                            <option>Halftone Dots</option>
                            <option>Solid Shading</option>
                            <option>Crosshatching</option>
                        </select>
                    </div>
                </div>
                 <div className="setting-item">
                  <label htmlFor="science-toggle" className="setting-label">Integrate Science Facts</label>
                  <label className="switch">
                    <input
                      id="science-toggle"
                      type="checkbox"
                      checked={integrateScience}
                      onChange={(e) => setIntegrateScience(e.target.checked)}
                      disabled={isGenerating || isSuggesting}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="setting-item-column">
                  <label htmlFor="contrast-slider" className="setting-label">Contrast: {contrast}%</label>
                  <input
                      id="contrast-slider"
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      disabled={isGenerating || isSuggesting}
                      aria-label="Adjust image contrast"
                  />
                </div>
            </div>
          </div>
          <ComicDisplay 
            isGenerating={isGenerating}
            comicError={comicError}
            comicImageUrls={comicImageUrls}
            prompt={prompt}
            contrast={contrast}
            currentPage={currentPage}
            storyParts={storyParts}
            isNarrating={isNarrating}
            isEditing={isEditing}
            editPrompt={editPrompt}
            loadingMessage={loadingMessage}
            editPanelRef={editPanelRef}
            setCurrentPage={setCurrentPage}
            handleNarrationClick={handleNarrationClick}
            setIsExportModalOpen={setIsExportModalOpen}
            setEditPrompt={setEditPrompt}
            handleEditComic={handleEditComic}
            handleAmbianceEffect={handleAmbianceEffect}
          />
        </div>
        
        <HistoryPanel 
          comicHistory={comicHistory}
          onClearHistory={handleClearHistory}
          onViewHistoryItem={handleViewHistoryItem}
        />
      </main>

      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onShare={handleShareComic}
        onDownload={handleDownloadComic}
        onExportPdf={handleExportPdf}
        onExportWebcomic={handleExportWebcomic}
        hasMultiplePages={comicImageUrls ? comicImageUrls.length > 1 : false}
      />

      {toastMessage && (
        <div className="toast-notification" role="status">
          {toastMessage}
        </div>
      )}

      <div className="print-container" aria-hidden="true">
        {comicImageUrls?.map((url, index) => (
          <div className="print-page" key={`print-${index}`}>
            <img src={url} alt="" />
          </div>
        ))}
      </div>
      
      <Tutorial
        isActive={isTutorialActive}
        steps={tutorialSteps}
        currentStep={tutorialStep}
        onNext={() => setTutorialStep(s => s + 1)}
        onPrev={() => setTutorialStep(s => s - 1)}
        onFinish={handleFinishTutorial}
      />
    </>
  );
};

// Simple utility to add a screen-reader only class
const style = document.createElement('style');
style.textContent = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;
document.head.appendChild(style);


const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}