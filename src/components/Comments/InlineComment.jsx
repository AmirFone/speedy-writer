import { useState } from 'react';
import useComments from '../../hooks/useComments';
import './Comments.css';

function InlineComment({ comment }) {
  const { hideComment, editActiveComment, deleteActiveComment } = useComments();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  
  // Format timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Handle comment edit
  const handleSaveEdit = () => {
    if (editText.trim() === '') return;
    
    editActiveComment(editText);
    setIsEditing(false);
  };
  
  // Handle edit cancel
  const handleCancelEdit = () => {
    setEditText(comment.text);
    setIsEditing(false);
  };
  
  // Delete and close
  const handleDelete = () => {
    deleteActiveComment();
  };
  
  return (
    <div 
      className="inline-comment"
      style={{
        top: comment.position.top - 20,
        left: comment.position.left + 30
      }}
    >
      <div className="inline-comment-header">
        <div className="inline-comment-title">Comment #{comment.id}</div>
        <button className="inline-comment-close" onClick={hideComment}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="inline-comment-body">
        <div className="inline-comment-timestamp">
          {formatDate(comment.timestamp)}
        </div>
        
        {isEditing ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            autoFocus
          />
        ) : (
          <div className="inline-comment-text">
            {comment.text}
          </div>
        )}
      </div>
      
      <div className="inline-comment-footer">
        {isEditing ? (
          <>
            <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>
              <i className="fas fa-times"></i> Cancel
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>
              <i className="fas fa-save"></i> Save
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-secondary btn-sm" onClick={handleDelete}>
              <i className="fas fa-trash"></i> Delete
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>
              <i className="fas fa-edit"></i> Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default InlineComment;