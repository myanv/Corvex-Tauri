// src/components/MainFrame.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Sidebar } from './Sidebar'
import { Content } from './Content'
import { invoke } from '@tauri-apps/api/core'

export interface Folder {
  name: string
  files: string[]
  subfolders: Folder[]
}

export default function MainFrame() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')

  // Initialize with the root folder structure
  const [folders, setFolders] = useState<Folder>({
    name: '',
    files: [],
    subfolders: []
  })

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  // Fetch folders and files once on component mount
  useEffect(() => {
    refreshFoldersAndFiles();
  }, []) // Empty dependency array to prevent infinite loops

  const handleFileClick = async (folderPath: string, file: string) => {
    try {
      const content = await invoke<string>('get_file_content', { filename: `${folderPath}/${file}` })
      setFileContent(content)
      setSelectedFile(`${folderPath}/${file}`)
    } catch (error) {
      console.error('Failed to load file:', error)
    }
  }

  const refreshFoldersAndFiles = async () => {
    try {
      const fetchedFolders = await invoke<Folder[]>('list_all_files')
      if (fetchedFolders.length > 0) {
        setFolders(fetchedFolders[0]) // Assume root folder is returned at index 0
        console.log('Refreshed folders and files:', fetchedFolders[0]);
      }
    } catch (error) {
      console.error('Error refreshing folders:', error)
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar
        folders={folders}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        sidebarOpen={sidebarOpen}
        onFileClick={handleFileClick}
        refreshFolders={refreshFoldersAndFiles}
      />

      <Content
        toggleSidebar={toggleSidebar}
        selectedFile={selectedFile}
        setFileContent={setFileContent}
        fileContent={fileContent}
        setSelectedFile={setSelectedFile}
      />
    </div>
  )
}
