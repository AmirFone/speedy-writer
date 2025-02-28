document.addEventListener('DOMContentLoaded', function() {
	// DOM Elements - Landing Page
	const landingContainer = document.getElementById('landingContainer');
	const firstDraftOption = document.getElementById('firstDraftOption');
	const editorOption = document.getElementById('editorOption');
	
	// DOM Elements - First Draft Flow
	const firstDraftContainer = document.getElementById('firstDraftContainer');
	const transcriptStep = document.getElementById('transcriptStep');
	const questionsStep = document.getElementById('questionsStep');
	const generatingStep = document.getElementById('generatingStep');
	const transcriptUpload = document.getElementById('transcriptUpload');
	const recordAudioBtn = document.getElementById('recordAudioBtn');
	const transcriptPreview = document.getElementById('transcriptPreview');
	const transcriptContent = document.getElementById('transcriptContent');
	const editTranscriptBtn = document.getElementById('editTranscriptBtn');
	const skipTranscriptBtn = document.getElementById('skipTranscriptBtn');
	const nextFromTranscriptBtn = document.getElementById('nextFromTranscriptBtn');
	const questionCards = document.querySelectorAll('.question-card');
	const generateDraftBtn = document.querySelector('.generate-btn');
	
	// DOM Elements - Recording Modal
	const recordingModal = document.getElementById('recordingModal');
	const closeRecordingModal = document.getElementById('closeRecordingModal');
	const startRecordingBtn = document.getElementById('startRecordingBtn');
	const stopRecordingBtn = document.getElementById('stopRecordingBtn');
	const cancelRecording = document.getElementById('cancelRecording');
	const recordingTime = document.getElementById('recordingTime');
	
	// DOM Elements - Edit Transcript Modal
	const editTranscriptModal = document.getElementById('editTranscriptModal');
	const closeEditTranscriptModal = document.getElementById('closeEditTranscriptModal');
	const editTranscriptText = document.getElementById('editTranscriptText');
	const saveEditTranscript = document.getElementById('saveEditTranscript');
	const cancelEditTranscript = document.getElementById('cancelEditTranscript');
	
	// DOM Elements - Editor
	const editorContainer = document.getElementById('editorContainer');
	const editor = document.getElementById('editor');
	const editorWrapper = document.getElementById('editorWrapper');
	const toolbar = document.getElementById('toolbar');
	const toolButtons = document.querySelectorAll('.tool-btn');
	const floatingTools = document.getElementById('floatingTools');
	const floatingToolsToggle = document.getElementById('floatingToolsToggle');
	const floatingToolsHandle = document.getElementById('floatingToolsHandle');
	const speakBtn = document.getElementById('speakBtn');
	const aiRewriteBtn = document.getElementById('aiRewriteBtn');
	const commentsBtn = document.getElementById('commentsBtn');
	const aiRewriteModal = document.getElementById('aiRewriteModal');
	const closeAiModal = document.getElementById('closeAiModal');
	const cancelAiRewrite = document.getElementById('cancelAiRewrite');
	const selectedTextElement = document.getElementById('selectedText');
	const aiPrompt = document.getElementById('aiPrompt');
	const submitAiRewrite = document.getElementById('submitAiRewrite');
	const applyAiSuggestion = document.getElementById('applyAiSuggestion');
	const regenerateAiSuggestion = document.getElementById('regenerateAiSuggestion');
	const diffContainer = document.getElementById('diffContainer');
	const diffOriginalText = document.getElementById('diffOriginalText');
	const diffSuggestedText = document.getElementById('diffSuggestedText');
	const statusBar = document.getElementById('statusBar');
	
	// DOM Elements - Common
	const toast = document.getElementById('toast');
	const toastIcon = document.getElementById('toastIcon');
	const toastMessage = document.getElementById('toastMessage');
	const inlineCommentTemplate = document.getElementById('inlineCommentTemplate');
	const recordingIndicator = document.getElementById('recordingIndicator');
	const themeToggle = document.getElementById('themeToggle');
	const wordCount = document.getElementById('wordCount');
	const charCount = document.getElementById('charCount');
	const saveStatus = document.getElementById('saveStatus');
	const anthropicKeyModal = document.getElementById('anthropicKeyModal');
	const saveAnthropicKey = document.getElementById('saveAnthropicKey');
	const cancelAnthropicKey = document.getElementById('cancelAnthropicKey');
	const closeAnthropicModal = document.getElementById('closeAnthropicModal');
	const anthropicApiKey = document.getElementById('anthropicApiKey');
	const assemblyAIKeyModal = document.getElementById('assemblyAIKeyModal');
	const saveAssemblyAIKey = document.getElementById('saveAssemblyAIKey');
	const cancelAssemblyAIKey = document.getElementById('cancelAssemblyAIKey');
	const closeAssemblyAIModal = document.getElementById('closeAssemblyAIModal');
	const assemblyAIApiKey = document.getElementById('assemblyAIApiKey');
	
	// State variables
	let isRecording = false;
	let selectedRange = null;
	let lastSavedContent = '';
	let isDragging = false;
	let dragStartX = 0;
	let dragStartY = 0;
	let initialX = 0;
	let initialY = 0;
	let commentCount = 0;
	let activeCommentElement = null;
	let recognition = null;
	let mediaStream = null;
	let audioContext = null;
	let websocket = null;
	let isToolbarCollapsed = false;
	let transcriptText = null;
	let recordingInterval = null;
	let recordingSeconds = 0;
	let currentQuestionIndex = 0;
	let activeQuestionMicBtn = null;
	let activeQuestionTextarea = null;
	let questionAnswers = {
	    1: '',
	    2: '',
	    3: '',
	    4: '',
	    5: ''
	};
	
	// Check if the user has previously started (and saved) an editing session
	function checkForExistingSession() {
	    if (localStorage.getItem('speedyWriter_content')) {
		// Show toast asking if user wants to continue previous session
		const toastHtml = `
		    <div class="toast-message-special">
			You have a previous editing session. 
			<button id="loadPreviousSession" class="toast-btn">Resume Session</button>
			<button id="startNewSession" class="toast-btn">Start New</button>
		    </div>
		`;
		
		showCustomToast(toastHtml, 'info', 0); // 0 means don't auto-hide
		
		document.getElementById('loadPreviousSession').addEventListener('click', function() {
		    hideToast();
		    openEditor(true); // Load previous session
		});
		
		document.getElementById('startNewSession').addEventListener('click', function() {
		    hideToast();
		    // Show landing page (already visible)
		});
	    }
	}
	
	// Show custom toast with HTML content
	function showCustomToast(html, type = 'info', timeout = 3000) {
	    // Set icon based on type
	    toastIcon.className = 'toast-icon';
	    toastIcon.classList.add(type);
	    
	    // Set appropriate icon
	    let iconClass = 'info-circle';
	    if (type === 'success') iconClass = 'check-circle';
	    if (type === 'error') iconClass = 'times-circle';
	    if (type === 'warning') iconClass = 'exclamation-circle';
	    
	    toastIcon.innerHTML = `<i class="fas fa-${iconClass}"></i>`;
	    
	    // Set HTML content
	    toastMessage.innerHTML = html;
	    
	    // Show toast
	    toast.classList.add('active');
	    
	    // Auto-hide after specified timeout, or don't hide if timeout is 0
	    clearTimeout(window.toastTimeout);
	    if (timeout > 0) {
		window.toastTimeout = setTimeout(() => {
		    toast.classList.remove('active');
		}, timeout);
	    }
	}
	
	// Hide toast manually
	function hideToast() {
	    toast.classList.remove('active');
	    clearTimeout(window.toastTimeout);
	}
	
	// Initialize the application
	function init() {
	    // Check for existing session
	    checkForExistingSession();
	    
	    // Landing page option buttons
	    firstDraftOption.querySelector('.option-btn').addEventListener('click', function() {
		landingContainer.classList.add('hidden');
		firstDraftContainer.classList.remove('hidden');
		// The transcript step is already active by default
	    });
	    
	    editorOption.querySelector('.option-btn').addEventListener('click', function() {
		openEditor();
	    });
	    
	    // Initialize transcript step
	    initTranscriptStep();
	    
	    // Initialize question cards navigation
	    initQuestionCards();
	    
	    // Initialize the editor
	    initEditor();
	    
	    // Apply theme from localStorage
	    if (localStorage.getItem('speedyWriter_darkMode') === 'true') {
		document.body.classList.add('dark-mode');
		const themeToggleLabel = themeToggle.querySelector('.theme-toggle-label');
		themeToggleLabel.textContent = 'Light Mode';
	    }
	    
	    // Theme Toggle functionality
	    themeToggle.addEventListener('click', toggleTheme);
	}
	
	// Initialize Transcript Step
	function initTranscriptStep() {
	    // File upload handling
	    transcriptUpload.addEventListener('change', handleFileUpload);
	    
	    // Record audio button
	    recordAudioBtn.addEventListener('click', openRecordingModal);
	    
	    // Edit transcript button
	    editTranscriptBtn.addEventListener('click', openEditTranscriptModal);
	    
	    // Skip transcript button
	    skipTranscriptBtn.addEventListener('click', function() {
		transcriptText = null;
		goToQuestionsStep();
	    });
	    
	    // Next button
	    nextFromTranscriptBtn.addEventListener('click', function() {
		if (!nextFromTranscriptBtn.classList.contains('disabled')) {
		    goToQuestionsStep();
		} else {
		    showToast('Please upload or record a transcript first.', 'warning');
		}
	    });
	    
	    // Recording modal
	    closeRecordingModal.addEventListener('click', handleCloseRecordingModal);
	    cancelRecording.addEventListener('click', handleCloseRecordingModal);
	    startRecordingBtn.addEventListener('click', startRecording);
	    stopRecordingBtn.addEventListener('click', stopRecording);
	    
	    // Edit transcript modal
	    closeEditTranscriptModal.addEventListener('click', function() {
		editTranscriptModal.classList.remove('active');
	    });
	    
	    cancelEditTranscript.addEventListener('click', function() {
		editTranscriptModal.classList.remove('active');
	    });
	    
	    saveEditTranscript.addEventListener('click', function() {
		const editedText = editTranscriptText.value.trim();
		if (editedText) {
		    transcriptText = editedText;
		    transcriptContent.textContent = transcriptText;
		    editTranscriptModal.classList.remove('active');
		    showToast('Transcript updated successfully', 'success');
		} else {
		    showToast('Transcript cannot be empty', 'warning');
		}
	    });
	}
	
	// Handle file upload
	function handleFileUpload(event) {
	    const file = event.target.files[0];
	    if (!file) return;
	    
	    // Add file size limit check (100MB)
	    const maxSizeMB = 100;
	    const maxSizeBytes = maxSizeMB * 1024 * 1024;
	    
	    if (file.size > maxSizeBytes) {
		showToast(`File is too large. Maximum size is ${maxSizeMB}MB.`, 'error');
		event.target.value = ''; // Clear the file input
		return;
	    }
	    
	    const fileExtension = file.name.split('.').pop().toLowerCase();
	    
	    // Create processing indicator
	    const processingIndicator = document.createElement('div');
	    processingIndicator.className = 'transcript-processing';
	    processingIndicator.innerHTML = `
		<div class="processing-spinner">
		    <i class="fas fa-spinner fa-spin"></i>
		</div>
		<div class="processing-message">
		    <div class="processing-title">Processing file...</div>
		    <div class="processing-details">${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)</div>
		</div>
	    `;
	    
	    // Add to transcript step
	    const transcriptOptions = document.querySelector('.transcript-options');
	    transcriptOptions.insertAdjacentElement('afterend', processingIndicator);
	    
	    // Show loading state
	    showToast('Processing file...', 'info');
	    
	    if (fileExtension === 'txt') {
		// Text file - read directly
		const reader = new FileReader();
		
		reader.onload = function(e) {
		    transcriptText = e.target.result;
		    displayTranscript();
		    processingIndicator.remove();
		};
		
		reader.onerror = function() {
		    showToast('Error reading text file', 'error');
		    processingIndicator.remove();
		    event.target.value = ''; // Clear the file input
		};
		
		reader.readAsText(file);
	    } else if (['mp3', 'mp4', 'wav', 'm4a'].includes(fileExtension)) {
		// Audio file - check for AssemblyAI key
		const apiKey = getAssemblyAIApiKey();
		if (!apiKey) {
		    assemblyAIKeyModal.classList.add('active');
		    // After key is added, the upload event will need to be triggered again
		    processingIndicator.remove();
		    event.target.value = ''; // Clear the file input
		    return;
		}
		
		// Process audio file with AssemblyAI
		processAudioFile(file, apiKey, processingIndicator, event.target);
	    } else {
		showToast('Unsupported file type. Please upload an audio or text file.', 'error');
		processingIndicator.remove();
		event.target.value = ''; // Clear the file input
	    }
	}
	
	// Process audio file with AssemblyAI
	function processAudioFile(file, apiKey, processingIndicator, fileInput) {
	    // For large files, we'll use a direct upload approach
	    // This avoids timeouts from trying to use FormData with large files
	    
	    // Update processing indicator
	    const processingMessage = processingIndicator.querySelector('.processing-title');
	    processingMessage.textContent = 'Uploading audio file...';
	    
	    // Show toast
	    showToast('Uploading audio file...', 'info');
	    
	    // For files larger than 5MB, use a chunked upload approach
	    if (file.size > 5 * 1024 * 1024) {
		// Use the fetch API with headers and a ReadableStream
		const reader = new FileReader();
		
		reader.onload = function(e) {
		    const arrayBuffer = e.target.result;
		    
		    // Make API request to upload the file directly
		    fetch('https://api.assemblyai.com/v2/upload', {
			method: 'POST',
			headers: {
			    'Authorization': apiKey,
			    'Content-Type': 'application/octet-stream'
			},
			body: arrayBuffer
		    })
		    .then(response => {
			if (!response.ok) {
			    throw new Error('Failed to upload audio file: ' + response.statusText);
			}
			return response.json();
		    })
		    .then(data => {
			if (data.upload_url) {
			    processingMessage.textContent = 'Transcribing audio...';
			    showToast('Transcribing audio...', 'info');
			    
			    // Create transcription request
			    return fetch('https://api.assemblyai.com/v2/transcript', {
				method: 'POST',
				headers: {
				    'Authorization': apiKey,
				    'Content-Type': 'application/json'
				},
				body: JSON.stringify({
				    audio_url: data.upload_url
				})
			    });
			} else {
			    throw new Error('Failed to upload audio file: No upload URL returned');
			}
		    })
		    .then(response => {
			if (!response.ok) {
			    throw new Error('Failed to start transcription: ' + response.statusText);
			}
			return response.json();
		    })
		    .then(data => {
			if (data.id) {
			    // Poll for transcription completion
			    checkTranscriptionStatus(data.id, apiKey, processingIndicator);
			} else {
			    throw new Error('Failed to start transcription: No transcript ID returned');
			}
		    })
		    .catch(error => {
			console.error('Error processing audio file:', error);
			showToast('Error processing audio file: ' + error.message, 'error');
			processingIndicator.remove();
			if (fileInput) fileInput.value = ''; // Clear the file input
		    });
		};
		
		reader.onerror = function() {
		    showToast('Error reading audio file', 'error');
		    processingIndicator.remove();
		    if (fileInput) fileInput.value = ''; // Clear the file input
		};
		
		// Read the file as an ArrayBuffer
		reader.readAsArrayBuffer(file);
	    } else {
		// Use FormData for smaller files
		const formData = new FormData();
		formData.append('audio', file);
		
		// Make API request to upload the file
		fetch('https://api.assemblyai.com/v2/upload', {
		    method: 'POST',
		    headers: {
			'Authorization': apiKey
		    },
		    body: formData
		})
		.then(response => {
		    if (!response.ok) {
			throw new Error('Failed to upload audio file: ' + response.statusText);
		    }
		    return response.json();
		})
		.then(data => {
		    if (data.upload_url) {
			processingMessage.textContent = 'Transcribing audio...';
			showToast('Transcribing audio...', 'info');
			
			// Create transcription request
			return fetch('https://api.assemblyai.com/v2/transcript', {
			    method: 'POST',
			    headers: {
				'Authorization': apiKey,
				'Content-Type': 'application/json'
			    },
			    body: JSON.stringify({
				audio_url: data.upload_url
			    })
			});
		    } else {
			throw new Error('Failed to upload audio file: No upload URL returned');
		    }
		})
		.then(response => {
		    if (!response.ok) {
			throw new Error('Failed to start transcription: ' + response.statusText);
		    }
		    return response.json();
		})
		.then(data => {
		    if (data.id) {
			// Poll for transcription completion
			checkTranscriptionStatus(data.id, apiKey, processingIndicator);
		    } else {
			throw new Error('Failed to start transcription: No transcript ID returned');
		    }
		})
		.catch(error => {
		    console.error('Error processing audio file:', error);
		    showToast('Error processing audio file: ' + error.message, 'error');
		    processingIndicator.remove();
		    if (fileInput) fileInput.value = ''; // Clear the file input
		});
	    }
	}
	
	// Check transcription status
	function checkTranscriptionStatus(transcriptId, apiKey, processingIndicator) {
	    // Update processing display if available
	    if (processingIndicator) {
		const statusElem = processingIndicator.querySelector('.processing-title');
		if (statusElem) statusElem.textContent = 'Checking transcription status...';
	    }
	    
	    fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
		method: 'GET',
		headers: {
		    'Authorization': apiKey
		}
	    })
	    .then(response => {
		if (!response.ok) {
		    throw new Error('Status check failed: ' + response.statusText);
		}
		return response.json();
	    })
	    .then(data => {
		// Update progress info
		if (processingIndicator) {
		    const statusElem = processingIndicator.querySelector('.processing-title');
		    const percentage = data.status === 'completed' ? 100 : 
				       data.status === 'error' ? 0 : 
				       data.status === 'processing' && data.percent_complete ? data.percent_complete : 
				       'Processing...';
		    
		    if (statusElem && typeof percentage === 'number') {
			statusElem.textContent = `Transcribing: ${percentage}% complete`;
		    } else if (statusElem) {
			statusElem.textContent = `Status: ${data.status}`;
		    }
		}
		
		if (data.status === 'completed') {
		    transcriptText = data.text;
		    displayTranscript();
		    showToast('Transcription completed successfully', 'success');
		    if (processingIndicator) processingIndicator.remove();
		} else if (data.status === 'error') {
		    throw new Error('Transcription failed: ' + (data.error || 'Unknown error'));
		} else {
		    // Still processing, check again after 3 seconds
		    setTimeout(() => checkTranscriptionStatus(transcriptId, apiKey, processingIndicator), 3000);
		}
	    })
	    .catch(error => {
		console.error('Error checking transcription status:', error);
		showToast('Error checking transcription status: ' + error.message, 'error');
		if (processingIndicator) processingIndicator.remove();
	    });
	}
	
	// Display transcript in the preview
	function displayTranscript() {
	    if (transcriptText) {
		transcriptContent.textContent = transcriptText;
		transcriptPreview.classList.remove('hidden');
		nextFromTranscriptBtn.classList.remove('disabled');
	    }
	}
	
	// Open recording modal
	function openRecordingModal() {
	    // Check if API key exists
	    if (!getAssemblyAIApiKey()) {
		assemblyAIKeyModal.classList.add('active');
		return;
	    }
	    
	    recordingModal.classList.add('active');
	    recordingSeconds = 0;
	    updateRecordingTime();
	}
	
	// Close recording modal and handle cleanup
	function handleCloseRecordingModal() {
	    if (isRecording) {
		stopRecording();
	    }
	    recordingModal.classList.remove('active');
	}
	
	// Start recording
	function startRecording() {
	    startRecordingBtn.style.display = 'none';
	    stopRecordingBtn.style.display = 'block';
	    
	    // Reset recording time
	    recordingSeconds = 0;
	    updateRecordingTime();
	    
	    // Start timer
	    recordingInterval = setInterval(function() {
		recordingSeconds++;
		updateRecordingTime();
	    }, 1000);
	    
	    // Request microphone access and start real-time transcription
	    startRealTimeTranscription();
	}
	
	// Stop recording
	function stopRecording() {
	    if (recordingInterval) {
		clearInterval(recordingInterval);
		recordingInterval = null;
	    }
	    
	    startRecordingBtn.style.display = 'block';
	    stopRecordingBtn.style.display = 'none';
	    
	    // Stop real-time transcription
	    stopRealTimeTranscription();
	}
	
	// Update recording time display
	function updateRecordingTime() {
	    const minutes = Math.floor(recordingSeconds / 60).toString().padStart(2, '0');
	    const seconds = (recordingSeconds % 60).toString().padStart(2, '0');
	    recordingTime.textContent = `${minutes}:${seconds}`;
	}
	
	// Start real-time transcription using AssemblyAI
	async function startRealTimeTranscription() {
	    isRecording = true;
	    
	    try {
		// Request microphone access
		mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
		
		// Get API key
		const apiKey = getAssemblyAIApiKey();
		
		// Get temporary token from backend
		const response = await fetch('/api/assemblyai/token/', {
		    method: 'POST',
		    headers: {
			'Content-Type': 'application/json'
		    },
		    body: JSON.stringify({
			api_key: apiKey,
			expires_in: 3600 // Token valid for 1 hour
		    })
		});
		
		if (!response.ok) {
		    throw new Error('Failed to get AssemblyAI token');
		}
		
		const tokenData = await response.json();
		const tempToken = tokenData.token;
		
		// Create audio context
		audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
		const source = audioContext.createMediaStreamSource(mediaStream);
		
		// Create processor node
		let processor;
		
		try {
		    processor = audioContext.createScriptProcessor(4096, 1, 1);
		} catch (error) {
		    console.error('Error creating script processor:', error);
		    processor = audioContext.createScriptProcessor(2048, 1, 1);
		}
		
		source.connect(processor);
		processor.connect(audioContext.destination);
		
		// Create WebSocket connection
		websocket = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=${audioContext.sampleRate}&token=${tempToken}`);
		
		// Initialize transcript storage
		window.partialTranscripts = {};
		window.finalTranscripts = {};
		window.transcriptionResult = '';
		
		websocket.onopen = () => {
		    console.log('WebSocket connection established');
		};
		
		websocket.onmessage = (event) => {
		    try {
			const data = JSON.parse(event.data);
			
			if (data.message_type === 'FinalTranscript' || data.message_type === 'PartialTranscript') {
			    if (data.text) {
				// Store transcripts by segment
				if (data.message_type === 'PartialTranscript') {
				    window.partialTranscripts[data.audio_start] = data.text;
				} else if (data.message_type === 'FinalTranscript') {
				    window.finalTranscripts[data.audio_start] = data.text;
				    delete window.partialTranscripts[data.audio_start];
				}
				
				// Rebuild the full transcript
				let fullText = '';
				
				// Add all final transcripts in order
				const finalStarts = Object.keys(window.finalTranscripts).sort((a, b) => a - b);
				for (const start of finalStarts) {
				    fullText += window.finalTranscripts[start] + ' ';
				}
				
				// Add all partial transcripts in order
				const partialStarts = Object.keys(window.partialTranscripts).sort((a, b) => a - b);
				for (const start of partialStarts) {
				    fullText += window.partialTranscripts[start] + ' ';
				}
				
				// Update the transcript
				window.transcriptionResult = fullText.trim();
			    }
			}
		    } catch (error) {
			console.error('Error processing WebSocket message:', error);
		    }
		};
		
		websocket.onerror = (error) => {
		    console.error('WebSocket error', error);
		    showToast('WebSocket error', 'error');
		};
		
		websocket.onclose = () => {
		    console.log('WebSocket connection closed');
		};
		
		// Set up audio processing
		processor.onaudioprocess = (e) => {
		    if (!isRecording || !websocket || websocket.readyState !== WebSocket.OPEN) return;
		    
		    // Get audio data
		    const inputData = e.inputBuffer.getChannelData(0);
		    
		    // Convert to 16-bit PCM
		    const pcmData = convertToInt16(inputData);
		    
		    // Send to AssemblyAI
		    websocket.send(pcmData);
		};
		
	    } catch (error) {
		console.error('Error starting real-time transcription:', error);
		showToast('Error starting recording: ' + error.message, 'error');
		isRecording = false;
		stopRecordingBtn.style.display = 'none';
		startRecordingBtn.style.display = 'block';
		if (recordingInterval) {
		    clearInterval(recordingInterval);
		    recordingInterval = null;
		}
	    }
	}
	
	// Stop real-time transcription
	function stopRealTimeTranscription() {
	    isRecording = false;
	    
	    // Clean up WebSocket
	    if (websocket) {
		try {
		    if (websocket.readyState === WebSocket.OPEN) {
			websocket.send(JSON.stringify({ terminate_session: true }));
			setTimeout(() => {
			    websocket.close();
			}, 300);
		    } else {
			websocket.close();
		    }
		} catch (e) {
		    console.error('Error closing websocket:', e);
		}
		websocket = null;
	    }
	    
	    // Clean up audio context
	    if (audioContext && audioContext.state !== 'closed') {
		try {
		    audioContext.close();
		} catch (e) {
		    console.error('Error closing audio context:', e);
		}
		audioContext = null;
	    }
	    
	    // Stop microphone
	    if (mediaStream) {
		mediaStream.getTracks().forEach(track => track.stop());
		mediaStream = null;
	    }
	    
	    // Get the final transcript
	    if (window.transcriptionResult) {
		transcriptText = window.transcriptionResult;
		displayTranscript();
		
		// Open edit transcript modal to let user verify/edit
		openEditTranscriptModal();
	    }
	}
	
	// Convert float32 audio data to Int16
	function convertToInt16(float32Array) {
	    const int16Array = new Int16Array(float32Array.length);
	    
	    for (let i = 0; i < float32Array.length; i++) {
		const s = Math.max(-1, Math.min(1, float32Array[i]));
		int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
	    }
	    
	    return int16Array.buffer;
	}
	
	// Open edit transcript modal
	function openEditTranscriptModal() {
	    editTranscriptText.value = transcriptText || '';
	    editTranscriptModal.classList.add('active');
	    
	    // Focus and place cursor at the end
	    setTimeout(() => {
		editTranscriptText.focus();
		editTranscriptText.setSelectionRange(editTranscriptText.value.length, editTranscriptText.value.length);
	    }, 100);
	}
	
	// Go to questions step
	function goToQuestionsStep() {
	    transcriptStep.classList.remove('active');
	    transcriptStep.classList.add('hidden');
	    questionsStep.classList.remove('hidden');
	    questionsStep.classList.add('active');
	    
	    // Reset to first question
	    currentQuestionIndex = 0;
	    resetQuestionCards();
	}
	
	// Initialize question cards
	function initQuestionCards() {
	    // Add event listeners to back/next buttons
	    document.querySelectorAll('.next-btn').forEach(button => {
		button.addEventListener('click', goToNextQuestion);
	    });
	    
	    document.querySelectorAll('.back-btn').forEach(button => {
		button.addEventListener('click', goToPreviousQuestion);
	    });
	    
	    // Add event listeners to textareas
	    document.querySelectorAll('.question-answer').forEach(textarea => {
		textarea.addEventListener('input', function() {
		    // Save answer
		    const card = this.closest('.question-card');
		    const questionNumber = card.dataset.question;
		    questionAnswers[questionNumber] = this.value;
		    
		    // Enable/disable next button based on content
		    const nextBtn = card.querySelector('.next-btn') || card.querySelector('.generate-btn');
		    if (this.value.trim()) {
			nextBtn.classList.remove('disabled');
		    } else {
			nextBtn.classList.add('disabled');
		    }
		});
	    });
	    
	    // Add event listeners to microphone buttons
	    document.querySelectorAll('.question-mic-btn').forEach(button => {
		button.addEventListener('click', function() {
		    const card = this.closest('.question-card');
		    const textarea = card.querySelector('.question-answer');
		    
		    // Toggle recording state
		    if (this.classList.contains('recording')) {
			stopQuestionTranscription();
		    } else {
			startQuestionTranscription(this, textarea);
		    }
		});
	    });
	    
	    // Generate draft button
	    generateDraftBtn.addEventListener('click', function() {
		if (!this.classList.contains('disabled')) {
		    generateFirstDraft();
		}
	    });
	}
	
	// Reset question cards to initial state
	function resetQuestionCards() {
	    questionCards.forEach(card => {
		card.classList.remove('active');
		
		// Restore previously entered answers
		const questionNumber = card.dataset.question;
		const textarea = card.querySelector('.question-answer');
		textarea.value = questionAnswers[questionNumber] || '';
		
		// Enable/disable next button based on content
		const nextBtn = card.querySelector('.next-btn') || card.querySelector('.generate-btn');
		if (textarea.value.trim()) {
		    nextBtn.classList.remove('disabled');
		} else {
		    nextBtn.classList.add('disabled');
		}
	    });
	    
	    // Show first question
	    questionCards[0].classList.add('active');
	}
	
	// Go to next question
	function goToNextQuestion() {
	    if (currentQuestionIndex < questionCards.length - 1) {
		questionCards[currentQuestionIndex].classList.remove('active');
		currentQuestionIndex++;
		questionCards[currentQuestionIndex].classList.add('active');
	    }
	}
	
	// Go to previous question
	function goToPreviousQuestion() {
	    if (currentQuestionIndex > 0) {
		questionCards[currentQuestionIndex].classList.remove('active');
		currentQuestionIndex--;
		questionCards[currentQuestionIndex].classList.add('active');
	    }
	}
	
	// Generate first draft
	function generateFirstDraft() {
	    // Check if we have an Anthropic API key
	    if (!getAnthropicApiKey()) {
		anthropicKeyModal.classList.add('active');
		return;
	    }
	    
	    // Show generating step
	    questionsStep.classList.remove('active');
	    questionsStep.classList.add('hidden');
	    generatingStep.classList.remove('hidden');
	    generatingStep.classList.add('active');
	    
	    // Create meta prompt
	    const metaPrompt = createMetaPrompt();
	    
	    // Call API to generate draft
	    callAnthropicAPI(metaPrompt)
		.then(draftText => {
		    // Show the editor with the generated draft
		    openEditor(false, draftText);
		    
		    // Hide first draft flow
		    firstDraftContainer.classList.add('hidden');
		    
		    showToast('Your first draft is ready!', 'success');
		})
		.catch(error => {
		    console.error('Error generating draft:', error);
		    showToast('Error generating draft: ' + error.message, 'error');
		    
		    // Go back to questions
		    generatingStep.classList.remove('active');
		    generatingStep.classList.add('hidden');
		    questionsStep.classList.remove('hidden');
		    questionsStep.classList.add('active');
		});
	}
	
	// Create meta prompt for Anthropic
	function createMetaPrompt() {
	    let prompt = `You are an expert writing assistant. Your task is to create a first draft based on `;
	    
	    if (transcriptText) {
		prompt += `the following transcript and `;
	    }
	    
	    prompt += `answers to five key questions. Please craft a well-structured, coherent document that captures the essence of what the user wants to communicate.\n\n`;
	    
	    if (transcriptText) {
		prompt += `TRANSCRIPT:\n"${transcriptText}"\n\n`;
	    }
	    
	    prompt += `QUESTIONS AND ANSWERS:\n`;
	    prompt += `1. What is the main topic or thesis?\n"${questionAnswers[1]}"\n\n`;
	    prompt += `2. Who is the target audience?\n"${questionAnswers[2]}"\n\n`;
	    prompt += `3. What are the key points to address?\n"${questionAnswers[3]}"\n\n`;
	    prompt += `4. What tone or style is desired?\n"${questionAnswers[4]}"\n\n`;
	    prompt += `5. What's the desired length and format?\n"${questionAnswers[5]}"\n\n`;
	    
	    prompt += `Based on this information, please create a first draft that follows the requested format and style. Include appropriate headings, paragraphs, and structure. Focus on creating a coherent and well-organized document that addresses the key points while maintaining the desired tone for the target audience.`;
	    
	    return prompt;
	}
	
	// Call Anthropic API to generate draft
	async function callAnthropicAPI(prompt) {
	    const apiKey = getAnthropicApiKey();
	    
	    try {
		const response = await fetch('/api/anthropic/rewrite/', {
		    method: 'POST',
		    headers: {
			'Content-Type': 'application/json'
		    },
		    body: JSON.stringify({
			api_key: apiKey,
			text: "Generate a draft using this prompt", // Use placeholder text instead of empty string
			prompt: prompt
		    })
		});
		
		// Check response status
		if (!response.ok) {
		    let errorMessage = 'Failed to generate draft';
		    
		    try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorMessage;
		    } catch (e) {
			// If we can't parse JSON, use text
			errorMessage = await response.text();
		    }
		    
		    throw new Error(errorMessage);
		}
		
		const data = await response.json();
		
		// Check if we have valid text
		if (!data.text) {
		    throw new Error('No text was generated. Please try again.');
		}
		
		return data.text;
	    } catch (error) {
		console.error('Error calling Anthropic API:', error);
		throw error;
	    }
	}
	
	// Open the editor
	function openEditor(loadPrevious = false, draftText = null) {
	    // Hide landing and first draft containers
	    landingContainer.classList.add('hidden');
	    firstDraftContainer.classList.add('hidden');
	    
	    // Show editor container and status bar
	    editorContainer.classList.remove('hidden');
	    statusBar.classList.remove('hidden');
	    
	    // Load previous content or set draft text
	    if (loadPrevious) {
		loadFromLocalStorage();
	    } else if (draftText) {
		// Set editor content to the generated draft
		editor.innerHTML = draftText
		    .split('\n')
		    .map(paragraph => `<p>${paragraph}</p>`)
		    .join('');
		
		// Save the draft
		lastSavedContent = editor.innerHTML;
		localStorage.setItem('speedyWriter_content', lastSavedContent);
	    }
	    
	    // Focus the editor
	    setTimeout(() => {
		editor.focus();
		updateWordCharCount();
	    }, 300);
	}
	
	// Initialize the editor
	function initEditor() {
	    // Initialize draggable floating tools
	    initDraggable();
	    
	    // Toolbar buttons
	    toolButtons.forEach(button => {
		button.addEventListener('click', function() {
		    const command = this.dataset.command;
		    const value = this.dataset.value || null;
		    
		    if (command === 'createLink') {
			const url = prompt('Enter link URL:');
			if (url) document.execCommand(command, false, url);
		    } else if (command === 'formatBlock') {
			document.execCommand(command, false, value);
		    } else {
			document.execCommand(command, false, null);
		    }
		    
		    editor.focus();
		    updateWordCharCount();
		});
	    });
	    
	    // Editor content change
	    editor.addEventListener('input', function() {
		updateWordCharCount();
		
		// Update save status
		if (editor.innerHTML !== lastSavedContent) {
		    saveStatus.textContent = 'Unsaved changes';
		    
		    // Auto-save after 2 seconds of inactivity
		    clearTimeout(window.saveTimeout);
		    window.saveTimeout = setTimeout(saveToLocalStorage, 2000);
		}
	    });
	    
	    // Floating tools toggle
	    floatingToolsToggle.addEventListener('click', toggleFloatingToolbar);
	    
	    // AI Rewrite button
	    aiRewriteBtn.addEventListener('click', showAiRewriteModal);
	    
	    // Speech button
	    speakBtn.addEventListener('click', toggleSpeechRecognition);
	    
	    // Comments button
	    commentsBtn.addEventListener('click', addComment);
	    
	    // AI Rewrite Modal
	    closeAiModal.addEventListener('click', () => aiRewriteModal.classList.remove('active'));
	    cancelAiRewrite.addEventListener('click', () => aiRewriteModal.classList.remove('active'));
	    submitAiRewrite.addEventListener('click', processAiRewrite);
	    applyAiSuggestion.addEventListener('click', applyRewriteSuggestion);
	    regenerateAiSuggestion.addEventListener('click', regenerateRewriteSuggestion);
	    
	    // API key modals
	    initApiKeyModals();
	}
	
	// Initialize API key modals
	function initApiKeyModals() {
	    saveAnthropicKey.addEventListener('click', function() {
		const key = anthropicApiKey.value.trim();
		if (!key) {
		    showToast('Please enter a valid API key', 'warning');
		    return;
		}
		
		localStorage.setItem('speedyWriter_anthropicApiKey', key);
		showToast('Anthropic API key saved', 'success');
		anthropicKeyModal.classList.remove('active');
	    });
	    
	    cancelAnthropicKey.addEventListener('click', () => anthropicKeyModal.classList.remove('active'));
	    closeAnthropicModal.addEventListener('click', () => anthropicKeyModal.classList.remove('active'));
	    
	    saveAssemblyAIKey.addEventListener('click', function() {
		const key = assemblyAIApiKey.value.trim();
		if (!key) {
		    showToast('Please enter a valid API key', 'warning');
		    return;
		}
		
		localStorage.setItem('speedyWriter_assemblyAIApiKey', key);
		showToast('AssemblyAI API key saved', 'success');
		assemblyAIKeyModal.classList.remove('active');
	    });
	    
	    cancelAssemblyAIKey.addEventListener('click', () => assemblyAIKeyModal.classList.remove('active'));
	    closeAssemblyAIModal.addEventListener('click', () => assemblyAIKeyModal.classList.remove('active'));
	}
	
	// Toggle floating toolbar
	function toggleFloatingToolbar() {
	    isToolbarCollapsed = !isToolbarCollapsed;
	    
	    if (isToolbarCollapsed) {
		floatingTools.classList.add('collapsed');
		floatingToolsToggle.querySelector('i').classList.remove('fa-plus');
		floatingToolsToggle.querySelector('i').classList.add('fa-ellipsis-h');
	    } else {
		floatingTools.classList.remove('collapsed');
		floatingToolsToggle.querySelector('i').classList.remove('fa-ellipsis-h');
		floatingToolsToggle.querySelector('i').classList.add('fa-plus');
	    }
	    
	    // Save state to localStorage
	    localStorage.setItem('speedyWriter_toolbarCollapsed', isToolbarCollapsed);
	}
	
	// Initialize draggable floating tools
	function initDraggable() {
	    floatingToolsHandle.addEventListener('mousedown', function(e) {
		isDragging = true;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		
		const rect = floatingTools.getBoundingClientRect();
		initialX = rect.left;
		initialY = rect.top;
		
		floatingTools.style.transition = 'none';
		
		e.preventDefault(); // Prevent text selection during drag
	    });
	    
	    document.addEventListener('mousemove', function(e) {
		if (!isDragging) return;
		
		const deltaX = e.clientX - dragStartX;
		const deltaY = e.clientY - dragStartY;
		
		const newLeft = Math.max(10, Math.min(window.innerWidth - 100, initialX + deltaX));
		const newTop = Math.max(60, Math.min(window.innerHeight - 200, initialY + deltaY));
		
		floatingTools.style.left = `${newLeft}px`;
		floatingTools.style.top = `${newTop}px`;
	    });
	    
	    document.addEventListener('mouseup', function() {
		if (isDragging) {
		    isDragging = false;
		    floatingTools.style.transition = 'all 0.2s ease';
		    
		    // Save position to localStorage
		    const rect = floatingTools.getBoundingClientRect();
		    localStorage.setItem('speedyWriter_toolsPosition', JSON.stringify({
			left: rect.left,
			top: rect.top
		    }));
		}
	    });
	}
	
	// Update word and character count
	function updateWordCharCount() {
	    const text = editor.innerText || '';
	    const wordArray = text.match(/\S+/g) || [];
	    const charArray = text.replace(/\s+/g, '').split('');
	    
	    wordCount.textContent = `${wordArray.length} words`;
	    charCount.textContent = `${charArray.length} characters`;
	}
	
	// Save to localStorage
	function saveToLocalStorage() {
	    const content = editor.innerHTML;
	    localStorage.setItem('speedyWriter_content', content);
	    lastSavedContent = content;
	    saveStatus.textContent = 'All changes saved';
	}
	
	// Load from localStorage
	function loadFromLocalStorage() {
	    // Load editor content
	    const savedContent = localStorage.getItem('speedyWriter_content');
	    if (savedContent) {
		editor.innerHTML = savedContent;
		lastSavedContent = savedContent;
	    }
	    
	    // Load floating tools position
	    const toolsPosition = localStorage.getItem('speedyWriter_toolsPosition');
	    if (toolsPosition) {
		const position = JSON.parse(toolsPosition);
		floatingTools.style.top = `${position.top}px`;
		floatingTools.style.left = `${position.left}px`;
	    }
	    
	    // Load toolbar collapsed state
	    if (localStorage.getItem('speedyWriter_toolbarCollapsed') === 'true') {
		floatingTools.classList.add('collapsed');
		floatingToolsToggle.querySelector('i').classList.remove('fa-plus');
		floatingToolsToggle.querySelector('i').classList.add('fa-ellipsis-h');
		isToolbarCollapsed = true;
	    }
	    
	    // Load comments
	    loadCommentMarkers();
	    
	    // Update word count
	    updateWordCharCount();
	}
	
	// Show AI Rewrite modal
	function showAiRewriteModal() {
	    // If toolbar is collapsed, expand it
	    if (isToolbarCollapsed) {
		toggleFloatingToolbar();
	    }
	    
	    // Check if API key exists
	    if (!getAnthropicApiKey()) {
		anthropicKeyModal.classList.add('active');
		return;
	    }
	    
	    // Get selection
	    const selection = window.getSelection();
	    
	    // Store selection range
	    if (selection.rangeCount > 0) {
		selectedRange = selection.getRangeAt(0).cloneRange();
		
		// Check if selection is not empty
		if (!selectedRange.collapsed) {
		    const selectedText = selectedRange.toString();
		    
		    if (selectedText.trim() === '') {
			showToast('Please select text to rewrite', 'warning');
			return;
		    }
		    
		    // Reset the modal state
		    selectedTextElement.textContent = selectedText;
		    aiPrompt.value = '';
		    diffContainer.style.display = 'none';
		    submitAiRewrite.style.display = 'block';
		    applyAiSuggestion.style.display = 'none';
		    regenerateAiSuggestion.style.display = 'none';
		    
		    // Show modal
		    aiRewriteModal.classList.add('active');
		    
		    // Focus on prompt input
		    setTimeout(() => {
			aiPrompt.focus();
		    }, 300);
		} else {
		    showToast('Please select text to rewrite', 'warning');
		}
	    } else {
		showToast('Please select text to rewrite', 'warning');
	    }
	}
	
	// Process AI rewrite request
	function processAiRewrite() {
	    const originalText = selectedTextElement.textContent;
	    const prompt = aiPrompt.value.trim() || 'Improve this text';
	    
	    // Show loading state
	    const originalBtnText = submitAiRewrite.innerHTML;
	    submitAiRewrite.innerHTML = '<span class="spinner"></span> Processing...';
	    submitAiRewrite.disabled = true;
	    
	    // Call the API
	    anthropicRewrite(originalText, prompt)
		.then(suggestedText => {
		    // Display difference
		    diffOriginalText.textContent = originalText;
		    diffSuggestedText.textContent = suggestedText;
		    diffContainer.style.display = 'block';
		    
		    // Show apply/regenerate buttons
		    submitAiRewrite.style.display = 'none';
		    applyAiSuggestion.style.display = 'inline-flex';
		    regenerateAiSuggestion.style.display = 'inline-flex';
		    
		    // Reset button
		    submitAiRewrite.innerHTML = originalBtnText;
		    submitAiRewrite.disabled = false;
		})
		.catch(error => {
		    console.error("AI rewrite error:", error);
		    showToast('Error generating AI suggestion: ' + error.message, 'error');
		    
		    // Reset button
		    submitAiRewrite.innerHTML = originalBtnText;
		    submitAiRewrite.disabled = false;
		});
	}
	
	// Apply rewrite suggestion
	function applyRewriteSuggestion() {
	    const suggestedText = diffSuggestedText.textContent;
	    
	    // Replace selected text with suggested text
	    if (selectedRange) {
		const selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(selectedRange);
		
		// Delete the selected content
		document.execCommand('delete');
		
		// Insert the new content
		document.execCommand('insertText', false, suggestedText);
	    }
	    
	    // Close modal
	    aiRewriteModal.classList.remove('active');
	    
	    // Show success message
	    showToast('Text successfully updated', 'success');
	    
	    // Update word count
	    updateWordCharCount();
	}
	
	// Regenerate rewrite suggestion
	function regenerateRewriteSuggestion() {
	    const originalText = selectedTextElement.textContent;
	    const prompt = aiPrompt.value.trim() || 'Improve this text';
	    
	    // Show loading state
	    const originalBtnText = regenerateAiSuggestion.innerHTML;
	    regenerateAiSuggestion.innerHTML = '<span class="spinner"></span> Processing...';
	    regenerateAiSuggestion.disabled = true;
	    applyAiSuggestion.disabled = true;
	    
	    // Call the API
	    anthropicRewrite(originalText, prompt)
		.then(suggestedText => {
		    // Update the suggested text
		    diffSuggestedText.textContent = suggestedText;
		    
		    // Reset buttons
		    regenerateAiSuggestion.innerHTML = originalBtnText;
		    regenerateAiSuggestion.disabled = false;
		    applyAiSuggestion.disabled = false;
		})
		.catch(error => {
		    showToast('Error regenerating AI suggestion: ' + error.message, 'error');
		    
		    // Reset buttons
		    regenerateAiSuggestion.innerHTML = originalBtnText;
		    regenerateAiSuggestion.disabled = false;
		    applyAiSuggestion.disabled = false;
		});
	}
	
	// Anthropic API call for rewriting
	async function anthropicRewrite(text, prompt) {
	    const apiKey = getAnthropicApiKey();
	    if (!apiKey) {
		throw new Error('Missing Anthropic API key');
	    }
	    
	    try {
		const response = await fetch('/api/anthropic/rewrite/', {
		    method: 'POST',
		    headers: {
			'Content-Type': 'application/json'
		    },
		    body: JSON.stringify({
			api_key: apiKey,
			text: text,
			prompt: prompt
		    })
		});
		
		const responseData = await response.json();
		
		if (!response.ok) {
		    let errorMessage = 'Failed to get response from Anthropic API';
		    
		    if (responseData && responseData.error) {
			errorMessage = typeof responseData.error === 'string' 
			    ? responseData.error 
			    : JSON.stringify(responseData.error);
		    }
		    
		    throw new Error(errorMessage);
		}
		
		return responseData.text;
	    } catch (error) {
		console.error('Error in anthropicRewrite:', error);
		throw error;
	    }
	}
	
	// Toggle speech recognition
	function toggleSpeechRecognition() {
	    // If toolbar is collapsed, expand it
	    if (isToolbarCollapsed) {
		toggleFloatingToolbar();
	    }
	    
	    // Check if API key exists
	    if (!getAssemblyAIApiKey()) {
		assemblyAIKeyModal.classList.add('active');
		return;
	    }
	    
	    if (isRecording) {
		stopAssemblyAIRecording();
	    } else {
		startAssemblyAIRecording();
	    }
	}
	
	// Start question transcription
	async function startQuestionTranscription(micButton, textarea) {
	    // Check if already recording elsewhere
	    if (isRecording) {
		showToast('Please stop the current recording first', 'warning');
		return;
	    }
	    
	    // Check if API key exists
	    if (!getAssemblyAIApiKey()) {
		assemblyAIKeyModal.classList.add('active');
		return;
	    }
	    
	    // Set active elements
	    activeQuestionMicBtn = micButton;
	    activeQuestionTextarea = textarea;
	    
	    // Add recording class to button
	    micButton.classList.add('recording');
	    
	    // Store starting text
	    const startingText = textarea.value;
	    
	    try {
		// Request microphone access
		mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
		
		// Get API key
		const apiKey = getAssemblyAIApiKey();
		
		// Get temporary token from backend
		const response = await fetch('/api/assemblyai/token/', {
		    method: 'POST',
		    headers: {
			'Content-Type': 'application/json'
		    },
		    body: JSON.stringify({
			api_key: apiKey,
			expires_in: 3600 // Token valid for 1 hour
		    })
		});
		
		if (!response.ok) {
		    throw new Error('Failed to get AssemblyAI token');
		}
		
		const tokenData = await response.json();
		const tempToken = tokenData.token;
		
		// Create audio context
		audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
		const source = audioContext.createMediaStreamSource(mediaStream);
		
		// Create processor node
		let processor;
		
		try {
		    processor = audioContext.createScriptProcessor(4096, 1, 1);
		} catch (error) {
		    console.error('Error creating script processor:', error);
		    processor = audioContext.createScriptProcessor(2048, 1, 1);
		}
		
		source.connect(processor);
		processor.connect(audioContext.destination);
		
		// Create WebSocket connection
		websocket = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=${audioContext.sampleRate}&token=${tempToken}`);
		
		// Initialize transcript storage
		window.partialTranscripts = {};
		window.finalTranscripts = {};
		
		websocket.onopen = () => {
		    console.log('WebSocket connection established');
		    isRecording = true;
		    showToast('Voice recording started', 'info');
		};
		
		websocket.onmessage = (event) => {
		    try {
			const data = JSON.parse(event.data);
			
			if (data.message_type === 'FinalTranscript' || data.message_type === 'PartialTranscript') {
			    if (data.text) {
				// For partial transcripts, simply keep track of the audio_start
				if (data.message_type === 'PartialTranscript') {
				    window.partialTranscripts[data.audio_start] = data.text;
				} else if (data.message_type === 'FinalTranscript') {
				    window.finalTranscripts[data.audio_start] = data.text;
				    if (window.partialTranscripts) {
					delete window.partialTranscripts[data.audio_start];
				    }
				}
				
				// Rebuild the full text from all segments
				let fullText = '';
				
				// Add all final transcripts in order
				const finalStarts = window.finalTranscripts ? Object.keys(window.finalTranscripts).sort((a, b) => a - b) : [];
				for (const start of finalStarts) {
				    fullText += window.finalTranscripts[start] + ' ';
				}
				
				// Add all partial transcripts in order
				const partialStarts = window.partialTranscripts ? Object.keys(window.partialTranscripts).sort((a, b) => a - b) : [];
				for (const start of partialStarts) {
				    fullText += window.partialTranscripts[start] + ' ';
				}
				
				// Update the textarea with the text
				if (activeQuestionTextarea) {
				    // Add a space if there's existing text
				    if (startingText && !startingText.endsWith(' ')) {
					activeQuestionTextarea.value = startingText + ' ' + fullText.trim();
				    } else {
					activeQuestionTextarea.value = startingText + fullText.trim();
				    }
				    
				    // Trigger input event to update state
				    const event = new Event('input', { bubbles: true });
				    activeQuestionTextarea.dispatchEvent(event);
				}
			    }
			}
		    } catch (error) {
			console.error('Error processing WebSocket message:', error);
		    }
		};
		
		websocket.onerror = (error) => {
		    console.error('WebSocket error', error);
		    showToast('WebSocket error - check console for details', 'error');
		    stopQuestionTranscription();
		};
		
		websocket.onclose = (event) => {
		    console.log('WebSocket closed with code:', event.code, 'reason:', event.reason);
		    if (isRecording) {
			showToast(`Connection closed: ${event.reason || 'Unknown reason'}`, 'warning');
			stopQuestionTranscription();
		    }
		};
		
		// Set up audio processing
		processor.onaudioprocess = (e) => {
		    if (!isRecording || !websocket || websocket.readyState !== WebSocket.OPEN) return;
		    
		    try {
			// Get audio data
			const inputData = e.inputBuffer.getChannelData(0);
			
			// Convert to 16-bit PCM
			const pcmData = convertToInt16(inputData);
			
			// Send to AssemblyAI
			websocket.send(pcmData);
		    } catch (err) {
			console.error('Error processing audio:', err);
		    }
		};
		
	    } catch (error) {
		console.error('Error starting question transcription:', error);
		showToast('Error starting speech recording: ' + error.message, 'error');
		
		// Reset state
		micButton.classList.remove('recording');
		activeQuestionMicBtn = null;
		activeQuestionTextarea = null;
		
		// Clean up resources
		if (mediaStream) {
		    mediaStream.getTracks().forEach(track => track.stop());
		    mediaStream = null;
		}
	    }
	}
	
	// Stop question transcription
	function stopQuestionTranscription() {
	    isRecording = false;
	    
	    // Remove recording class
	    if (activeQuestionMicBtn) {
		activeQuestionMicBtn.classList.remove('recording');
	    }
	    
	    // Clean up WebSocket
	    if (websocket) {
		try {
		    if (websocket.readyState === WebSocket.OPEN) {
			websocket.send(JSON.stringify({ terminate_session: true }));
			setTimeout(() => {
			    websocket.close();
			}, 300);
		    } else {
			websocket.close();
		    }
		} catch (e) {
		    console.error('Error closing websocket:', e);
		}
		websocket = null;
	    }
	    
	    // Clean up audio context
	    if (audioContext && audioContext.state !== 'closed') {
		try {
		    audioContext.close();
		} catch (e) {
		    console.error('Error closing audio context:', e);
		}
		audioContext = null;
	    }
	    
	    // Stop microphone
	    if (mediaStream) {
		mediaStream.getTracks().forEach(track => track.stop());
		mediaStream = null;
	    }
	    
	    showToast('Voice recording stopped', 'success');
	    
	    // Reset active elements
	    activeQuestionMicBtn = null;
	    activeQuestionTextarea = null;
	}
	
	// Start AssemblyAI recording
	async function startAssemblyAIRecording() {
	    try {
		const apiKey = getAssemblyAIApiKey();
		if (!apiKey) {
		    assemblyAIKeyModal.classList.add('active');
		    return false;
		}
		
		// Request microphone access
		mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
		
		// Get temporary token
		try {
		    const response = await fetch('/api/assemblyai/token/', {
			method: 'POST',
			headers: {
			    'Content-Type': 'application/json'
			},
			body: JSON.stringify({
			    api_key: apiKey,
			    expires_in: 3600 // Token valid for 1 hour
			})
		    });
		    
		    if (!response.ok) {
			let errorMessage = 'Failed to authenticate with AssemblyAI';
			try {
			    const errorData = await response.json();
			    errorMessage = errorData.error || errorMessage;
			} catch (e) {
			    errorMessage = await response.text();
			}
			console.error('Failed to get token:', response.status, errorMessage);
			showToast(errorMessage, 'error');
			
			// Clean up resources
			mediaStream.getTracks().forEach(track => track.stop());
			mediaStream = null;
			return false;
		    }
		    
		    const tokenData = await response.json();
		    const tempToken = tokenData.token;
		    
		    // Create audio context
		    audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
		    const source = audioContext.createMediaStreamSource(mediaStream);
		    
		    // Create processor node
		    let processor;
		    
		    try {
			processor = audioContext.createScriptProcessor(4096, 1, 1);
		    } catch (error) {
			console.error('Error creating script processor:', error);
			processor = audioContext.createScriptProcessor(2048, 1, 1);
		    }
		    
		    source.connect(processor);
		    processor.connect(audioContext.destination);
		    
		    // Create WebSocket connection
		    websocket = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=${audioContext.sampleRate}&token=${tempToken}`);
		    
		    // Initialize transcript storage
		    window.partialTranscripts = {};
		    window.finalTranscripts = {};
		    
		    websocket.onopen = () => {
			console.log('WebSocket connection established');
			isRecording = true;
			recordingIndicator.classList.add('active');
			showToast('Voice recording started', 'info');
		    };
		    
		    websocket.onmessage = (event) => {
			try {
			    const data = JSON.parse(event.data);
			    
			    if (data.message_type === 'FinalTranscript' || data.message_type === 'PartialTranscript') {
				if (data.text) {
				    // For partial transcripts, simply keep track of the audio_start
				    // and replace the entire text for that segment
				    if (data.message_type === 'PartialTranscript') {
					// Store the text by audio segment
					if (!window.partialTranscripts) window.partialTranscripts = {};
					window.partialTranscripts[data.audio_start] = data.text;
				    } else if (data.message_type === 'FinalTranscript') {
					// For final transcripts, add to a different tracking object
					if (!window.finalTranscripts) window.finalTranscripts = {};
					window.finalTranscripts[data.audio_start] = data.text;
					// Clear any partial transcripts for this segment
					if (window.partialTranscripts) {
					    delete window.partialTranscripts[data.audio_start];
					}
				    }
				    
				    // Rebuild the full text from all segments
				    let fullText = '';
				    
				    // Add all final transcripts in order
				    const finalStarts = window.finalTranscripts ? Object.keys(window.finalTranscripts).sort((a, b) => a - b) : [];
				    for (const start of finalStarts) {
					fullText += window.finalTranscripts[start] + ' ';
				    }
				    
				    // Add all partial transcripts in order
				    const partialStarts = window.partialTranscripts ? Object.keys(window.partialTranscripts).sort((a, b) => a - b) : [];
				    for (const start of partialStarts) {
					fullText += window.partialTranscripts[start] + ' ';
				    }
				    
				    // Update the editor content
				    // First, get the current selection
				    const selection = window.getSelection();
				    if (selection.rangeCount > 0) {
					const range = selection.getRangeAt(0);
					
					// Find the paragraph or contenteditable element
					let container = range.startContainer;
					while (container && container.nodeType !== Node.ELEMENT_NODE) {
					    container = container.parentNode;
					}
					
					// If we have a container element that's suitable for transcription
					if (container && container.isContentEditable) {
					    // Replace or insert text
					    if (window.transcriptionArea) {
						// If we've already created a transcription area, update it
						window.transcriptionArea.textContent = fullText;
					    } else {
						// Create a new paragraph for transcription
						const p = document.createElement('p');
						p.textContent = fullText;
						// Insert at cursor
						range.deleteContents();
						range.insertNode(p);
						// Store reference
						window.transcriptionArea = p;
					    }
					    
					    updateWordCharCount();
					}
				    }
				}
			    }
			} catch (error) {
			    console.error('Error processing WebSocket message:', error);
			}
		    };
		    
		    websocket.onerror = (error) => {
			console.error('WebSocket error', error);
			showToast('WebSocket error - check console for details', 'error');
			stopAssemblyAIRecording();
		    };
		    
		    websocket.onclose = (event) => {
			console.log('WebSocket closed with code:', event.code, 'reason:', event.reason);
			if (isRecording) {
			    showToast(`Connection closed: ${event.reason || 'Unknown reason'}`, 'warning');
			    stopAssemblyAIRecording();
			}
		    };
		    
		    // Set up audio processing
		    processor.onaudioprocess = (e) => {
			if (!isRecording || !websocket || websocket.readyState !== WebSocket.OPEN) return;
			
			try {
			    // Get audio data
			    const inputData = e.inputBuffer.getChannelData(0);
			    
			    // Convert to 16-bit PCM
			    const pcmData = convertToInt16(inputData);
			    
			    // Send to AssemblyAI
			    websocket.send(pcmData);
			} catch (err) {
			    console.error('Error processing audio:', err);
			}
		    };
		    
		    return true;
		} catch (error) {
		    console.error('Error getting temporary token:', error);
		    showToast('Failed to authenticate with AssemblyAI: ' + error.message, 'error');
		    
		    // Clean up resources
		    if (mediaStream) {
			mediaStream.getTracks().forEach(track => track.stop());
			mediaStream = null;
		    }
		    
		    return false;
		}
	    } catch (error) {
		console.error('Error starting AssemblyAI:', error);
		showToast('Error starting speech recording: ' + error.message, 'error');
		return false;
	    }
	}
	
	// Stop AssemblyAI recording
	function stopAssemblyAIRecording() {
	    isRecording = false;
	    recordingIndicator.classList.remove('active');
	    
	    // Clean up WebSocket
	    if (websocket) {
		try {
		    if (websocket.readyState === WebSocket.OPEN) {
			// The correct way to terminate an AssemblyAI session
			websocket.send(JSON.stringify({ terminate_session: true }));
			console.log('Sent terminate_session message');
			
			// Give it a moment to process before closing
			setTimeout(() => {
			    try {
				websocket.close();
				websocket = null;
			    } catch (e) {
				console.error('Error closing websocket:', e);
			    }
			}, 300);
		    } else {
			websocket.close();
			websocket = null;
		    }
		} catch (e) {
		    console.error('Error during websocket termination:', e);
		    websocket = null;
		}
	    }
	    
	    // Clean up audio context
	    if (audioContext && audioContext.state !== 'closed') {
		try {
		    audioContext.close().catch(e => console.error('Error closing audio context:', e));
		} catch (e) {
		    console.error('Error during audioContext.close():', e);
		}
		audioContext = null;
	    }
	    
	    // Stop microphone
	    if (mediaStream) {
		try {
		    mediaStream.getTracks().forEach(track => {
			track.stop();
			console.log('Microphone track stopped');
		    });
		} catch (e) {
		    console.error('Error stopping media tracks:', e);
		}
		mediaStream = null;
	    }
	    
	    window.lastPartialRange = null;
	    showToast('Voice recording stopped', 'success');
	    
	    // Clear transcription area reference
	    window.transcriptionArea = null;
	}
	
	// Add comment
	function addComment() {
	    // If toolbar is collapsed, expand it
	    if (isToolbarCollapsed) {
		toggleFloatingToolbar();
	    }
	    
	    // Get current cursor position
	    const selection = window.getSelection();
	    if (selection.rangeCount > 0) {
		const range = selection.getRangeAt(0);
		const rect = range.getBoundingClientRect();
		
		// Create inline comment
		createInlineComment(rect.left, rect.top, range);
	    } else {
		showToast('Please place cursor where you want to add a comment', 'warning');
	    }
	}
	
	// Create inline comment
	function createInlineComment(left, top, range) {
	    // Clone the template
	    const commentTemplate = inlineCommentTemplate.querySelector('.inline-comment').cloneNode(true);
	    
	    // Set position
	    const paperRect = editor.getBoundingClientRect();
	    
	    // Position the comment to the right of the text
	    commentTemplate.style.left = `${paperRect.right + 20}px`;
	    commentTemplate.style.top = `${top}px`;
	    
	    // Store range for later use
	    commentTemplate.dataset.rangeInfo = JSON.stringify({
		startContainer: getNodePath(range.startContainer),
		startOffset: range.startOffset,
		endContainer: getNodePath(range.endContainer),
		endOffset: range.endOffset
	    });
	    
	    // Add to document
	    document.body.appendChild(commentTemplate);
	    activeCommentElement = commentTemplate;
	    
	    // Add event listeners
	    const closeBtn = commentTemplate.querySelector('.inline-comment-close');
	    closeBtn.addEventListener('click', function() {
		commentTemplate.remove();
		activeCommentElement = null;
	    });
	    
	    const saveBtn = commentTemplate.querySelector('.save-comment');
	    const textarea = commentTemplate.querySelector('textarea');
	    
	    // Focus textarea
	    textarea.focus();
	    
	    saveBtn.addEventListener('click', function() {
		const commentText = textarea.value.trim();
		
		if (commentText === '') {
		    showToast('Please enter a comment', 'warning');
		    return;
		}
		
		// Create a comment marker
		createCommentMarker(commentText, range, top);
		
		// Remove comment form
		commentTemplate.remove();
		activeCommentElement = null;
		
		showToast('Comment added', 'success');
	    });
	}
	
	// Create a comment marker
	function createCommentMarker(text, range, top) {
	    commentCount++;
	    
	    // Create marker
	    const marker = document.createElement('div');
	    marker.className = 'comment-marker';
	    marker.textContent = commentCount;
	    marker.title = 'Click to view comment';
	    
	    // Store comment data
	    const commentData = {
		id: commentCount,
		text: text,
		rangeInfo: {
		    startContainer: getNodePath(range.startContainer),
		    startOffset: range.startOffset,
		    endContainer: getNodePath(range.endContainer),
		    endOffset: range.endOffset
		},
		timestamp: new Date().toISOString()
	    };
	    
	    // Set position
	    const paperRect = editor.getBoundingClientRect();
	    marker.style.left = `${paperRect.right + 10}px`;
	    marker.style.top = `${top}px`;
	    
	    // Store comment data in marker
	    marker.dataset.commentId = commentCount;
	    marker.dataset.commentText = text;
	    marker.dataset.rangeInfo = JSON.stringify(commentData.rangeInfo);
	    marker.dataset.timestamp = commentData.timestamp;
	    
	    // Add event listener
	    marker.addEventListener('click', function() {
		showComment(marker);
	    });
	    
	    // Add to document
	    document.body.appendChild(marker);
	    
	    // Save to localStorage
	    saveCommentToLocalStorage(commentData);
	}
	
	// Show comment when marker is clicked
	function showComment(marker) {
	    // If another comment is open, close it
	    if (activeCommentElement) {
		activeCommentElement.remove();
	    }
	    
	    // Create comment element
	    const comment = document.createElement('div');
	    comment.className = 'inline-comment';
	    
	    // Set position
	    comment.style.left = `${parseInt(marker.style.left) + 30}px`;
	    comment.style.top = `${parseInt(marker.style.top) - 20}px`;
	    
	    // Parse timestamp
	    const timestamp = new Date(marker.dataset.timestamp);
	    const formattedDate = timestamp.toLocaleString();
	    
	    // Set content
	    comment.innerHTML = `
		<div class="inline-comment-header">
		    <div class="inline-comment-title">Comment #${marker.dataset.commentId}</div>
		    <button class="inline-comment-close"><i class="fas fa-times"></i></button>
		</div>
		<div class="inline-comment-body">
		    <div style="margin-bottom: 8px; font-size: 12px; color: var(--text-secondary);">${formattedDate}</div>
		    <div style="padding: 8px; background: var(--background); border-radius: var(--radius-sm); word-break: break-word;">${marker.dataset.commentText}</div>
		</div>
		<div class="inline-comment-footer">
		    <button class="btn btn-secondary btn-sm delete-comment" style="margin-right: 8px;">
			<i class="fas fa-trash"></i> Delete
		    </button>
		    <button class="btn btn-primary btn-sm edit-comment">
			<i class="fas fa-edit"></i> Edit
		    </button>
		</div>
	    `;
	    
	    // Add event listeners
	    document.body.appendChild(comment);
	    activeCommentElement = comment;
	    
	    // Close button
	    comment.querySelector('.inline-comment-close').addEventListener('click', function() {
		comment.remove();
		activeCommentElement = null;
	    });
	    
	    // Delete button
	    comment.querySelector('.delete-comment').addEventListener('click', function() {
		deleteComment(marker.dataset.commentId);
		marker.remove();
		comment.remove();
		activeCommentElement = null;
		showToast('Comment deleted', 'success');
	    });
	    
	    // Edit button
	    comment.querySelector('.edit-comment').addEventListener('click', function() {
		editComment(marker, comment);
	    });
	}
	
	// Edit an existing comment
	function editComment(marker, commentElement) {
	    const oldText = marker.dataset.commentText;
	    
	    // Replace the comment body with an edit form
	    const commentBody = commentElement.querySelector('.inline-comment-body');
	    commentBody.innerHTML = `
		<textarea style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: var(--radius-sm); 
		font-size: 13px; resize: vertical; min-height: 60px; margin-bottom: 8px;">${oldText}</textarea>
	    `;
	    
	    // Replace footer buttons
	    const footer = commentElement.querySelector('.inline-comment-footer');
	    footer.innerHTML = `
		<button class="btn btn-secondary btn-sm cancel-edit" style="margin-right: 8px;">
		    <i class="fas fa-times"></i> Cancel
		</button>
		<button class="btn btn-primary btn-sm save-edit">
		    <i class="fas fa-save"></i> Save
		</button>
	    `;
	    
	    // Focus textarea
	    const textarea = commentBody.querySelector('textarea');
	    textarea.focus();
	    
	    // Add event listeners
	    footer.querySelector('.cancel-edit').addEventListener('click', function() {
		commentElement.remove();
		activeCommentElement = null;
	    });
	    
	    footer.querySelector('.save-edit').addEventListener('click', function() {
		const newText = textarea.value.trim();
		
		if (newText === '') {
		    showToast('Comment cannot be empty', 'warning');
		    return;
		}
		
		// Update marker data
		marker.dataset.commentText = newText;
		
		// Update localStorage
		updateCommentInLocalStorage(marker.dataset.commentId, newText);
		
		// Close edit mode and show updated comment
		commentElement.remove();
		showComment(marker);
		
		showToast('Comment updated', 'success');
	    });
	}
	
	// Save comment to localStorage
	function saveCommentToLocalStorage(commentData) {
	    const comments = getCommentsFromLocalStorage();
	    comments.push(commentData);
	    localStorage.setItem('speedyWriter_comments', JSON.stringify(comments));
	}
	
	// Update comment in localStorage
	function updateCommentInLocalStorage(commentId, newText) {
	    const comments = getCommentsFromLocalStorage();
	    const comment = comments.find(c => c.id.toString() === commentId.toString());
	    
	    if (comment) {
		comment.text = newText;
		localStorage.setItem('speedyWriter_comments', JSON.stringify(comments));
	    }
	}
	
	// Delete comment from localStorage
	function deleteComment(commentId) {
	    const comments = getCommentsFromLocalStorage();
	    const filteredComments = comments.filter(c => c.id.toString() !== commentId.toString());
	    localStorage.setItem('speedyWriter_comments', JSON.stringify(filteredComments));
	}
	
	// Get comments from localStorage
	function getCommentsFromLocalStorage() {
	    const commentsJSON = localStorage.getItem('speedyWriter_comments');
	    return commentsJSON ? JSON.parse(commentsJSON) : [];
	}
	
	// Load comment markers from localStorage
	function loadCommentMarkers() {
	    const comments = getCommentsFromLocalStorage();
	    
	    // Keep track of highest comment ID
	    let maxId = 0;
	    
	    comments.forEach(comment => {
		try {
		    // Get a reference to the range
		    const range = reconstructRange(comment.rangeInfo);
		    if (!range) return;
		    
		    // Get position
		    const rect = range.getBoundingClientRect();
		    
		    // Create marker
		    const marker = document.createElement('div');
		    marker.className = 'comment-marker';
		    marker.textContent = comment.id;
		    marker.title = 'Click to view comment';
		    
		    // Set position
		    const paperRect = editor.getBoundingClientRect();
		    marker.style.left = `${paperRect.right + 10}px`;
		    marker.style.top = `${rect.top}px`;
		    
		    // Store comment data in marker
		    marker.dataset.commentId = comment.id;
		    marker.dataset.commentText = comment.text;
		    marker.dataset.rangeInfo = JSON.stringify(comment.rangeInfo);
		    marker.dataset.timestamp = comment.timestamp;
		    
		    // Add event listener
		    marker.addEventListener('click', function() {
			showComment(marker);
		    });
		    
		    // Add to document
		    document.body.appendChild(marker);
		    
		    // Update maxId
		    maxId = Math.max(maxId, comment.id);
		} catch (error) {
		    console.error('Error creating comment marker', error);
		}
	    });
	    
	    // Set commentCount to maxId
	    commentCount = maxId;
	}
	
	// Helper function to get the DOM path to a node
	function getNodePath(node) {
	    const path = [];
	    
	    // For text nodes, use the parent element
	    if (node.nodeType === Node.TEXT_NODE) {
		node = node.parentNode;
	    }
	    
	    // Start from the node and go up to the editor
	    let current = node;
	    while (current && current !== editor) {
		const parent = current.parentNode;
		
		// Find the index of the current node among its siblings
		const siblings = Array.from(parent.childNodes);
		const index = siblings.indexOf(current);
		
		path.unshift(index);
		current = parent;
	    }
	    
	    return path;
	}
	
	// Helper function to reconstruct a Range from a path
	function reconstructRange(rangeInfo) {
	    try {
		const startPath = rangeInfo.startContainer;
		const endPath = rangeInfo.endContainer;
		
		// Get the start node
		let startNode = editor;
		for (const index of startPath) {
		    startNode = startNode.childNodes[index];
		    if (!startNode) return null;
		}
		
		// Get the end node
		let endNode = editor;
		for (const index of endPath) {
		    endNode = endNode.childNodes[index];
		    if (!endNode) return null;
		}
		
		// Create the range
		const range = document.createRange();
		range.setStart(startNode, rangeInfo.startOffset);
		range.setEnd(endNode, rangeInfo.endOffset);
		
		return range;
	    } catch (error) {
		console.error('Error reconstructing range', error);
		return null;
	    }
	}
	
	// Toggle theme
	function toggleTheme() {
	    document.body.classList.toggle('dark-mode');
	    
	    // Update text
	    const themeToggleLabel = themeToggle.querySelector('.theme-toggle-label');
	    const isDarkMode = document.body.classList.contains('dark-mode');
	    
	    themeToggleLabel.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
	    
	    // Save to localStorage
	    localStorage.setItem('speedyWriter_darkMode', isDarkMode);
	    
	    showToast(`${isDarkMode ? 'Dark' : 'Light'} mode enabled`, 'info');
	}
	
	// Check for API keys
	function getAnthropicApiKey() {
	    return localStorage.getItem('speedyWriter_anthropicApiKey');
	}
	
	function getAssemblyAIApiKey() {
	    return localStorage.getItem('speedyWriter_assemblyAIApiKey');
	}
	
	// Toast Notification
	function showToast(message, type = 'success') {
	    // Set icon based on type
	    toastIcon.className = 'toast-icon';
	    toastIcon.classList.add(type);
	    
	    // Set appropriate icon
	    let iconClass = 'check-circle';
	    if (type === 'error') iconClass = 'times-circle';
	    if (type === 'warning') iconClass = 'exclamation-circle';
	    if (type === 'info') iconClass = 'info-circle';
	    
	    toastIcon.innerHTML = `<i class="fas fa-${iconClass}"></i>`;
	    
	    // Set message
	    toastMessage.textContent = message;
	    
	    // Show toast
	    toast.classList.add('active');
	    
	    // Auto-hide after 3 seconds
	    clearTimeout(window.toastTimeout);
	    window.toastTimeout = setTimeout(() => {
		toast.classList.remove('active');
	    }, 3000);
	}
	
	// Initialize the application
	init();
    });