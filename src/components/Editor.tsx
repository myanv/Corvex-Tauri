'use client';

import React, { useRef } from 'react';
import Editor, { Monaco, OnChange, OnMount, BeforeMount } from '@monaco-editor/react';
import type monaco from 'monaco-editor';
import { provideLatexCompletionItems } from '@/hooks/editor/latexAutocomplete';
interface EditorComponentProps {
    content: string;
    setContent: (content: string) => void;
}
export const EditorComponent: React.FC<EditorComponentProps> = ({ content, setContent }) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();


    const handleEditorWillMount: BeforeMount = (monaco: Monaco) => {
        monaco.languages.register({ id: 'latex' })

        // Syntax highlighting
        monaco.languages.setMonarchTokensProvider('latex', {
            tokenizer: {
                root: [
                    [/\\[a-zA-Z]+/, 'keyword'],
                    [/\\\w+/, 'delimiter.curly'],
                    [/\\[{}$]/, 'delimiter.square'],
                    [/\$.*?\$/, 'string'],
                    [/%.*$/, 'comment'],
                ]
            }
        })

        // Auto-completion
        monaco.languages.registerCompletionItemProvider('latex', {
            triggerCharacters: ['\\', '{', '}'],
            provideCompletionItems: (model, position) => {
                return provideLatexCompletionItems(model, position)
            }
        })

        monaco.languages.register({ id: 'latex-snippets' })
    }

    const handleEditorDidMount: OnMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editorRef.current = editor;

        const autoCompletePairs = {
            '(': ')',
            '{': '}',
            '[': ']',
            "'": "'",
            '"': '"',
            '$': '$',
          };
        
        editor.onKeyDown((e) => {
            const openSymbol = e.browserEvent.key;
        
            if (openSymbol in autoCompletePairs) {
                e.preventDefault();

                const closeSymbol = autoCompletePairs[openSymbol as keyof typeof autoCompletePairs];

                const position = editor.getPosition();
                const range = new monaco.Range(position!.lineNumber, position!.column, position!.lineNumber, position!.column);
        
                editor.executeEdits('', [
                    {
                        range: range,
                        text: `${openSymbol}${closeSymbol}`,
                        forceMoveMarkers: true,
                    },
                ]);
        
                // Move the cursor
                editor.setPosition({ lineNumber: position!.lineNumber, column: position!.column + 1 });
            }
        });
    };

    const handleEditorChange: OnChange = (value: string | undefined, event: monaco.editor.IModelContentChangedEvent) => {
        setContent(value || '');
    }
    return (
        <Editor
            height="100%"
            defaultLanguage="latex"
            defaultValue='\\documentclass{article}\n\\begin{document}\n\n\\end{document}'
            value={content}
            theme="vs-dark"
            onMount={handleEditorDidMount}
            beforeMount={handleEditorWillMount}
            onChange={handleEditorChange}
            options={{
                fontFamily: 'var(--font-geist-sans)',
                fontSize: 16,
                formatOnType: true,
                snippetSuggestions: 'top',
                automaticLayout: true,
                wordWrap: 'on',
            }}
        />
    )
}