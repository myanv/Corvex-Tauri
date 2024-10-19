import React from 'react'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import {
    ChevronDown,
    File,
    Folder,
    Plus,
} from 'lucide-react'  

interface SidebarProps {
    folders: { name: string; notes: string[] }[]
    selectedNote: string | null
    setSelectedNote: (note: string) => void
    sidebarOpen: boolean
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    folders, 
    selectedNote, 
    setSelectedNote,
    sidebarOpen
}) => {
    return (
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-r`}>
            <ScrollArea className="h-screen">
                <div className="p-4">
                    <Button variant="ghost" className="w-full justify-start mb-4">
                    <Plus className="mr-2 h-4 w-4" /> New
                    </Button>
                    {folders.map((folder) => (
                    <div key={folder.name} className="mb-4">
                        <div className="flex items-center mb-2">
                        <ChevronDown className="h-4 w-4 mr-1" />
                        <Folder className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">{folder.name}</span>
                        </div>
                        {folder.notes.map((note) => (
                        <Button
                            key={note}
                            variant="ghost"
                            className={`w-full justify-start pl-8 mb-1 ${selectedNote === note ? 'bg-accent' : ''}`}
                            onClick={() => setSelectedNote(note)}
                        >
                            <File className="h-4 w-4 mr-2" />
                            <span className="text-sm">{note}</span>
                        </Button>
                        ))}
                    </div>
                    ))}
                </div>
            </ScrollArea>
        </aside>
    )
}