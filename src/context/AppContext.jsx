import { createContext, useContext, useEffect, useState, useRef } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Theme
  const [isDarkMode, setIsDarkMode] = useLocalStorage('speedyWriter_darkMode', false);
  
  // Editor content
  const [content, setContent] = useLocalStorage('speedyWriter_content', '<p>Start writing your essay here or use the features in the floating menu.</p><p>You can format your text with the toolbar at the top. Try selecting some text and formatting it!</p><p>Hover over any button to see the keyboard shortcut.</p>');
  const [lastSavedContent, setLastSavedContent] = useState(content);
  const [isSaved, setIsSaved] = useState(true);
  
  // Word count
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  
  // Floating tools
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useLocalStorage('speedyWriter_toolbarCollapsed', false);
  const [toolbarPosition, setToolbarPosition] = useLocalStorage('speedyWriter_toolsPosition', { top: 100, left: window.innerWidth - 80 });
  
  // Selection
  const [selection, setSelection] = useState(null);
  
  // Modals
  const [showAIRewriteModal, setShowAIRewriteModal] = useState(false);
  const [showAnthropicKeyModal, setShowAnthropicKeyModal] = useState(false);
  const [showAssemblyAIKeyModal, setShowAssemblyAIKeyModal] = useState(false);
  
  // API Keys
  const [anthropicApiKey, setAnthropicApiKey] = useLocalStorage('speedyWriter_anthropicApiKey', '');
  const [assemblyAIApiKey, setAssemblyAIApiKey] = useLocalStorage('speedyWriter_assemblyAIApiKey', '');
  
  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Speech
  const [isRecording, setIsRecording] = useState(false);
  
  // Comments
  const [comments, setComments] = useLocalStorage('speedyWriter_comments', []);
  const [commentCount, setCommentCount] = useState(0);
  const [activeComment, setActiveComment] = useState(null);
  
  // AI Rewrite state
  const [originalText, setOriginalText] = useState('');
  const [aiPrompt, setAIPrompt] = useState('');
  const [suggestedText, setSuggestedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  
  useEffect(() => {
    // Find highest comment ID when loading
    if (comments.length > 0) {
      const maxId = Math.max(...comments.map(c => c.id));
      setCommentCount(maxId);
    }
  }, []);
  
  // Content saving
  useEffect(() => {
    if (content !== lastSavedContent) {
      setIsSaved(false);
      
      // Auto-save after 2 seconds of inactivity
      const saveTimeout = setTimeout(() => {
        setLastSavedContent(content);
        setIsSaved(true);
      }, 2000);
      
      return () => clearTimeout(saveTimeout);
    }
  }, [content, lastSavedContent]);
  
  // Toast timer
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [toast.show]);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
	setIsDarkMode(prev => !prev);
	// Apply dark mode class directly to document.body for immediate effect
	if (!isDarkMode) {
	  document.body.classList.add('dark-mode');
	} else {
	  document.body.classList.remove('dark-mode');
	}
	showToast(`${!isDarkMode ? 'Dark' : 'Light'} mode enabled`, 'info');
      };
 // Also add this effect to sync body class with state
useEffect(() => {
	if (isDarkMode) {
	  document.body.classList.add('dark-mode');
	} else {
	  document.body.classList.remove('dark-mode');
	}
      }, [isDarkMode]); 
  // Save content
  const saveContent = () => {
    setLastSavedContent(content);
    setIsSaved(true);
    showToast('Document saved', 'success');
  };
  
  // Toggle floating toolbar
  const toggleFloatingToolbar = () => {
    setIsToolbarCollapsed(prev => !prev);
  };
  
  // Show toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };
  
  // Update word and character counts
  const updateCounts = (text) => {
    const plainText = text || '';
    const words = plainText.match(/\S+/g) || [];
    const chars = plainText.replace(/\s+/g, '').split('');
    
    setWordCount(words.length);
    setCharCount(chars.length);
  };
  
  // AI Rewrite
  const startAIRewrite = (text) => {
    if (!anthropicApiKey) {
      setShowAnthropicKeyModal(true);
      return;
    }
    
    setOriginalText(text);
    setShowAIRewriteModal(true);
  };
  
  // Save API key
  const saveAPIKey = (service, key) => {
    if (service === 'anthropic') {
      setAnthropicApiKey(key);
      setShowAnthropicKeyModal(false);
      showToast('Anthropic API key saved', 'success');
    } else if (service === 'assemblyAI') {
      setAssemblyAIApiKey(key);
      setShowAssemblyAIKeyModal(false);
      showToast('AssemblyAI API key saved', 'success');
    }
  };
  
  // Start recording
  const startSpeechRecording = () => {
    if (!assemblyAIApiKey) {
      setShowAssemblyAIKeyModal(true);
      return;
    }
    
    setIsRecording(true);
  };
  
  // Stop recording
  const stopSpeechRecording = () => {
    setIsRecording(false);
  };
  
  // Add a comment
  const addComment = (text, range, position) => {
    const newId = commentCount + 1;
    const newComment = {
      id: newId,
      text,
      position,
      rangeInfo: range,
      timestamp: new Date().toISOString()
    };
    
    setComments(prev => [...prev, newComment]);
    setCommentCount(newId);
    showToast('Comment added', 'success');
    
    return newComment;
  };
  
  // Update a comment
  const updateComment = (id, text) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === id ? { ...comment, text } : comment
      )
    );
    showToast('Comment updated', 'success');
  };
  
  // Delete a comment
  const deleteComment = (id) => {
    setComments(prev => prev.filter(comment => comment.id !== id));
    showToast('Comment deleted', 'success');
  };
  
  return (
    <AppContext.Provider value={{
      isDarkMode,
      toggleDarkMode,
      content,
      setContent,
      isSaved,
      wordCount,
      charCount,
      updateCounts,
      saveContent,
      isToolbarCollapsed,
      toggleFloatingToolbar,
      toolbarPosition,
      setToolbarPosition,
      selection,
      setSelection,
      showAIRewriteModal,
      setShowAIRewriteModal,
      showAnthropicKeyModal,
      setShowAnthropicKeyModal,
      showAssemblyAIKeyModal,
      setShowAssemblyAIKeyModal,
      anthropicApiKey,
      assemblyAIApiKey,
      saveAPIKey,
      toast,
      showToast,
      isRecording,
      startSpeechRecording,
      stopSpeechRecording,
      comments,
      addComment,
      updateComment,
      deleteComment,
      commentCount,
      activeComment,
      setActiveComment,
      originalText,
      setOriginalText,
      aiPrompt,
      setAIPrompt,
      suggestedText,
      setSuggestedText,
      isGenerating,
      setIsGenerating,
      showDiff,
      setShowDiff,
      startAIRewrite
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);