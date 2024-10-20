// src/components/Sidebar.tsx

'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Plus } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { Folder, FileEntry } from './MainFrame'
import { FileTree } from './FileTree'

interface SidebarProps {
  folders: Folder[],
  selectedFile: string | null
  setSelectedFile: (file: string) => void
  sidebarOpen: boolean
  onFileClick: (folderPath: string, file: string) => void,
  refreshFolders: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  selectedFile,
  sidebarOpen,
  onFileClick,
  refreshFolders
}) => {
  const [selectedNode, setSelectedNode] = useState<string>("") // Track selected folder path

  const handleCreateNewFile = async () => {
    const filename = prompt("Enter the new file name (e.g., Untitled.md):")
    if (filename) {
      const targetPath = selectedNode || "" // Use selected folder, or root if none
      const fullPath = targetPath ? `${targetPath}/${filename}` : filename
      try {
        await invoke('create_file', { filename: fullPath })
        refreshFolders() // Refresh after creation
      } catch (error) {
        console.error('Failed to create file:', error)
      }
    }
  }

  const handleCreateNewFolder = async () => {
    const folderName = prompt("Enter the new folder name:")
    if (folderName) {
      const targetPath = selectedNode || "" // Use selected folder, or root if none
      const fullPath = targetPath ? `${targetPath}/${folderName}` : folderName
      try {
        await invoke('create_folder', { foldername: fullPath })
        refreshFolders() // Refresh after creation
      } catch (error) {
        console.error('Failed to create folder:', error)
      }
    }
  }

  const handleFolderSelect = (folderPath: string | null) => {
    if (folderPath !== null) {
      setSelectedNode(folderPath);
    }
  };

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-r`}>
      <ScrollArea className="h-screen">
        <div className="p-4">

          {/* Buttons to create new file/folder */}
          <Button variant="ghost" className="w-full justify-start mb-4" onClick={handleCreateNewFile}>
            <Plus className="mr-2 h-4 w-4" /> New File
          </Button>
          <Button variant="ghost" className="w-full justify-start mb-4" onClick={handleCreateNewFolder}>
            <Plus className="mr-2 h-4 w-4" /> New Folder
          </Button>

          {/* Render the folder tree */}
          <FileTree folders={folders} onFileClick={onFileClick} onFolderSelect={handleFolderSelect} />

        </div>
      </ScrollArea>
    </aside>
  )
}
