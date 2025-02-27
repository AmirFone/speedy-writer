/**
 * Commands for text formatting in the editor
 */
export const FORMAT_COMMANDS = {
	HEADINGS: [
	  { command: "formatBlock", value: "h1", icon: "fas fa-heading", title: "Heading 1", shortcut: "Ctrl+Alt+1" },
	  { command: "formatBlock", value: "h2", icon: "fas fa-heading", title: "Heading 2", shortcut: "Ctrl+Alt+2" },
	  { command: "formatBlock", value: "h3", icon: "fas fa-heading", title: "Heading 3", shortcut: "Ctrl+Alt+3" },
	],
	TEXT_FORMATTING: [
	  { command: "bold", icon: "fas fa-bold", title: "Bold", shortcut: "Ctrl+B" },
	  { command: "italic", icon: "fas fa-italic", title: "Italic", shortcut: "Ctrl+I" },
	  { command: "underline", icon: "fas fa-underline", title: "Underline", shortcut: "Ctrl+U" },
	  { command: "strikeThrough", icon: "fas fa-strikethrough", title: "Strikethrough", shortcut: "Ctrl+Shift+X" },
	],
	ALIGNMENT: [
	  { command: "justifyLeft", icon: "fas fa-align-left", title: "Align Left", shortcut: "Ctrl+Shift+L" },
	  { command: "justifyCenter", icon: "fas fa-align-center", title: "Align Center", shortcut: "Ctrl+Shift+E" },
	  { command: "justifyRight", icon: "fas fa-align-right", title: "Align Right", shortcut: "Ctrl+Shift+R" },
	  { command: "justifyFull", icon: "fas fa-align-justify", title: "Justify", shortcut: "Ctrl+Shift+J" },
	],
	LISTS: [
	  { command: "insertUnorderedList", icon: "fas fa-list-ul", title: "Bullet List", shortcut: "Ctrl+Shift+8" },
	  { command: "insertOrderedList", icon: "fas fa-list-ol", title: "Numbered List", shortcut: "Ctrl+Shift+7" },
	  { command: "formatBlock", value: "blockquote", icon: "fas fa-quote-right", title: "Quote", shortcut: "Ctrl+Shift+." },
	],
	MISC: [
	  { command: "createLink", icon: "fas fa-link", title: "Insert Link", shortcut: "Ctrl+K" },
	  { command: "insertHorizontalRule", icon: "fas fa-minus", title: "Horizontal Line", shortcut: "Ctrl+Alt+-" },
	  { command: "removeFormat", icon: "fas fa-eraser", title: "Clear Formatting", shortcut: "Ctrl+\\" },
	],
      };
      
      /**
       * Keyboard shortcut mapping
       */
      export const KEYBOARD_SHORTCUTS = {
	// Format commands
	'ctrl+b': 'bold',
	'ctrl+i': 'italic',
	'ctrl+u': 'underline',
	'ctrl+shift+x': 'strikeThrough',
	'ctrl+shift+l': 'justifyLeft',
	'ctrl+shift+e': 'justifyCenter',
	'ctrl+shift+r': 'justifyRight',
	'ctrl+shift+j': 'justifyFull',
	'ctrl+shift+7': 'insertOrderedList',
	'ctrl+shift+8': 'insertUnorderedList',
	'ctrl+shift+.': { command: 'formatBlock', value: 'blockquote' },
	'ctrl+k': 'createLink',
	'ctrl+alt+-': 'insertHorizontalRule',
	'ctrl+\\': 'removeFormat',
	'ctrl+alt+1': { command: 'formatBlock', value: 'h1' },
	'ctrl+alt+2': { command: 'formatBlock', value: 'h2' },
	'ctrl+alt+3': { command: 'formatBlock', value: 'h3' },
	
	// Custom commands
	'ctrl+s': 'save',
	'ctrl+r': 'aiRewrite',
	'ctrl+d': 'speechToText',
	'ctrl+/': 'addComment',
      };