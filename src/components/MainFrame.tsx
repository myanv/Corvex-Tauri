'use client'

import React, { useEffect, useState } from 'react'
import { Sidebar } from './Sidebar'
import { Content } from './Content'
import { invoke } from '@tauri-apps/api/core'

export default function MainFrame() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [nodes, setNodes] = useState<string[]>([])
  const [nodeContent, setNodeContent] = useState<string>('')
  const [folders, setFolders] = useState<{ name: string; nodes: string[] }[]>([])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  useEffect(() => {
    invoke('list_nodes')
      .then((value) => setNodes(value as string[]))
      .catch((error) => console.error(error))
    
    invoke('list_folders')
      .then((value) => setFolders(value as { name: string; nodes: string[] }[]))
      .catch((error) => console.error(error))
  }, []);

  const handleNodeClick = (folder: string, node: string) => {
    invoke('load_node_from_folder', { folder, filename: node })
      .then((value) => setSelectedNode(`${folder}/${node}`))
      .catch((error) => console.error('Failed to load node:', error))
  
  }

  const loadNode = (filename: string) => {
    invoke('load_node', { filename }  )
      .then((value) => {
        setNodeContent(value as string)
        setSelectedNode(filename)
      })
      .catch((error) => console.error('Failed to load node:', error))
  }

  const saveNode = () => {
    if (selectedNode) {
      invoke('save_node', { filename: selectedNode, content: nodeContent })
        .then(() => {
          console.log('Node saved successfully')
        })
        .catch((error) => console.error('Failed to save node:', error))
    }
  }

  

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar folders={folders} selectedNote={selectedNode} setSelectedNote={setSelectedNode} sidebarOpen={sidebarOpen} />

      <Content toggleSidebar={toggleSidebar} selectedNode={selectedNode} setSelectedNode={setSelectedNode} nodeContent={nodeContent} setNodeContent={setNodeContent} />
      
    </div>
  )
}