'use client'

import React from 'react'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { ChevronDown, File, Folder, Plus } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { Folder as FolderProps } from './MainFrame'

interface SidebarProps {
  folders: FolderProps,
  selectedFile: string | null
  setSelectedFile: (file: string) => void
  sidebarOpen: boolean
  onFileClick: (folderPath: string, file: string) => void,
  refreshFolders: () => void
}

const renderFolder = (
  folder: FolderProps,
  selectedFile: string | null,
  onFileClick: (folderPath: string, file: string) => void,
  basePath: string
) => {
  const isRootFolder = folder.name === ''
  const displayName = isRootFolder ? "Root" : folder.name
  const currentPath = isRootFolder ? '' : basePath ? `${basePath}/${folder.name}` : folder.name

  return (
    <div key={currentPath || "root"} className="mb-4">
      <div className="flex items-center mb-2">
        <ChevronDown className="h-4 w-4 mr-1" />
        <Folder className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">{displayName}</span>
      </div>

      {folder.files && folder.files.length > 0 && (
        folder.files.map((file) => (
          <Button
            key={file}
            variant="ghost"
            className={`w-full justify-start pl-8 mb-1 ${selectedFile === `${currentPath}/${file}` ? 'bg-accent' : ''}`}
            onClick={() => onFileClick(currentPath, file)}
          >
            <File className="h-4 w-4 mr-2" />
            <span className="text-sm">{file}</span>
          </Button>
        ))
      )}

      {folder.subfolders && folder.subfolders.length > 0 && (
        <div className="pl-6">
          {folder.subfolders.map((subfolder) =>
            renderFolder(subfolder, selectedFile, onFileClick, currentPath)
          )}
        </div>
      )}
    </div>
  )
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  selectedFile,
  sidebarOpen,
  onFileClick,
  refreshFolders
}) => {

  const handleCreateNewFile = async () => {
    const filename = prompt("Enter the new file name (e.g., Untitled.md):")
    if (filename) {
      try {
        await invoke('create_file', { filename })
        refreshFolders() 
      } catch (error) {
        console.error('Failed to create file:', error)
      }
    }
  }
  
  const handleCreateNewFolder = async () => {
    const folderName = prompt("Enter the new folder name:")
    if (folderName) {
      try {
        await invoke('create_folder', { foldername: folderName })
        refreshFolders() 
      } catch (error) {
        console.error('Failed to create folder:', error)
      }
    }
  }

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-r`}>
      <ScrollArea className="h-screen">
        <div className="p-4">

          <Button variant="ghost" className="w-full justify-start mb-4" onClick={handleCreateNewFile}>
            <Plus className="mr-2 h-4 w-4" /> New File
          </Button>
          <Button variant="ghost" className="w-full justify-start mb-4" onClick={handleCreateNewFolder}>
            <Plus className="mr-2 h-4 w-4" /> New Folder
          </Button>

          {renderFolder(folders, selectedFile, onFileClick, folders.name)}
          
        </div>
      </ScrollArea>
    </aside>
  )
}
