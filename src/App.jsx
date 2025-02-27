import { useEffect, useState } from 'react';
import Editor from './components/Editor/Editor';
import Toolbar from './components/Toolbar/Toolbar';
import FloatingTools from './components/FloatingTools/FloatingTools';
import AIRewriteModal from './components/Modals/AIRewriteModal';
import APIKeyModal from './components/Modals/APIKeyModal';
import Toast from './components/UI/Toast';
import StatusBar from './components/UI/StatusBar';
import RecordingIndicator from './components/UI/RecordingIndicator';
import { useAppContext } from './context/AppContext';
import './styles/variables.css';

function App() {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    showAnthropicKeyModal, 
    showAssemblyAIKeyModal,
    isRecording,
    toast
  } = useAppContext();
  
  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
     <header className="app-header">
  <div className="logo">
    <i className="fas fa-bolt"></i> SpeedyWriter
  </div>
  <div className="header-actions">
    <div className="theme-toggle" onClick={toggleDarkMode}>
      {isDarkMode ? (
        <i className="fas fa-sun theme-toggle-icon"></i>
      ) : (
        <i className="fas fa-moon theme-toggle-icon"></i>
      )}
      <span className="theme-toggle-label">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
    </div>
  </div>
</header>
      
      <Toolbar />
      
      <div className="main-container">
        <Editor />
        <FloatingTools />
      </div>
      
      <StatusBar />
      
      {isRecording && <RecordingIndicator />}
      
      {showAnthropicKeyModal && (
        <APIKeyModal 
          title="Anthropic API Key Required" 
          service="anthropic" 
          placeholder="sk-ant-..."
        />
      )}
      
      {showAssemblyAIKeyModal && (
        <APIKeyModal 
          title="AssemblyAI API Key Required" 
          service="assemblyAI" 
          placeholder="Your AssemblyAI API key"
        />
      )}
      
      <AIRewriteModal />
      
      {toast.show && <Toast />}
    </div>
  );
}

export default App;