import { useAppContext } from '../../context/AppContext';
import './UI.css';

function RecordingIndicator() {
  const { stopSpeechRecording } = useAppContext();
  
  return (
    <div 
      className="recording-indicator active"
      onClick={stopSpeechRecording}
    >
      <div className="pulse"></div>
      <span>Recording... Click to stop</span>
    </div>
  );
}

export default RecordingIndicator;