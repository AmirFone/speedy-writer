import { useAppContext } from '../../context/AppContext';
import './UI.css';

function StatusBar() {
  const { wordCount, charCount, isSaved } = useAppContext();
  
  return (
    <div className="status-bar">
      <div className="word-count">
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>
      <div className="save-status">
        {isSaved ? 'All changes saved' : 'Unsaved changes'}
      </div>
    </div>
  );
}

export default StatusBar;