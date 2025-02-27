import { useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

function useAIRewrite() {
  const { 
    anthropicApiKey, 
    showToast,
    setIsGenerating,
    setShowDiff,
    setSuggestedText
  } = useAppContext();
  
  // Simulated AI rewriting with streaming response
  const generateRewrite = useCallback(async (text, prompt) => {
    if (!anthropicApiKey) {
      throw new Error('Missing Anthropic API key');
    }
    
    setIsGenerating(true);
    setShowDiff(true);
    setSuggestedText('');
    
    try {
      // In a real implementation, this would be an API call to Anthropic's Claude
      let processedText = '';
      
      // Simulate transformations based on prompt
      if (prompt.toLowerCase().includes('formal')) {
        processedText = text.replace(/don't/g, 'do not')
          .replace(/won't/g, 'will not')
          .replace(/can't/g, 'cannot')
          .replace(/I'm/g, 'I am')
          .replace(/you're/g, 'you are')
          .replace(/we're/g, 'we are')
          .replace(/they're/g, 'they are')
          .replace(/let's/g, 'let us')
          .replace(/it's/g, 'it is');
      } else if (prompt.toLowerCase().includes('simple') || prompt.toLowerCase().includes('simplify')) {
        processedText = text.replace(/utilize/g, 'use')
          .replace(/implement/g, 'use')
          .replace(/furthermore/g, 'also')
          .replace(/subsequently/g, 'then')
          .replace(/nevertheless/g, 'however')
          .replace(/commenced/g, 'started')
          .replace(/regarding/g, 'about')
          .replace(/sufficient/g, 'enough');
      } else if (prompt.toLowerCase().includes('persuasive')) {
        processedText = text.replace(/I think/g, 'I strongly believe')
          .replace(/good/g, 'excellent')
          .replace(/bad/g, 'problematic')
          .replace(/important/g, 'crucial')
          .replace(/problem/g, 'challenge')
          .replace(/difficult/g, 'demanding')
          .replace(/big/g, 'significant');
      } else {
        // Generic improvements
        processedText = text.replace(/very /gi, '')
          .replace(/really /gi, '')
          .replace(/just /gi, '')
          .replace(/that /gi, '')
          .replace(/ that/gi, '')
          .replace(/basically/gi, '')
          .replace(/actually/gi, '')
          .replace(/definitely/gi, '')
          .replace(/totally/gi, '')
          .replace(/literally/gi, '');
      }
      
      // Additional refinements
      processedText = processedText.split('. ').map(sentence => 
        sentence.charAt(0).toUpperCase() + sentence.slice(1)
      ).join('. ');
      
      // Add some variance to sentence structure
      const sentences = processedText.split('.');
      if (sentences.length > 1) {
        // Add a connector word to one of the sentence boundaries
        const connectors = ['Furthermore', 'Moreover', 'Additionally', 'In fact', 'Consequently'];
        const randomIndex = Math.floor(Math.random() * (sentences.length - 1));
        const connector = connectors[Math.floor(Math.random() * connectors.length)];
        sentences[randomIndex + 1] = ` ${connector}, ${sentences[randomIndex + 1].trim()}`;
      }
      processedText = sentences.join('.');
      
      // Final clean-up
      processedText = processedText.trim();
      
      // Stream the words with realistic timing
      const words = processedText.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => {
          setTimeout(() => {
            setSuggestedText(prev => {
              const newText = prev ? `${prev} ${words[i]}` : words[i];
              return newText;
            });
            resolve();
          }, 50 + Math.random() * 50); // Randomize timing
        });
      }
      
      setIsGenerating(false);
      return processedText;
    } catch (error) {
      setIsGenerating(false);
      showToast('Error generating AI suggestion: ' + error.message, 'error');
      throw error;
    }
  }, [anthropicApiKey, setIsGenerating, setShowDiff, setSuggestedText, showToast]);
  
  return {
    generateRewrite
  };
}

export default useAIRewrite;