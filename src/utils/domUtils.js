/**
 * Gets the DOM path to a node relative to a parent container
 * @param {Node} node - The DOM node to get path for
 * @param {Element} container - The container element (parent reference)
 * @returns {Array} - Array of indices representing the path
 */
export function getNodePath(node, container) {
	const path = [];
	
	// For text nodes, use the parent element
	if (node.nodeType === Node.TEXT_NODE) {
	  node = node.parentNode;
	}
	
	// Start from the node and go up to the container
	let current = node;
	while (current && current !== container) {
	  const parent = current.parentNode;
	  
	  // Find the index of the current node among its siblings
	  const siblings = Array.from(parent.childNodes);
	  const index = siblings.indexOf(current);
	  
	  path.unshift(index);
	  current = parent;
	}
	
	return path;
      }
      
      /**
       * Reconstructs a Range from a serialized path
       * @param {Object} rangeInfo - The serialized range information
       * @param {Element} container - The container element (editor)
       * @returns {Range|null} - The reconstructed range or null if failed
       */
      export function reconstructRange(rangeInfo, container) {
	try {
	  const startPath = rangeInfo.startContainer;
	  const endPath = rangeInfo.endContainer;
	  
	  // Get the start node
	  let startNode = container;
	  for (const index of startPath) {
	    startNode = startNode.childNodes[index];
	    if (!startNode) return null;
	  }
	  
	  // Get the end node
	  let endNode = container;
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