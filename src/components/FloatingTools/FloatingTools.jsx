import { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import useEditor from '../../hooks/useEditor';
import useSpeechToText from '../../hooks/useSpeechToText';
import useDraggable from '../../hooks/useDraggable';
import useComments from '../../hooks/useComments';
import './FloatingTools.css';

function FloatingTools() {
  const { 
    isToolbarCollapsed, 
    toggleFloatingToolbar, 
    toolbarPosition, 
    setToolbarPosition,
    startAIRewrite,
    startSpeechRecording,
    stopSpeechRecording,
    isRecording,
    selection,
    showToast
  } = useAppContext();

  const { editorRef } = useEditor();
  const { createComment } = useComments();
  const { startRecording, stopRecording } = useSpeechToText();

  const { elementRef, handleMouseDown } = useDraggable(toolbarPosition, (newPosition) => {
    setToolbarPosition(newPosition);
  });

  // Start or stop speech recognition
  useEffect(() => {
    if (isRecording) {
      startRecording((text, isPartial) => {
        // Only insert final transcripts
        if (!isPartial) {
          document.execCommand('insertText', false, text);
        }
      });
    }
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording, startRecording, stopRecording]);

  // Handle AI rewrite
  const handleAIRewrite = () => {
    if (selection && selection.text && selection.text.trim() !== '') {
      startAIRewrite(selection.text);
    } else {
      showToast('Please select text to rewrite', 'warning');
    }
  };

  // Handle speech button
  const handleSpeechToText = () => {
    if (isRecording) {
      stopSpeechRecording();
    } else {
      startSpeechRecording();
    }
  };

  // Handle adding a comment
  const handleAddComment = () => {
    if (!selection) {
      showToast('Please place cursor where you want to add a comment', 'warning');
      return;
    }
    const commentText = prompt('Enter your comment:');
    if (!commentText || !commentText.trim()) return;

    // If needed, reconstruct the range from selection
    const range = document.createRange();
    // ... you can reconstruct the exact range if you want, but for now we use a blank range
    createComment(commentText, range, editorRef);
  };

  return (
    <div 
      ref={elementRef}
      className={`floating-tools ${isToolbarCollapsed ? 'collapsed' : ''}`}
      style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
    >
      <div 
        className="floating-tools-toggle" 
        onClick={toggleFloatingToolbar}
      >
        <i className={`fas ${isToolbarCollapsed ? 'fa-ellipsis-h' : 'fa-plus'}`}></i>
      </div>
      
      <div className="floating-tools-inner">
        <div 
          className="floating-tools-handle" 
          onMouseDown={handleMouseDown}
        >
          <i className="fas fa-grip-lines"></i>
        </div>
        
        <div 
          className="floating-tool" 
          title="AI Rewrite"
          onClick={handleAIRewrite}
        >
          <i className="fas fa-robot"></i>
          <span className="shortcut-tooltip">
            AI Rewrite <span className="kbd">Ctrl</span>+<span className="kbd">R</span>
          </span>
        </div>
        
        <div 
          className={`floating-tool ${isRecording ? 'recording' : ''}`} 
          title="Speech to Text"
          onClick={handleSpeechToText}
        >
          <i className={`fas ${isRecording ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
          <span className="shortcut-tooltip">
            Speech to Text <span className="kbd">Ctrl</span>+<span className="kbd">D</span>
          </span>
        </div>
        
        <div 
          className="floating-tool" 
          title="Add Comment"
          onClick={handleAddComment}
        >
          <i className="fas fa-comment-alt"></i>
          <span className="shortcut-tooltip">
            Add Comment <span className="kbd">Ctrl</span>+<span className="kbd">/</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default FloatingTools;