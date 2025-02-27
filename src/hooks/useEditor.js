import { useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { getNodePath, reconstructRange } from '../utils/domUtils';

function useEditor() {
  const editorRef = useRef(null);
  const { 
    content,
    setContent,
    updateCounts,
    setSelection
  } = useAppContext();

  // Execute editor command with improved selection handling
  const execCommand = useCallback((command, value = null) => {
    if (!editorRef.current) return;

    // Save current selection
    const selection = window.getSelection();
    let savedRange = null;
    if (selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0).cloneRange();
    } else {
      savedRange = document.createRange();
      savedRange.selectNodeContents(editorRef.current);
      savedRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }

    // For createLink, prompt if value not provided
    if (command === 'createLink' && !value) {
      value = prompt('Enter link URL:');
      if (!value) return;
    } else if (command === 'formatBlock') {
      value = value.includes('<') ? value : `<${value}>`;
    }

    // Restore selection before executing command
    selection.removeAllRanges();
    selection.addRange(savedRange);

    try {
      document.execCommand(command, false, value);
    } catch (error) {
      console.error('ExecCommand error:', error);
    }

    // Update content and counts
    setContent(editorRef.current.innerHTML);
    updateCounts(editorRef.current.innerText || '');

    // Ensure editor retains focus after a short delay
    setTimeout(() => {
      editorRef.current.focus();
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }, 50);
  }, [setContent, updateCounts]);

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

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
      }
    };

    if (!editorRef.current.innerHTML.trim()) {
      editorRef.current.innerHTML = content;
    }

    updateCounts(editorRef.current.innerText || '');

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

  const focusEditor = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const insertText = useCallback((text) => {
    if (!editorRef.current) return;
    execCommand('insertText', text);
  }, [execCommand]);

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