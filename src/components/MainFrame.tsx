'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  Menu,
  Plus,
  Search,
  Settings,
  User
} from "lucide-react"
import { Sidebar } from './Sidebar'
import { Content } from './Content'

export default function MainFrame() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedNote, setSelectedNote] = useState<string | null>(null)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const folders = [
    {
      name: "Work",
      notes: ["Project A", "Meeting Notes", "Ideas"]
    },
    {
      name: "Personal",
      notes: ["Journal", "Travel Plans", "Shopping List"]
    }
  ]

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar folders={folders} selectedNote={selectedNote} setSelectedNote={setSelectedNote} sidebarOpen={sidebarOpen} />

      {/* Main Content */}
      <Content toggleSidebar={toggleSidebar} selectedNote={selectedNote} setSelectedNote={setSelectedNote} />
      
    </div>
  )
}