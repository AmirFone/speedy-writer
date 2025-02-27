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
    selection
  } = useAppContext();
  
  const { editorRef } = useEditor();
  const { createComment } = useComments();
  const { startRecording, stopRecording } = useSpeechToText();
  
  const { elementRef, handleMouseDown } = useDraggable(toolbarPosition, (newPosition) => {
    setToolbarPosition(newPosition);
  });
  
  // Handle speech-to-text
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
  
  // AI Rewrite handler
  const handleAIRewrite = () => {
    if (selection && selection.text && selection.text.trim() !== '') {
      startAIRewrite(selection.text);
    } else {
      showToast('Please select text to rewrite', 'warning');
    }
  };
  
  // Speech-to-text handler
  const handleSpeechToText = () => {
    if (isRecording) {
      stopSpeechRecording();
    } else {
      startSpeechRecording();
    }
  };
  
  // Comment handler
  const handleAddComment = () => {
    if (!selection) {
      showToast('Please place cursor where you want to add a comment', 'warning');
      return;
    }
    
    // Prompt for comment text
    const commentText = prompt('Enter your comment:');
    if (!commentText || !commentText.trim()) return;
    
    // Reconstruct the range
    const range = document.createRange();
    // ... reconstruct range using selection data
    
    // Create the comment
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