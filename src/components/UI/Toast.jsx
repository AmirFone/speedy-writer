import { useAppContext } from '../../context/AppContext';
import './UI.css';

function Toast() {
  const { toast, setToast } = useAppContext();
  
  const iconClass = () => {
    switch (toast.type) {
      case 'error': return 'times-circle';
      case 'warning': return 'exclamation-circle';
      case 'info': return 'info-circle';
      default: return 'check-circle';
    }
  };
  
  return (
    <div className={`toast ${toast.show ? 'active' : ''}`}>
      <div className={`toast-icon ${toast.type}`}>
        <i className={`fas fa-${iconClass()}`}></i>
      </div>
      <div className="toast-message">{toast.message}</div>
    </div>
  );
}

export default Toast;