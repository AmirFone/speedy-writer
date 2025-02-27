import useEditor from '../../hooks/useEditor';
import './Toolbar.css';

const FORMATTING_OPTIONS = [
  {
    group: "headings",
    buttons: [
      { command: "formatBlock", value: "h1", icon: "fas fa-heading", style: {}, title: "Heading 1", shortcut: "Ctrl + Alt + 1" },
      { command: "formatBlock", value: "h2", icon: "fas fa-heading", style: { fontSize: "0.9em" }, title: "Heading 2", shortcut: "Ctrl + Alt + 2" },
      { command: "formatBlock", value: "h3", icon: "fas fa-heading", style: { fontSize: "0.8em" }, title: "Heading 3", shortcut: "Ctrl + Alt + 3" }
    ]
  },
  {
    group: "formatting",
    buttons: [
      { command: "bold", icon: "fas fa-bold", title: "Bold", shortcut: "Ctrl + B" },
      { command: "italic", icon: "fas fa-italic", title: "Italic", shortcut: "Ctrl + I" },
      { command: "underline", icon: "fas fa-underline", title: "Underline", shortcut: "Ctrl + U" },
      { command: "strikeThrough", icon: "fas fa-strikethrough", title: "Strikethrough", shortcut: "Ctrl + Shift + X" }
    ]
  },
  {
    group: "alignment",
    buttons: [
      { command: "justifyLeft", icon: "fas fa-align-left", title: "Align Left", shortcut: "Ctrl + Shift + L" },
      { command: "justifyCenter", icon: "fas fa-align-center", title: "Align Center", shortcut: "Ctrl + Shift + E" },
      { command: "justifyRight", icon: "fas fa-align-right", title: "Align Right", shortcut: "Ctrl + Shift + R" }
    ]
  },
  {
    group: "lists",
    buttons: [
      { command: "insertUnorderedList", icon: "fas fa-list-ul", title: "Bullet List", shortcut: "Ctrl + Shift + 8" },
      { command: "insertOrderedList", icon: "fas fa-list-ol", title: "Numbered List", shortcut: "Ctrl + Shift + 7" },
      { command: "formatBlock", value: "blockquote", icon: "fas fa-quote-right", title: "Quote", shortcut: "Ctrl + Shift + ." }
    ]
  },
  {
    group: "insert",
    buttons: [
      { command: "createLink", icon: "fas fa-link", title: "Insert Link", shortcut: "Ctrl + K" },
      { command: "insertHorizontalRule", icon: "fas fa-minus", title: "Horizontal Line", shortcut: "Ctrl + Alt + -" },
      { command: "removeFormat", icon: "fas fa-eraser", title: "Clear Formatting", shortcut: "Ctrl + \\" }
    ]
  }
];

function Toolbar() {
  const { execCommand } = useEditor();
  
  const handleButtonClick = (command, value) => {
    if (command === 'createLink') {
      const url = prompt('Enter link URL:');
      if (url) execCommand(command, url);
    } else {
      execCommand(command, value);
    }
  };
  
  return (
    <div className="toolbar">
      {FORMATTING_OPTIONS.map((group, groupIndex) => (
        <div key={groupIndex} className="toolbar-group">
          {group.buttons.map((button, buttonIndex) => (
            <button
              key={buttonIndex}
              className="tool-btn"
              title={button.title}
              onClick={() => handleButtonClick(button.command, button.value)}
              data-command={button.command}
              data-value={button.value}
            >
              <i className={button.icon} style={button.style}></i>
              <span className="shortcut-tooltip">
                {button.shortcut.split(' + ').map((key, i) => (
                  <span key={i}>
                    {i > 0 && ' + '}
                    <span className="kbd">{key}</span>
                  </span>
                ))}
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Toolbar;