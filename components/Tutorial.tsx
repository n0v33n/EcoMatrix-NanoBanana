/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useLayoutEffect } from 'react';

export interface TutorialStep {
    targetRef?: React.RefObject<HTMLElement>;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TutorialProps {
    isActive: boolean;
    steps: TutorialStep[];
    currentStep: number;
    onNext: () => void;
    onPrev: () => void;
    onFinish: () => void;
}

interface Position {
    top: number;
    left: number;
    width: number;
    height: number;
}

export const Tutorial: React.FC<TutorialProps> = ({ isActive, steps, currentStep, onNext, onPrev, onFinish }) => {
    const [highlightPos, setHighlightPos] = useState<Position | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ top: number, left: number }>({ top: 0, left: 0 });

    const step = steps[currentStep];

    useLayoutEffect(() => {
        if (!isActive || !step) {
            setHighlightPos(null);
            return;
        };

        const targetEl = step.targetRef?.current;

        if (targetEl) {
            // Hide the highlight temporarily to prevent it from jumping to a new position.
            setHighlightPos(null);

            // This timeout lets React finish its render cycle and allows the browser to reflow.
            // This is crucial for elements that have just been displayed (like the edit panel)
            // or resized (like the character generator), ensuring we get the correct position.
            const timer = setTimeout(() => {
                const currentTarget = step.targetRef?.current;
                if (currentTarget) {
                    // Scroll instantly. Using 'smooth' behavior makes timing the measurement difficult.
                    currentTarget.scrollIntoView({ block: 'center', inline: 'center' });

                    // Now, get the final position of the element.
                    const rect = currentTarget.getBoundingClientRect();
                    const pos = {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                    };
                    setHighlightPos(pos);
                    calculateTooltipPos(pos);
                }
            }, 100); // 100ms provides a safe buffer for rendering and reflow.

            return () => clearTimeout(timer);
        } else {
            // Handle modal steps that don't have a target element.
            setHighlightPos(null);
        }
    }, [isActive, currentStep, step]);
    
    useEffect(() => {
        if (isActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isActive]);

    const calculateTooltipPos = (targetRect: Position) => {
        const tooltipWidth = 350;
        const tooltipHeight = 200; // Approximate height
        const gap = 15;
        let top = 0, left = 0;

        switch (step.position) {
            case 'top':
                top = targetRect.top - tooltipHeight - gap;
                left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
                break;
            case 'left':
                top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
                left = targetRect.left - tooltipWidth - gap;
                break;
            case 'right':
                top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
                left = targetRect.left + targetRect.width + gap;
                break;
            case 'bottom':
            default:
                top = targetRect.top + targetRect.height + gap;
                left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
                break;
        }

        // Adjust for viewport edges
        if (left < 10) left = 10;
        if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;
        if (top < 10) top = 10;
        if (top + tooltipHeight > window.innerHeight - 10) top = window.innerHeight - tooltipHeight - 10;

        setTooltipPos({ top, left });
    };

    if (!isActive || !step) return null;

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    return (
        <>
            <div className="tutorial-overlay" onClick={isLastStep ? onFinish : onNext}></div>
            {highlightPos && (
                <div
                    className="tutorial-highlight-area"
                    style={{
                        top: `${highlightPos.top - 5}px`,
                        left: `${highlightPos.left - 5}px`,
                        width: `${highlightPos.width + 10}px`,
                        height: `${highlightPos.height + 10}px`,
                    }}
                ></div>
            )}
            <div
                className={`tutorial-tooltip ${!highlightPos ? 'is-modal' : ''}`}
                style={highlightPos ? { top: `${tooltipPos.top}px`, left: `${tooltipPos.left}px` } : {}}
                role="dialog"
                aria-modal="true"
                aria-labelledby="tutorial-title"
                aria-describedby="tutorial-content"
            >
                <h3 id="tutorial-title">{step.title}</h3>
                <p id="tutorial-content">{step.content}</p>
                <div className="tutorial-nav">
                    <span className="tutorial-progress">Step {currentStep + 1} of {steps.length}</span>
                    <div className="tutorial-nav-buttons">
                        {!isFirstStep && (
                            <button className="btn-text" onClick={onPrev}>Previous</button>
                        )}
                        {isLastStep ? (
                             <button className="btn btn-primary" onClick={onFinish}>Finish</button>
                        ) : (
                             <button className="btn btn-primary" onClick={onNext}>Next</button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};