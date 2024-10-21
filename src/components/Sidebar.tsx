// src/components/Sidebar.tsx

'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Plus } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { Folder } from './MainFrame'
import { FileTree } from './FileTree'
import { Separator } from './ui/separator'

interface SidebarProps {
  folders: Folder[],
  setSelectedFile: (file: string) => void
  sidebarOpen: boolean
  onFileClick: (folderPath: string) => void,
  refreshFolders: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  sidebarOpen,
  onFileClick,
  refreshFolders
}) => {
  const [selectedNode, setSelectedNode] = useState<string>("")

  const handleFolderSelect = (folderPath: string | null) => {
    if (folderPath !== null) {
      setSelectedNode(folderPath);
    }
  };

  const handleCreateNewNode = async (type: 'file' | 'folder') => {
    const name = prompt(`Enter the new ${type} name:`)
    if (name) {
      const targetPath = selectedNode === "root" ? "" : (selectedNode || "")
      const fullPath = targetPath ? `${targetPath}/${name}` : name
      try {
        if (type === "file") {
          await invoke('create_file', { filename: fullPath })
        } else {
          await invoke('create_folder', { foldername: fullPath })
        }
        refreshFolders() 
      } catch (error) {
        console.error(`Failed to create new ${type}:`, error)
      }
    }
  }

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-r`}>
      <ScrollArea className="h-screen">
        <div className="p-4">

          <Button variant="ghost" className="w-full justify-start mb-4" onClick={() => handleCreateNewNode('file')}>
            <Plus className="mr-2 h-4 w-4" /> New File
          </Button>
          <Button variant="ghost" className="w-full justify-start mb-4" onClick={() => handleCreateNewNode('folder')}>
            <Plus className="mr-2 h-4 w-4" /> New Folder
          </Button>

          <Separator className='mb-4' />
          
          <FileTree folders={folders} onFileClick={onFileClick} onFolderSelect={handleFolderSelect} refreshFolders={refreshFolders}/>

        </div>
      </ScrollArea>
    </aside>
  )
}
