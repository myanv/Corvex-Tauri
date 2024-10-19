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
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="ml-4 flex items-center">
              <ChevronRight className="h-4 w-4 mr-1" />
              <span className="font-medium">{selectedNote || "Select a note"}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search"
                className="pl-8 w-64"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Note Content */}
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
      </main>
    )
}