'use client';

import { useState } from "react";
import { LaTeXRenderer } from "./LaTeXRenderer";
import { EditorComponent } from "./Editor";


export const LaTeXEditorPage = () => {
    const [content, setContent] = useState<string>('\\documentclass{article}\n\n\\usepackage{amsmath}\n\n\\title{\\LaTeX Editor}\n\n\\author{Your Name}\n\\date{\\today}\n\n\\begin{document}\n\\maketitle\n\\section{Introduction}\n\nThis is one of the most important equations in all of mathematics:\n$\\int_{a}^{b} f(x)dx$\n\n\\end{document}');

    return (
        <div className="h-full flex">
            <div className="flex-1">
                <EditorComponent content={content} setContent={setContent} />
            </div>
            <div className="flex-grow">
                <LaTeXRenderer content={content} setContent={setContent} />
            </div>
        </div>
    );
}