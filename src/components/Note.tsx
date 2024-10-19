'use client'

import React from "react";
import { ScrollArea } from "./ui/scroll-area";

interface NoteProps {
    selectedNote: string | null;
}

export const Note: React.FC<NoteProps> = ({ selectedNote }) => {
    return (
        <ScrollArea className="flex-1 p-6">
          {selectedNote ? (
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold mb-4">{selectedNote}</h1>
              <p className="mb-4">
                This is a sample content for the {selectedNote} note. 
              </p>
              <p>
                test
              </p>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Select a note from the sidebar to view its content.
            </div>
          )}
        </ScrollArea>
    )
}