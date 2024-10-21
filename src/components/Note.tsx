'use client'

import React from "react";
import { ScrollArea } from "./ui/scroll-area";

interface NoteProps {
    selectedFile: string | null;
    fileContent: string;
    setFileContent: (content: string) => void;
}

export const Note: React.FC<NoteProps> = ({ selectedFile, fileContent, setFileContent }) => {
    return (
        <ScrollArea className="flex-1 p-6">
          {selectedFile ? (
            <div className="max-w-3xl mx-auto">
              <textarea
                className="w-full h-full p-2 border rounded text-lg"
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder="Start writing your note here..."
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Select a file from the sidebar to view or edit its content.
            </div>
          )}
        </ScrollArea>
    )
}
