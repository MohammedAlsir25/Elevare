import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

const TOUR_STORAGE_KEY = 'elevare-tour-completed-v1';

interface TourContextType {
    isTourOpen: boolean;
    currentStepIndex: number;
    startTour: () => void;
    stopTour: () => void;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (index: number) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const startTour = useCallback(() => {
        setCurrentStepIndex(0);
        setIsTourOpen(true);
    }, []);

    const stopTour = useCallback(() => {
        setIsTourOpen(false);
        try {
            localStorage.setItem(TOUR_STORAGE_KEY, 'true');
        } catch (error) {
            console.error("Failed to save tour completion status:", error);
        }
    }, []);

    const nextStep = useCallback(() => {
        setCurrentStepIndex(prev => prev + 1);
    }, []);

    const prevStep = useCallback(() => {
        setCurrentStepIndex(prev => Math.max(0, prev - 1));
    }, []);

    const goToStep = useCallback((index: number) => {
        setCurrentStepIndex(index);
    }, []);

    const value = { isTourOpen, currentStepIndex, startTour, stopTour, nextStep, prevStep, goToStep };

    return (
        <TourContext.Provider value={value}>
            {children}
        </TourContext.Provider>
    );
};

export const useTour = (): TourContextType => {
    const context = useContext(TourContext);
    if (context === undefined) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};

// A helper hook to automatically start the tour on the first visit
export const useTourAutoStart = () => {
    const { startTour } = useTour();

    useEffect(() => {
        try {
            const hasCompletedTour = localStorage.getItem(TOUR_STORAGE_KEY);
            if (!hasCompletedTour) {
                // Use a small delay to ensure the UI is fully rendered
                const timer = setTimeout(() => {
                    startTour();
                }, 500);
                return () => clearTimeout(timer);
            }
        } catch (error) {
            console.error("Failed to check tour completion status:", error);
            // Still try to start the tour if localStorage fails
             const timer = setTimeout(() => {
                startTour();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [startTour]);
};
