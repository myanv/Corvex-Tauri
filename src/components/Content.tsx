'use client'

import React from "react";
import { TopNav } from "./TopNav";
import { Note } from "./Note";
import { invoke } from "@tauri-apps/api/core";

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

            <Note selectedFile={selectedFile} fileContent={fileContent} setFileContent={setFileContent} />
        </main>
    )
}
