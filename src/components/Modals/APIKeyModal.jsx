import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import './Modals.css';

function APIKeyModal({ title, service, placeholder }) {
  const [apiKey, setApiKey] = useState('');
  const { 
    saveAPIKey, 
    setShowAnthropicKeyModal, 
    setShowAssemblyAIKeyModal,
    showToast
  } = useAppContext();
  
  // Handle submit
  const handleSubmit = () => {
    if (!apiKey.trim()) {
      showToast('Please enter a valid API key', 'warning');
      return;
    }
    
    saveAPIKey(service, apiKey);
    
    // Close modal
    if (service === 'anthropic') {
      setShowAnthropicKeyModal(false);
    } else {
      setShowAssemblyAIKeyModal(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (service === 'anthropic') {
      setShowAnthropicKeyModal(false);
    } else {
      setShowAssemblyAIKeyModal(false);
    }
  };
  
  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="close-modal" onClick={handleCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <p>
            {service === 'anthropic' ? 
              'To use AI rewriting features, please enter your Anthropic API key. This key will be saved in your browser\'s local storage.' :
              'To use speech-to-text features, please enter your AssemblyAI API key. This key will be saved in your browser\'s local storage.'
            }
          </p>
          
          <label htmlFor={`${service}ApiKey`}>{service === 'anthropic' ? 'Anthropic' : 'AssemblyAI'} API Key:</label>
          <input
            type="password"
            id={`${service}ApiKey`}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={placeholder}
          />
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={handleCancel}
          >
            Cancel
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
          >
            <i className="fas fa-save"></i> Save Key
          </button>
        </div>
      </div>
    </div>
  );
}

export default APIKeyModal;