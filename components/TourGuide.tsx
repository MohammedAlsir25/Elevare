import React, { useEffect, useState, useRef } from 'react';
import { useTour } from '../contexts/TourContext.tsx';
import { tourSteps } from '../tourSteps.ts';

const TourGuide: React.FC = () => {
    const { isTourOpen, currentStepIndex, stopTour, nextStep, prevStep } = useTour();
    const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isTourOpen) {
            if (currentStepIndex >= tourSteps.length) {
                stopTour();
                return;
            }

            const currentStep = tourSteps[currentStepIndex];
            const element = document.querySelector<HTMLElement>(currentStep.selector);
            setHighlightedElement(element);

            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        } else {
            setHighlightedElement(null);
        }
    }, [isTourOpen, currentStepIndex, stopTour]);

    if (!isTourOpen || !highlightedElement) return null;

    const { title, content, placement } = tourSteps[currentStepIndex];
    const rect = highlightedElement.getBoundingClientRect();

    const popoverStyle: React.CSSProperties = {};
    const arrowStyle: React.CSSProperties = {};
    const popoverMargin = 12;

    switch (placement) {
        case 'right':
            popoverStyle.top = rect.top;
            popoverStyle.left = rect.right + popoverMargin;
            arrowStyle.top = '1rem';
            arrowStyle.right = '100%';
            arrowStyle.borderRightColor = 'rgb(var(--color-brand-primary-rgb))';
            break;
        case 'left':
            popoverStyle.top = rect.top;
            popoverStyle.right = window.innerWidth - rect.left + popoverMargin;
            arrowStyle.top = '1rem';
            arrowStyle.left = '100%';
            arrowStyle.borderLeftColor = 'rgb(var(--color-brand-primary-rgb))';
            break;
        case 'bottom':
            popoverStyle.top = rect.bottom + popoverMargin;
            popoverStyle.left = rect.left + rect.width / 2;
            popoverStyle.transform = 'translateX(-50%)';
            arrowStyle.bottom = '100%';
            arrowStyle.left = '50%';
            arrowStyle.transform = 'translateX(-50%)';
            arrowStyle.borderBottomColor = 'rgb(var(--color-brand-primary-rgb))';
            break;
        case 'top':
            popoverStyle.bottom = window.innerHeight - rect.top + popoverMargin;
            popoverStyle.left = rect.left + rect.width / 2;
            popoverStyle.transform = 'translateX(-50%)';
            arrowStyle.top = '100%';
            arrowStyle.left = '50%';
            arrowStyle.transform = 'translateX(-50%)';
            arrowStyle.borderTopColor = 'rgb(var(--color-brand-primary-rgb))';
            break;
    }
    

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50"
                style={{
                    clipPath: `path('${`M0 0 H${window.innerWidth} V${window.innerHeight} H0 Z M${rect.left - 4} ${rect.top - 4} H${rect.right + 4} V${rect.bottom + 4} H${rect.left - 4} Z`}')`,
                    transition: 'all 0.3s ease-in-out',
                }}
            />
            
            {/* Highlight Box */}
            <div
                className="absolute border-2 border-brand-primary rounded-md pointer-events-none"
                style={{
                    left: rect.left - 4,
                    top: rect.top - 4,
                    width: rect.width + 8,
                    height: rect.height + 8,
                    transition: 'all 0.3s ease-in-out',
                }}
            />

            {/* Popover */}
            <div
                ref={popoverRef}
                className="absolute bg-brand-primary text-white rounded-lg p-4 w-72 shadow-2xl"
                style={{ ...popoverStyle, transition: 'all 0.3s ease-in-out' }}
                role="dialog"
                aria-labelledby="tour-title"
                aria-describedby="tour-content"
            >
                <div className="absolute border-[8px] border-transparent" style={arrowStyle}></div>
                <h3 id="tour-title" className="text-lg font-bold">{title}</h3>
                <p id="tour-content" className="mt-2 text-sm">{content}</p>
                <div className="mt-4 flex justify-between items-center">
                    <button onClick={stopTour} className="text-sm font-semibold hover:underline">Skip Tour</button>
                    <div className="flex items-center gap-2">
                        {currentStepIndex > 0 && <button onClick={prevStep} className="px-3 py-1 bg-white/20 rounded-md hover:bg-white/30 text-sm">Prev</button>}
                        <button onClick={nextStep} className="px-3 py-1 bg-white text-brand-primary rounded-md font-semibold hover:bg-gray-200 text-sm">
                           {currentStepIndex === tourSteps.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourGuide;
