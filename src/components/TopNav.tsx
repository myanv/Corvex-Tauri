'use client'

import { Button } from './ui/button'
import { ChevronRight } from 'lucide-react'
import { Input } from './ui/input'
import { Search } from 'lucide-react'
import { Settings } from 'lucide-react'
import { User } from 'lucide-react'
import { Menu } from 'lucide-react'

interface TopNavProps {
    selectedNode: string | null
    setSelectedNode: (note: string | null) => void
    toggleSidebar: () => void
}

export const TopNav: React.FC<TopNavProps> = ({ 
    selectedNode, 
    setSelectedNode, 
    toggleSidebar
}) => {

    return (
        <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <Menu className="h-5 w-5" />
                </Button>
                <div className="ml-4 flex items-center">
                <ChevronRight className="h-4 w-4 mr-1" />
                <span className="font-medium">{selectedNode || "Select a note"}</span>
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
    )
}