import React from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Edit2, File, FileIcon, FilePlus, FilePlus2, Folder, FolderPlus, FolderPlusIcon } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onRename: () => void;
  onDelete: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;

}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onRename, onDelete, onNewFile, onNewFolder }) => {
  return (
    <div
      className="z-50 min-w-[10rem] overflow-hidden rounded-md border bg-popover p-2 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
      style={{
        position: 'fixed',
        top: `${y}px`,
        left: `${x}px`,
      }}
    >
      <div className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground" onClick={onNewFile}>
        <FilePlus className="mr-2 h-4 w-4" />
        <span>New file</span>
      </div>
        <div className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground" onClick={onNewFolder}>
        <FolderPlus className="mr-2 h-4 w-4" />
        <span>New folder</span>
      </div>
      <div className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground" onClick={onRename}>
        <Edit2 className="mr-2 h-4 w-4" />
        <span>Rename</span>
      </div>
      <div className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground" onClick={onDelete}>
        <Cross2Icon className="mr-2 h-4 w-4" />
        <span>Delete</span>
      </div>
    </div>
  );
};

export default ContextMenu;