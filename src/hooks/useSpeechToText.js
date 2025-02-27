import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

function useSpeechToText() {
  const { 
    assemblyAIApiKey, 
    isRecording, 
    stopSpeechRecording, 
    showToast 
  } = useAppContext();
  
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  
  const websocketRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  
  // Start AssemblyAI WebSocket connection
  const startRecording = useCallback(async (onTranscript) => {
    try {
      // Request microphone access
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      processorRef.current = audioContextRef.current.createScriptProcessor(1024, 1, 1);
      
      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
      
      // Create WebSocket connection
      websocketRef.current = new WebSocket('wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000');
      
      websocketRef.current.onopen = () => {
        // Send authentication
        websocketRef.current.send(JSON.stringify({ token: assemblyAIApiKey }));
        showToast('Voice recording started', 'info');
      };
      
      websocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.message_type === 'FinalTranscript') {
          if (data.text) {
            setTranscript(prev => prev + data.text + ' ');
            onTranscript(data.text + ' ', false);
            setPartialTranscript('');
          }
        } else if (data.message_type === 'PartialTranscript') {
          if (data.text) {
            setPartialTranscript(data.text);
            onTranscript(data.text, true);
          }
        } else if (data.message_type === 'Error') {
          console.error('AssemblyAI error', data);
          showToast('AssemblyAI error: ' + (data.error || 'Unknown error'), 'error');
          stopRecording();
        }
      };
      
      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error', error);
        showToast('WebSocket error: ' + (error.message || 'Unknown error'), 'error');
        stopRecording();
      };
      
      websocketRef.current.onclose = () => {
        stopRecording();
      };
      
      // Convert to 16-bit PCM and send audio data
      processorRef.current.onaudioprocess = (e) => {
        if (!isRecording || !websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) return;
        
        // Get audio data
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convert to 16-bit PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Send to AssemblyAI
        if (websocketRef.current.readyState === WebSocket.OPEN) {
          websocketRef.current.send(pcmData.buffer);
        }
      };
      
      return true;
    } catch (error) {
      console.error('Error starting AssemblyAI', error);
      showToast('Error starting speech recording: ' + error.message, 'error');
      return false;
    }
  }, [assemblyAIApiKey, isRecording, showToast, stopSpeechRecording]);
  
  // Stop recording and cleanup
  const stopRecording = useCallback(() => {
    // Clean up WebSocket
    if (websocketRef.current) {
      if (websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({ terminate_session: true }));
      }
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    // Clean up audio processor
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Stop microphone
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    setPartialTranscript('');
    stopSpeechRecording();
    showToast('Voice recording stopped', 'success');
  }, [showToast, stopSpeechRecording]);
  
  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording, stopRecording]);
  
  return {
    transcript,
    partialTranscript,
    startRecording,
    stopRecording
  };
}

export default useSpeechToText;