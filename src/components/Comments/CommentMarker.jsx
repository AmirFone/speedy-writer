import { useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import useComments from '../../hooks/useComments';
import InlineComment from './InlineComment';
import './Comments.css';

function CommentMarker({ comment }) {
  const markerRef = useRef(null);
  const { activeComment } = useAppContext();
  const { showComment } = useComments();
  
  // Position the marker when editor changes size
  useEffect(() => {
    if (!markerRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (markerRef.current) {
        const paperElement = document.querySelector('.paper');
        if (paperElement) {
          const paperRect = paperElement.getBoundingClientRect();
          markerRef.current.style.top = `${comment.position.top}px`;
          markerRef.current.style.left = `${paperRect.right + 10}px`;
        }
      }
    });
    
    const paperElement = document.querySelector('.paper');
    if (paperElement) {
      resizeObserver.observe(paperElement);
    }
    
    return () => {
      if (paperElement) {
        resizeObserver.unobserve(paperElement);
      }
    };
  }, [comment.position]);
  
  return (
    <>
      <div 
        ref={markerRef}
        className="comment-marker"
        onClick={() => showComment(comment.id)}
        title="Click to view comment"
        style={{
          top: comment.position.top,
          left: comment.position.left
        }}
      >
        {comment.id}
      </div>
      
      {activeComment && activeComment.id === comment.id && (
        <InlineComment comment={activeComment} />
      )}
    </>
  );
}

export default CommentMarker;