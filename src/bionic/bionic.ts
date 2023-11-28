const commonWords: Set<string> = new Set(["the", "and", "in", "of", "to", "a", "is", "it", "for", "on", "with", "as", "this", "by", "that", "are", "at", "be"]);

function applyBionicReading(text: string): string {
    return text.split(' ').map(word => {
        if (commonWords.has(word.toLowerCase())) {
            return word;
        }

        let boldLength: number = word.length > 5 ? 2 : 1;
        return `<b>${word.slice(0, boldLength)}</b>${word.slice(boldLength)}`;
    }).join(' ');
}

export function traverseAndConvert(node: Node): void {
    if (node.nodeType === 3 && node.nodeValue && node.parentNode) { // Node is a text node and has a parent
        const span: HTMLSpanElement = document.createElement('span');
        span.innerHTML = applyBionicReading(node.nodeValue);
        node.parentNode.replaceChild(span, node);
    } else if (node.nodeType === 1 && node.childNodes) { // Node is an element
        Array.from(node.childNodes).forEach(child => traverseAndConvert(child));

        // Additional check for shadow root
        const shadowRoot: ShadowRoot | null = (node as HTMLElement).shadowRoot;
        if (shadowRoot) {
            traverseAndConvert(shadowRoot);
        }
    }
}

// Apply Bionic Reading to all text in the body
// traverseAndConvert(document.body);
