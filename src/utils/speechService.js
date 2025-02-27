/**
 * Handles WebSocket connection and streaming to AssemblyAI
 */
export class AssemblyAISpeechService {
	constructor(apiKey) {
	  this.apiKey = apiKey;
	  this.websocket = null;
	  this.mediaStream = null;
	  this.audioContext = null;
	  this.processor = null;
	  this.isRecording = false;
	  this.onTranscript = null;
	}
	
	/**
	 * Start recording and streaming to AssemblyAI
	 * @param {function} onTranscript - Callback for transcript events
	 * @returns {Promise<boolean>} - Success indicator
	 */
	async start(onTranscript) {
	  if (!this.apiKey) {
	    throw new Error('API key is required');
	  }
	  
	  this.onTranscript = onTranscript;
	  
	  try {
	    // Request microphone access
	    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
	    
	    // Create audio context
	    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
	    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
	    this.processor = this.audioContext.createScriptProcessor(1024, 1, 1);
	    
	    source.connect(this.processor);
	    this.processor.connect(this.audioContext.destination);
	    
	    // Create WebSocket connection
	    this.websocket = new WebSocket('wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000');
	    
	    this.websocket.onopen = () => {
	      // Send authentication
	      this.websocket.send(JSON.stringify({ token: this.apiKey }));
	      this.isRecording = true;
	    };
	    
	    this.websocket.onmessage = (event) => {
	      const data = JSON.parse(event.data);
	      
	      if (data.message_type === 'FinalTranscript') {
		if (data.text && this.onTranscript) {
		  this.onTranscript(data.text, false);
		}
	      } else if (data.message_type === 'PartialTranscript') {
		if (data.text && this.onTranscript) {
		  this.onTranscript(data.text, true);
		}
	      }
	    };
	    
	    this.websocket.onerror = (error) => {
	      console.error('WebSocket error', error);
	      this.stop();
	      throw new Error('WebSocket error: ' + error.message);
	    };
	    
	    this.websocket.onclose = () => {
	      this.stop();
	    };
	    
	    // Send audio data when processor generates output
	    this.processor.onaudioprocess = (e) => {
	      if (!this.isRecording || !this.websocket || this.websocket.readyState !== WebSocket.OPEN) return;
	      
	      // Get audio data
	      const inputData = e.inputBuffer.getChannelData(0);
	      
	      // Convert to 16-bit PCM
	      const pcmData = this.convertToInt16(inputData);
	      
	      // Send to AssemblyAI
	      if (this.websocket.readyState === WebSocket.OPEN) {
		this.websocket.send(pcmData);
	      }
	    };
	    
	    return true;
	  } catch (error) {
	    console.error('Error starting AssemblyAI', error);
	    this.stop();
	    throw error;
	  }
	}
	
	/**
	 * Stop recording and clean up resources
	 */
	stop() {
	  this.isRecording = false;
	  
	  // Clean up WebSocket
	  if (this.websocket) {
	    if (this.websocket.readyState === WebSocket.OPEN) {
	      this.websocket.send(JSON.stringify({ terminate_session: true }));
	    }
	    this.websocket.close();
	    this.websocket = null;
	  }
	  
	  // Clean up audio processor
	  if (this.processor) {
	    this.processor.disconnect();
	    this.processor = null;
	  }
	  
	  // Clean up audio context
	  if (this.audioContext) {
	    this.audioContext.close();
	    this.audioContext = null;
	  }
	  
	  // Stop microphone
	  if (this.mediaStream) {
	    this.mediaStream.getTracks().forEach(track => track.stop());
	    this.mediaStream = null;
	  }
	}
	
	/**
	 * Helper to convert Float32Array to Int16Array for AssemblyAI
	 * @param {Float32Array} float32Array - Raw audio data
	 * @returns {ArrayBuffer} - Converted data
	 */
	convertToInt16(float32Array) {
	  const int16Array = new Int16Array(float32Array.length);
	  for (let i = 0; i < float32Array.length; i++) {
	    // Convert -1.0 - 1.0 to -32768 - 32767
	    const s = Math.max(-1, Math.min(1, float32Array[i]));
	    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
	  }
	  return int16Array.buffer;
	}
      }
      
      /**
       * Fallback for browsers that don't support WebSocket API
       */
      export class BrowserSpeechService {
	constructor() {
	  this.recognition = null;
	  this.isRecording = false;
	  this.onTranscript = null;
	}
	
	/**
	 * Initialize browser speech recognition
	 * @param {function} onTranscript - Callback for transcript events
	 * @returns {boolean} - Success indicator
	 */
	start(onTranscript) {
	  try {
	    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	    this.recognition = new SpeechRecognition();
	    this.recognition.continuous = true;
	    this.recognition.interimResults = true;
	    this.onTranscript = onTranscript;
	    
	    this.recognition.onresult = (event) => {
	      const resultIndex = event.resultIndex;
	      const transcript = event.results[resultIndex][0].transcript;
	      const isFinal = event.results[resultIndex].isFinal;
	      
	      if (this.onTranscript) {
		this.onTranscript(transcript, !isFinal);
	      }
	    };
	    
	    this.recognition.onerror = (event) => {
	      console.error('Speech recognition error', event.error);
	      this.stop();
	    };
	    
	    this.recognition.start();
	    this.isRecording = true;
	    
	    return true;
	  } catch (error) {
	    console.error('Speech recognition not supported', error);
	    return false;
	  }
	}
	
	/**
	 * Stop speech recognition
	 */
	stop() {
	  if (this.recognition) {
	    try {
	      this.recognition.stop();
	    } catch (e) {
	      // Ignore errors on stop
	    }
	    this.recognition = null;
	  }
	  this.isRecording = false;
	}
      }