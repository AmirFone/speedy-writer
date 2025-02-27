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

  // Focus editor on mount (only once)
  useEffect(() => {
    focusEditor();
  }, [focusEditor]);

  // Initialize the editor’s HTML once on mount if empty
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML.trim()) {
      editorRef.current.innerHTML = content;
    }
  }, [content, editorRef]);

  // This effect (and the one inside useEditor) handle input/selection changes
  // without re‐applying dangerouslySetInnerHTML each time.

  return (
    <div className="editor-container" ref={containerRef}>
      <div
        ref={editorRef}
        className="paper"
        contentEditable="true"
        spellCheck="true"
      />
      
      {/* Render comment markers */}
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