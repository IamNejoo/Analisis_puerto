import { useState, useCallback } from 'react';
import type { ViewState} from '../types';

export const useViewNavigation = () => {
  const [viewState, setViewState] = useState<ViewState>({
    level: 'terminal'
  });

  const [zoomTransition, setZoomTransition] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<ViewState[]>([]);

  // Navegar a vista de patio
  const zoomToPatio = useCallback((patioId: string) => {
    setNavigationHistory(prev => [...prev, viewState]);
    setZoomTransition(true);
    
    setTimeout(() => {
      setViewState({
        level: 'patio',
        selectedPatio: patioId
      });
      setZoomTransition(false);
    }, 300);
  }, [viewState]);

  // Navegar a vista de bloque
  const zoomToBloque = useCallback((patioId: string, bloqueId: string) => {
    setNavigationHistory(prev => [...prev, viewState]);
    setZoomTransition(true);
    
    setTimeout(() => {
      setViewState({
        level: 'bloque',
        selectedPatio: patioId,
        selectedBloque: bloqueId
      });
      setZoomTransition(false);
    }, 300);
  }, [viewState]);

  // Volver al nivel anterior
  const zoomOut = useCallback(() => {
    if (navigationHistory.length > 0) {
      const previousState = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      
      setZoomTransition(true);
      setTimeout(() => {
        setViewState(previousState);
        setZoomTransition(false);
      }, 300);
    } else {
      // Fallback manual
      setZoomTransition(true);
      setTimeout(() => {
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
        setZoomTransition(false);
      }, 300);
    }
  }, [viewState, navigationHistory]);

  // Ir directamente a terminal
  const zoomToTerminal = useCallback(() => {
    setNavigationHistory([]);
    setZoomTransition(true);
    
    setTimeout(() => {
      setViewState({
        level: 'terminal'
      });
      setZoomTransition(false);
    }, 300);
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

  return {
    viewState,
    zoomTransition,
    navigationHistory,
    zoomToPatio,
    zoomToBloque,
    zoomOut,
    zoomToTerminal,
    getNavigationPath
  };
};