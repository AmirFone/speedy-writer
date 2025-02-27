import { useRef, useEffect, useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { getNodePath, reconstructRange } from '../utils/domUtils';

function useEditor() {
  const editorRef = useRef(null);
  const { 
    content,
    setContent,
    updateCounts,
    saveContent,
    setSelection
  } = useAppContext();
  
  // Execute editor command - FIXED VERSION
  const execCommand = useCallback((command, value = null) => {
    if (!editorRef.current) return;
    
    // Make sure editor has focus
    editorRef.current.focus();
    
    // Save current selection if needed
    const selection = window.getSelection();
    let savedRange = null;
    
    if (selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0).cloneRange();
    } else {
      // If no selection, create one at the end of the editor
      savedRange = document.createRange();
      savedRange.selectNodeContents(editorRef.current);
      savedRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }
    
    // Special handling for specific commands
    if (command === 'createLink' && !value) {
      value = prompt('Enter link URL:');
      if (!value) return;
    } else if (command === 'formatBlock') {
      // Format block needs proper tags
      value = value.includes('<') ? value : `<${value}>`;
    }
    
    // Execute the command directly
    document.execCommand(command, false, value);
    
    // Update content after command execution
    setContent(editorRef.current.innerHTML);
    updateCounts(editorRef.current.innerText || '');
    
    // Force a rerender if needed by touching the DOM
    const tempRange = document.createRange();
    tempRange.selectNodeContents(editorRef.current);
    tempRange.detach();
    
    // Maintain focus
    editorRef.current.focus();
  }, [setContent, updateCounts]);
  
  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;
    
    const handleInput = () => {
      setContent(editorRef.current.innerHTML);
      updateCounts(editorRef.current.innerText || '');
    };
    
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Store selection if it's within the editor
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          const rangeInfo = {
            startContainer: getNodePath(range.startContainer, editorRef.current),
            startOffset: range.startOffset,
            endContainer: getNodePath(range.endContainer, editorRef.current),
            endOffset: range.endOffset,
            text: range.toString()
          };
          
          setSelection(rangeInfo);
        }
      }
    };
    
    // Make editable div behave more like a textarea
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
      }
    };
    
    // Set initial content if editor is empty
    if (!editorRef.current.innerHTML.trim()) {
      editorRef.current.innerHTML = content;
    }
    
    // Update counts on initialization
    updateCounts(editorRef.current.innerText || '');
    
    // Add event listeners
    editorRef.current.addEventListener('input', handleInput);
    editorRef.current.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      if (editorRef.current) {
        editorRef.current.removeEventListener('input', handleInput);
        editorRef.current.removeEventListener('keydown', handleKeyDown);
      }
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [content, setContent, updateCounts, setSelection]);
  
  // Focus editor (used when initializing or after operations)
  const focusEditor = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);
  
  // Insert text at current selection
  const insertText = useCallback((text) => {
    if (!editorRef.current) return;
    
    execCommand('insertText', text);
  }, [execCommand]);
  
  // Apply a stored selection
  const applySelection = useCallback((rangeInfo) => {
    if (!editorRef.current || !rangeInfo) return false;
    
    try {
      const range = reconstructRange(rangeInfo, editorRef.current);
      if (range) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        return true;
      }
    } catch (error) {
      console.error('Error applying selection', error);
    }
    
    return false;
  }, []);
  
  return {
    editorRef,
    execCommand,
    focusEditor,
    insertText,
    applySelection
  };
}

export default useEditor;