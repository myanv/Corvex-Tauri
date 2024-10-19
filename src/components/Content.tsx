'use client'

import React from "react";
import { TopNav } from "./TopNav";
import { Note } from "./Note";

interface ContentProps {
    toggleSidebar: () => void;
    selectedNote: string | null;
    setSelectedNote: (note: string) => void;

}
export const Content: React.FC<ContentProps> = ({
    toggleSidebar, 
    selectedNote, 
    setSelectedNote
}) => {
    return (
        <main className="flex-1 flex flex-col overflow-hidden">
            <TopNav selectedNote={selectedNote} setSelectedNote={setSelectedNote} toggleSidebar={toggleSidebar} />

            <Note selectedNote={selectedNote} />
        </main>
    )
}