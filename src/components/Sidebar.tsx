// src/components/Sidebar.tsx

import React from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Folder } from './MainFrame';
import { FileTree } from './FileTree';
import { Separator } from './ui/separator';

interface SidebarProps {
  folders: Folder[];
  sidebarOpen: boolean;
  onFileClick: (folderPath: string) => void;
  refreshFolders: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  sidebarOpen,
  onFileClick,
  refreshFolders
}) => {
  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-r`}>
      <ScrollArea className="h-screen">
        <div className="p-4">
          <Separator className='mb-4' />
          <FileTree
            folders={folders}
            onFileClick={onFileClick}
            onFolderSelect={() => {}}
            refreshFolders={refreshFolders}
          />
        </div>
      </ScrollArea>
    </aside>
  );
};
