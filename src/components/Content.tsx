'use client'

import React from "react";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { Settings } from "lucide-react";
import { User } from "lucide-react";
import { Menu } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
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