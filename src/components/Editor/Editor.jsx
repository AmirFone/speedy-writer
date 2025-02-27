// src/components/Editor/Editor.jsx
import { useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import useEditor from '../../hooks/useEditor';
import useComments from '../../hooks/useComments';
import CommentMarker from '../Comments/CommentMarker';
import './Editor.css';

function Editor() {
  const { editorRef, focusEditor } = useEditor();
  const { comments } = useComments();
  const { content, setContent, updateCounts } = useAppContext();
  const containerRef = useRef(null);
  
  // Focus editor on mount
  useEffect(() => {
    focusEditor();
  }, [focusEditor]);
  
  // Monitor editor for growth needs
  useEffect(() => {
    if (!editorRef.current) return;
    
    // Check if we need to expand the editor
    const checkEditorHeight = () => {
      if (editorRef.current) {
        const scrollHeight = editorRef.current.scrollHeight;
        const clientHeight = editorRef.current.clientHeight;
        
        if (scrollHeight > clientHeight) {
          editorRef.current.style.minHeight = `${scrollHeight + 200}px`;
        }
      }
    };
    
    // Set up a mutation observer to watch for content changes
    const observer = new MutationObserver(checkEditorHeight);
    observer.observe(editorRef.current, { 
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true 
    });
    
    // Also check on key/input events
    const handleEvents = () => {
      checkEditorHeight();
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
        updateCounts(editorRef.current.innerText || '');
      }
    };
    
    editorRef.current.addEventListener('input', handleEvents);
    editorRef.current.addEventListener('keyup', handleEvents);
    
    // Initial check
    checkEditorHeight();
    
    return () => {
      observer.disconnect();
      if (editorRef.current) {
        editorRef.current.removeEventListener('input', handleEvents);
        editorRef.current.removeEventListener('keyup', handleEvents);
      }
    };
  }, [editorRef, setContent, updateCounts]);
  
  return (
    <div className="editor-container" ref={containerRef}>
      <div
        ref={editorRef}
        className="paper"
        contentEditable="true"
        spellCheck="true"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
      {/* Comment markers */}
      {comments.map(comment => (
        <CommentMarker 
          key={comment.id} 
          comment={comment}
        />
      ))}
    </div>
  );
}

export default Editor;