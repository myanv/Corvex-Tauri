'use client'

import React, { useEffect } from "react";
import { TopNav } from "./TopNav";
import { Note } from "./Note";
import { invoke } from "@tauri-apps/api/core";
import { LaTeXEditorPage } from "./LaTeXEditorPage";

interface ContentProps {
    toggleSidebar: () => void;
    setFileContent: (content: string) => void;
    selectedFile: string | null;
    setSelectedFile: (file: string | null) => void;
    fileContent: string;
}

export const Content: React.FC<ContentProps> = ({
    toggleSidebar, 
    selectedFile,
    setFileContent,
    setSelectedFile,
    fileContent,
}) => {
    const fileType = selectedFile?.split('.').pop(); 

    useEffect(() => {
        if (selectedFile) {
            invoke('get_file_content', { filename: selectedFile })
                .then((value) => {
                    setFileContent(value as string)
                })
                .catch((error: any) => console.error('Failed to load file:', error))
        }
    }, [selectedFile])

    const saveFile = () => {
        if (selectedFile) {
            invoke('save_file_content', { filename: selectedFile, content: fileContent })
                .then(() => {
                    console.log('File saved successfully')
                })
                .catch((error: any) => console.error('Failed to save file:', error))
        }
    }

    return (
        <main className="flex-1 flex flex-col overflow-hidden">
            <TopNav 
                selectedFile={selectedFile} 
                setSelectedFile={setSelectedFile} 
                toggleSidebar={toggleSidebar} 
                onSave={saveFile}
            />
            {fileType === 'md' && <Note selectedFile={selectedFile} fileContent={fileContent} setFileContent={setFileContent} />}
            {fileType === 'tex' && <LaTeXEditorPage />}
        </main>
    )
}
