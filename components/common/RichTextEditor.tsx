import React, { useState, useMemo, useRef, useEffect } from 'react';
import { LinkIcon } from '../icons/LinkIcon.tsx';
import { FormatClearIcon } from '../icons/FormatClearIcon.tsx';
import { HighlighterIcon } from '../icons/HighlighterIcon.tsx';
import { TextColorIcon } from '../icons/TextColorIcon.tsx';
import { ChevronDownIcon } from '../icons/ChevronDownIcon.tsx';
import { FontSizeIcon } from '../icons/FontSizeIcon.tsx';

const RichTextEditor: React.FC<{ value: string, onChange: (value: string) => void, placeholder?: string }> = ({ value, onChange, placeholder }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true);
    
    const handleInput = () => {
        if (editorRef.current) {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const node = range.startContainer;
                const offset = range.startOffset;

                const textContentBeforeCursor = node.textContent?.slice(0, offset);
                if (node.nodeType === Node.TEXT_NODE && (textContentBeforeCursor?.endsWith('* ') || textContentBeforeCursor?.endsWith('*\u00A0'))) {
                    
                    const textBeforeStar = textContentBeforeCursor.slice(0, -2);
                    if (textBeforeStar.trim() === '') {
                        const textNode = node as Text;
                        
                        textNode.textContent = textBeforeStar + textNode.textContent!.slice(offset);
                        
                        range.setStart(textNode, offset - 2);
                        range.setEnd(textNode, offset - 2);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        
                        document.execCommand('insertUnorderedList', false, undefined);
                    }
                }
            }

            onChange(editorRef.current.innerHTML);
            const hasContent = !!editorRef.current.textContent?.trim() || !!editorRef.current.querySelector('li, ul, ol, img');
            setIsPlaceholderVisible(!hasContent);
        }
    };

     const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Tab') {
            const selection = window.getSelection();
            if (selection && selection.anchorNode) {
                let node: Node | null = selection.anchorNode;
                let inListItem = false;
                while (node && node !== editorRef.current) {
                    if (node.nodeName === 'LI') {
                        inListItem = true;
                        break;
                    }
                    node = node.parentNode;
                }

                if (inListItem) {
                    e.preventDefault();
                    const command = e.shiftKey ? 'outdent' : 'indent';
                    document.execCommand(command, false, undefined);
                }
            }
        }
    };
    
    const handleFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    };

    const handleLink = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.getRangeAt(0).collapsed) {
            alert('Please select some text to create a link.');
            return;
        }
        const url = prompt('Enter the URL:');
        if (url) {
            handleFormat('createLink', url);
        }
    };
    
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
        if(editorRef.current) {
            const hasContent = !!editorRef.current.textContent?.trim() || !!editorRef.current.querySelector('li, ul, ol, img');
            setIsPlaceholderVisible(!hasContent);
        }
    }, [value]);
    
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const handlePaste = (event: ClipboardEvent) => {
            event.preventDefault();
            const text = event.clipboardData?.getData('text/plain');
            if (text) {
                document.execCommand('insertText', false, text);
            }
        };

        editor.addEventListener('paste', handlePaste);

        return () => {
            editor.removeEventListener('paste', handlePaste);
        };
    }, []);

    const toolbarButtonClasses = "p-1.5 rounded hover:bg-gray-200 text-gray-700 text-sm w-8 h-8 flex items-center justify-center";

    return (
        <div className="relative border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
            <div className="p-1 border-b border-gray-300 bg-gray-50 flex items-center gap-1 rounded-t-md flex-wrap">
                <button type="button" onClick={() => handleFormat('bold')} className={`${toolbarButtonClasses} font-bold`} aria-label="Bold">B</button>
                <button type="button" onClick={() => handleFormat('italic')} className={`${toolbarButtonClasses} italic`} aria-label="Italic">I</button>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <button type="button" onClick={() => handleFormat('insertUnorderedList')} className={toolbarButtonClasses} aria-label="Bulleted List">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>
                </button>
                <button type="button" onClick={() => handleFormat('insertOrderedList')} className={toolbarButtonClasses} aria-label="Numbered List">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5"/><path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.954.773 0 .448-.285.722-.885.722h-.342v.474z"/><path d="M3.652 7.332v-.474H4c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.954.773 0 .448-.285.722-.885.722h-.342v.474z"/><path d="M2.24 3.862v.428h.832v-.428h.633V5.1h-.633v.569h-.832v-.569H1.41V3.862z"/>
                    </svg>
                </button>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <button type="button" onClick={handleLink} className={toolbarButtonClasses} aria-label="Create Link"><LinkIcon className="w-5 h-5"/></button>
                <button type="button" onClick={() => handleFormat('backColor', '#fff2a8')} className={toolbarButtonClasses} aria-label="Highlight Yellow"><HighlighterIcon className="w-5 h-5" /></button>
                <button type="button" onClick={() => handleFormat('foreColor', '#ef4444')} className={toolbarButtonClasses} aria-label="Text Color Red"><TextColorIcon className="w-5 h-5" /></button>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <button type="button" onClick={() => handleFormat('removeFormat')} className={toolbarButtonClasses} aria-label="Clear Formatting"><FormatClearIcon className="w-5 h-5"/></button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                className="w-full text-sm p-3 min-h-[250px] focus:outline-none rich-text-content text-gray-900"
                role="textbox"
                aria-multiline="true"
            />
            {isPlaceholderVisible && (
                <div className="absolute top-[49px] left-3 text-sm text-gray-500 pointer-events-none select-none">
                    {placeholder}
                </div>
            )}
        </div>
    );
};

export default RichTextEditor;