// src/contexts/ViewNavigationContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ViewState } from '../types';

interface ViewNavigationContextType {
    viewState: ViewState;
    zoomTransition: boolean;
    navigationHistory: ViewState[];
    zoomToPatio: (patioId: string) => void;
    zoomToBloque: (patioId: string, bloqueId: string) => void;
    zoomOut: () => void;
    zoomToTerminal: () => void;
    getNavigationPath: () => string[];
}

const ViewNavigationContext = createContext<ViewNavigationContextType | null>(null);

interface ViewNavigationProviderProps {
    children: ReactNode;
}

export const ViewNavigationProvider: React.FC<ViewNavigationProviderProps> = ({ children }) => {
    const [viewState, setViewState] = useState<ViewState>({
        level: 'terminal'
    });

    const [zoomTransition, setZoomTransition] = useState(false);
    const [navigationHistory, setNavigationHistory] = useState<ViewState[]>([]);

    // Navegar a vista de patio - SIN setTimeout
    const zoomToPatio = useCallback((patioId: string) => {
        console.log('🔍 [CONTEXT] zoomToPatio llamado con:', patioId);

        setNavigationHistory(prev => [...prev, viewState]);

        const newState = {
            level: 'patio' as const,
            selectedPatio: patioId
        };

        console.log('🔍 [CONTEXT] Actualizando estado a:', newState);
        setViewState(newState);
    }, [viewState]);

    // Navegar a vista de bloque
    const zoomToBloque = useCallback((patioId: string, bloqueId: string) => {
        setNavigationHistory(prev => [...prev, viewState]);

        setViewState({
            level: 'bloque',
            selectedPatio: patioId,
            selectedBloque: bloqueId
        });
    }, [viewState]);

    // Volver al nivel anterior
    const zoomOut = useCallback(() => {
        if (navigationHistory.length > 0) {
            const previousState = navigationHistory[navigationHistory.length - 1];
            setNavigationHistory(prev => prev.slice(0, -1));
            setViewState(previousState);
        } else {
            if (viewState.level === 'bloque') {
                setViewState({
                    level: 'patio',
                    selectedPatio: viewState.selectedPatio
                });
            } else if (viewState.level === 'patio') {
                setViewState({
                    level: 'terminal'
                });
            }
        }
    }, [viewState, navigationHistory]);

    // Ir directamente a terminal
    const zoomToTerminal = useCallback(() => {
        setNavigationHistory([]);
        setViewState({
            level: 'terminal'
        });
    }, []);

    // Obtener el path de navegación
    const getNavigationPath = useCallback(() => {
        const path = ['Terminal'];

        if (viewState.selectedPatio) {
            path.push(viewState.selectedPatio);
        }

        if (viewState.selectedBloque) {
            path.push(viewState.selectedBloque);
        }

        return path;
    }, [viewState]);

    return (
        <ViewNavigationContext.Provider value={{
            viewState,
            zoomTransition,
            navigationHistory,
            zoomToPatio,
            zoomToBloque,
            zoomOut,
            zoomToTerminal,
            getNavigationPath
        }}>
            {children}
        </ViewNavigationContext.Provider>
    );
};

export const useViewNavigation = () => {
    const context = useContext(ViewNavigationContext);
    if (!context) {
        throw new Error('useViewNavigation must be used within ViewNavigationProvider');
    }
    return context;
};