import { Tree, NodeApi, RowRendererProps } from "react-arborist";
import { Folder, FileEntry } from "./MainFrame";
import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ChevronDown, ChevronRight, Folder as FolderIcon, File as FileIcon, Edit, Trash2, PlusCircle } from 'lucide-react';
import { Button } from './ui/button';

interface FileTreeProps {
  folders: Folder[];
  onFileClick: (folderPath: string, file: string) => void;
  onFolderSelect: (folderPath: string | null) => void;
  refreshFolders: () => void;
}

export const FileTree: React.FC<FileTreeProps> = ({ folders, onFileClick, onFolderSelect, refreshFolders }) => {
  const [selectedNode, setSelectedNode] = useState<NodeApi<any> | null>(null); // Keep track of selected node

  // Convert backend Folder structure to react-arborist Tree node structure
  const mapFolderToTree = (folder: Folder): any => ({
    id: folder.id || "root", // Use folder's full path as ID
    name: folder.name || "corvex/data", // Handle root folder name
    children: [
      // Map files as leaf nodes
      ...folder.files.map(file => ({
        id: file.id, // Full path as ID
        name: file.name,
        leaf: true, // Indicate that this is a leaf node (file)
      })),
      // Recursively map subfolders
      ...folder.subfolders.map(mapFolderToTree)
    ],
  });

  const data = folders.map(mapFolderToTree); // Initialize tree data

  const handleSelect = (nodes: NodeApi<any>[]) => {
    const node = nodes[0]; // Get the first (and only) node

    if (!node) return;

    setSelectedNode(node); // Update selected node state

    if (node.data.leaf) {
      // If it's a file
      const filePath = node.data.id;
      const folderPath = filePath.substring(0, filePath.lastIndexOf('/')) || '';
      const fileName = node.data.name;
      onFileClick(folderPath, fileName);
    } else {
      // If it's a folder
      onFolderSelect(node.data.id || "");
    }
  };

  
  // Handle renaming a folder or file
  const handleRename = async () => {
    if (!selectedNode) {
      alert("Please select a folder or file to rename.");
      return;
    }

    const newName = prompt("Enter the new name:");
    if (!newName) return;

    try {
      if (selectedNode.data.leaf) {
        await invoke('modify_file', { old_filename: selectedNode.data.id, new_filename: newName });
      } else {
        await invoke('modify_folder', { old_name: selectedNode.data.id, new_name: newName });
      }
      refreshFolders();
    } catch (error) {
      console.error("Failed to rename:", error);
      alert(`Failed to rename: ${error}`);
    }
  };

  // Handle deleting a folder or file
  const handleDelete = async () => {
    if (!selectedNode) {
      alert("Please select a folder or file to delete.");
      return;
    }

    const confirmDelete = confirm("Are you sure you want to delete this?");
    if (!confirmDelete) return;

    try {
      if (selectedNode.data.leaf) {
        await invoke('delete_file', { filename: selectedNode.data.id });
      } else {
        await invoke('delete_folder', { folder_name: selectedNode.data.id });
      }
      refreshFolders();
    } catch (error) {
      console.error("Failed to delete:", error);
      alert(`Failed to delete: ${error}`);
    }
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex flex-col space-x-2 mb-2">
        <Button onClick={handleRename} variant="secondary">
          <Edit className="h-4 w-4 mr-1" /> Rename
        </Button>
        <Button onClick={handleDelete} variant="destructive">
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </div>

      {/* Render the Tree */}
      <Tree
        data={data}
        onSelect={handleSelect}
        width={300}
        height={600}
        rowHeight={30}
        indent={20}
        selection="single"
        selectionFollowsFocus={true}
        renderRow={(rowProps: RowRendererProps<any>) => {
          const { node, innerRef, attrs } = rowProps;

          return (
            <div
              ref={innerRef}
              {...attrs}
              className={`flex items-center p-1 ${selectedNode?.data.id === node.data.id ? 'bg-gray-200' : ''}`}
            >
              {/* Toggle Icon */}
              {!node.isLeaf && (
                <div onClick={() => node.toggle()} className={`cursor-pointer ml-${node.level * 3}}`}>
                  {node.isOpen ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                </div>
              )}
              {/* Icon based on type */}
              {node.isLeaf ? (
                <FileIcon className="h-4 w-4 mr-2" />
              ) : (
                <FolderIcon className="h-4 w-4 mr-2" />
              )}
              {/* Node Name */}
              <span className="text-sm">{node.data.name}</span>
            </div>
          );
        }}
      />
    </div>
  );
};
