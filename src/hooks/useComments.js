import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { getNodePath } from '../utils/domUtils';

function useComments() {
  const { 
    comments, 
    addComment, 
    updateComment, 
    deleteComment, 
    activeComment, 
    setActiveComment 
  } = useAppContext();
  
  // Create a new comment
  const createComment = useCallback((text, range, editorRef) => {
    if (!editorRef.current) return null;
    
    const rangeRect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();
    
    // Convert range to serializable format
    const rangeInfo = {
      startContainer: getNodePath(range.startContainer, editorRef.current),
      startOffset: range.startOffset,
      endContainer: getNodePath(range.endContainer, editorRef.current),
      endOffset: range.endOffset
    };
    
    // Position relative to editor
    const position = {
      top: rangeRect.top - editorRect.top,
      left: editorRect.right - editorRect.left + 20
    };
    
    // Add the comment
    return addComment(text, rangeInfo, position);
  }, [addComment]);
  
  // Show a comment
  const showComment = useCallback((commentId) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setActiveComment(comment);
    }
  }, [comments, setActiveComment]);
  
  // Hide the active comment
  const hideComment = useCallback(() => {
    setActiveComment(null);
  }, [setActiveComment]);
  
  // Edit a comment
  const editActiveComment = useCallback((text) => {
    if (activeComment) {
      updateComment(activeComment.id, text);
      setActiveComment(prev => ({...prev, text}));
    }
  }, [activeComment, updateComment, setActiveComment]);
  
  // Delete the active comment
  const deleteActiveComment = useCallback(() => {
    if (activeComment) {
      deleteComment(activeComment.id);
      setActiveComment(null);
    }
  }, [activeComment, deleteComment, setActiveComment]);
  
  return {
    comments,
    activeComment,
    createComment,
    showComment,
    hideComment,
    editActiveComment,
    deleteActiveComment
  };
}

export default useComments;