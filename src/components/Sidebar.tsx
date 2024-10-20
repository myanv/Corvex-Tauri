// src/components/Sidebar.tsx
'use client'

import React, { useState } from 'react'
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

// Recursive component to render folders and their subfolders
const renderFolder = (
  folder: FolderProps,
  selectedFile: string | null,
  onFileClick: (folderPath: string, file: string) => void,
  basePath: string,
  setSelectedNode: (folderPath: string) => void
) => {
  const selectedNode = '';
  const isRootFolder = folder.name === ''
  const displayName = isRootFolder ? "corvex/data" : folder.name
  const currentPath = isRootFolder ? '' : basePath ? `${basePath}/${folder.name}` : folder.name

  return (
    <div key={currentPath || "root"} className="mb-4">
      {/* Folder title - clickable to select folder */}
      <Button
        variant={'outline'}
        className={`flex items-center mb-2 cursor-pointer ${selectedNode === currentPath ? 'bg-slate-100' : ''}`}
        onClick={() => setSelectedNode(currentPath)}
      >
        <ChevronDown className="h-4 w-4 mr-1" />
        <Folder className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">{displayName || "corvex/data"}</span>
      </Button>

      {/* Render files in this folder */}
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

      {/* Recursively render subfolders */}
      {folder.subfolders && folder.subfolders.length > 0 && (
        <div className="pl-6">
          {folder.subfolders.map((subfolder) =>
            renderFolder(subfolder, selectedFile, onFileClick, currentPath, setSelectedNode)
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

          {/* Render the root folder and its subfolders */}
          {renderFolder(folders, selectedFile, onFileClick, folders.name, setSelectedNode)}
          
        </div>
      </ScrollArea>
    </aside>
  )
}
