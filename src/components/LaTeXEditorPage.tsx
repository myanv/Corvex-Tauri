'use client';

import { useState } from "react";
import { LaTeXRenderer } from "./LaTeXRenderer";
import { EditorComponent } from "./Editor";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";


export const LaTeXEditorPage = () => {
    const [content, setContent] = useState<string>('\\documentclass{article}\n\n\\usepackage{amsmath}\n\n\\title{\\LaTeX Editor}\n\n\\author{Your Name}\n\\date{\\today}\n\n\\begin{document}\n\\maketitle\n\\section{Introduction}\n\nThis is one of the most important equations in all of mathematics:\n$\\int_{a}^{b} f(x)dx$\n\n\\end{document}');

    return (
        <ResizablePanelGroup 
            direction="horizontal"
            className="h-full flex"
        >
            <ResizablePanel defaultSize={50}>
                <div className="flex-1 h-full">
                    <EditorComponent content={content} setContent={setContent} />
                </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={30}>
                <LaTeXRenderer content={content} />
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}