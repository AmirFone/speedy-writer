import { useState, useEffect, useCallback, useRef } from 'react';

function useDraggable(initialPosition, onPositionChange) {
  const [position, setPosition] = useState(initialPosition);
  const elementRef = useRef(null);
  const draggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ top: 0, left: 0 });
  
  // Start dragging
  const handleMouseDown = useCallback((e) => {
    if (!elementRef.current) return;
    
    draggingRef.current = true;
    
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY
    };
    
    const rect = elementRef.current.getBoundingClientRect();
    initialPosRef.current = {
      top: rect.top,
      left: rect.left
    };
    
    if (elementRef.current.style) {
      elementRef.current.style.transition = 'none';
    }
    
    e.preventDefault(); // Prevent text selection
  }, []);
  
  // Handle mouse movement
  const handleMouseMove = useCallback((e) => {
    if (!draggingRef.current || !elementRef.current) return;
    
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    
    const newTop = Math.max(60, Math.min(window.innerHeight - 200, initialPosRef.current.top + deltaY));
    const newLeft = Math.max(10, Math.min(window.innerWidth - 100, initialPosRef.current.left + deltaX));
    
    setPosition({
      top: newTop,
      left: newLeft
    });
    
    if (elementRef.current.style) {
      elementRef.current.style.top = `${newTop}px`;
      elementRef.current.style.left = `${newLeft}px`;
    }
  }, []);
  
  // End dragging
  const handleMouseUp = useCallback(() => {
    if (!draggingRef.current) return;
    
    draggingRef.current = false;
    
    if (elementRef.current && elementRef.current.style) {
      elementRef.current.style.transition = 'all 0.2s ease';
    }
    
    // Notify parent about position change
    if (onPositionChange) {
      onPositionChange(position);
    }
  }, [onPositionChange, position]);
  
  // Set up event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  // Apply initial position
  useEffect(() => {
    if (elementRef.current && elementRef.current.style) {
      elementRef.current.style.top = `${initialPosition.top}px`;
      elementRef.current.style.left = `${initialPosition.left}px`;
    }
  }, [initialPosition]);
  
  return {
    elementRef,
    position,
    handleMouseDown
  };
}

export default useDraggable;