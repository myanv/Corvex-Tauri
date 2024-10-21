// src/components/MainFrame.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { Sidebar } from './Sidebar'
import { Content } from './Content'
import { invoke } from '@tauri-apps/api/core'

export interface FileEntry {
  id: string
  name: string
}

export interface Folder {
  id: string
  name: string
  files: FileEntry[]
  subfolders: Folder[]
}

export default function MainFrame() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [folders, setFolders] = useState<Folder[]>([])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  useEffect(() => {
    refreshFolders();
  }, []) 

  const handleFileClick = async (folderPath: string, file: string) => {
    try {
      console.log(`Selected file: ${folderPath}/${file}`)

      const content = await invoke<string>('get_file_content', { filename: `${folderPath}/${file}` })

      console.log("Content: ", content)

      setFileContent(content)
      setSelectedFile(`${folderPath}/${file}`)
    } catch (error) {
      console.error('Failed to load file:', error)
    }
  }

  const refreshFolders = async () => {
    try {
      const fetchedFolders = await invoke<Folder[]>('list_all_files')
      setFolders(fetchedFolders) 
      console.log('Refreshed folders and files:', fetchedFolders);
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
        refreshFolders={refreshFolders}
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
