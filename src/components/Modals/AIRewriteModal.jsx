import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import useAIRewrite from '../../hooks/useAIRewrite';
import useEditor from '../../hooks/useEditor';
import './Modals.css';

function AIRewriteModal() {
  const { 
    showAIRewriteModal, 
    setShowAIRewriteModal,
    originalText,
    aiPrompt,
    setAIPrompt,
    suggestedText,
    isGenerating,
    showDiff,
    setShowDiff,
    setIsGenerating
  } = useAppContext();
  
  const { generateRewrite } = useAIRewrite();
  const { applySelection } = useEditor();
  
  const [showApplyButton, setShowApplyButton] = useState(false);
  
  // Reset state when modal closes
  useEffect(() => {
    if (!showAIRewriteModal) {
      setShowApplyButton(false);
      setAIPrompt('');
      setShowDiff(false);
    }
  }, [showAIRewriteModal, setAIPrompt, setShowDiff]);
  
  // Show apply button when generation completes
  useEffect(() => {
    if (suggestedText && !isGenerating) {
      setShowApplyButton(true);
    } else {
      setShowApplyButton(false);
    }
  }, [suggestedText, isGenerating]);
  
  // Generate rewrite
  const handleSubmit = async () => {
    setIsGenerating(true);
    try {
      await generateRewrite(originalText, aiPrompt || 'Improve this text');
    } catch (error) {
      console.error(error);
    }
  };
  
  // Apply suggested text to editor
  const handleApply = () => {
    if (suggestedText) {
      document.execCommand('insertText', false, suggestedText);
      setShowAIRewriteModal(false);
    }
  };
  
  // Regenerate suggestion
  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      await generateRewrite(originalText, aiPrompt || 'Improve this text');
    } catch (error) {
      console.error(error);
    }
  };
  
  if (!showAIRewriteModal) return null;
  
  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">AI Rewrite with Claude</h3>
          <button className="close-modal" onClick={() => setShowAIRewriteModal(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <label>Selected text:</label>
          <div className="selected-text-preview">
            {originalText}
          </div>
          
          <label htmlFor="aiPrompt">How would you like to improve this text?</label>
          <textarea
            id="aiPrompt"
            value={aiPrompt}
            onChange={(e) => setAIPrompt(e.target.value)}
            placeholder="E.g., Make it more formal, simplify it, make it more persuasive..."
            disabled={isGenerating}
          />
          
          {showDiff && (
            <div className="diff-container">
              <div className="diff-title">Suggestion:</div>
              <div className="diff-original">
                <span className="diff-label">Original</span>
                <div>{originalText}</div>
              </div>
              <div className="diff-suggested">
                <span className="diff-label">Suggested</span>
                <div>{suggestedText || (isGenerating && 'Generating...')}</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowAIRewriteModal(false)}
          >
            Cancel
          </button>
          
          {!showApplyButton ? (
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="spinner"></span> Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-magic"></i> Generate
                </>
              )}
            </button>
          ) : (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={handleRegenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner"></span> Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync-alt"></i> Regenerate
                  </>
                )}
              </button>
              
              <button 
                className="btn btn-primary" 
                onClick={handleApply}
              >
                <i className="fas fa-check"></i> Apply
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIRewriteModal;