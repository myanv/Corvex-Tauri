import { Tree } from "react-arborist";
import { Folder, FileEntry } from "./MainFrame";
import React, { useState } from 'react';

interface FileTreeProps {
  folders: Folder[]
  onFileClick: (folderPath: string, file: string) => void
  onFolderSelect: (folderPath: string | null) => void
}

export const FileTree: React.FC<FileTreeProps> = ({ folders, onFileClick, onFolderSelect }) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null); 

  // Function to map Folder structure to tree node format for react-arborist
  const mapFolderToTree = (folder: Folder): any => ({
    id: folder.id || "root",
    name: folder.name || "corvex/data",
    children: [
      ...folder.files.map(file => ({
        id: file.id,
        name: file.name,
        leaf: true, // Marks this node as a file
      })),
      ...folder.subfolders.map(mapFolderToTree) // Recursively map subfolders
    ],
  });

  const [treeData, setTreeData] = useState(folders.map(mapFolderToTree));

  // Function to add a new folder or file
  const handleAddNode = (parentId: string, isFile: boolean) => {
    const name = prompt(`Enter the name for the new ${isFile ? 'file' : 'folder'}`);
    if (!name) return;

    const newNode = {
      id: `${parentId}/${name}`,
      name,
      leaf: isFile,
      children: isFile ? [] : []
    };

    const updateTree = (data: any) => {
      return data.map((node: any) => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [...(node.children || []), newNode],
          };
        } else if (node.children) {
          return { ...node, children: updateTree(node.children) };
        }
        return node;
      });
    };

    setTreeData(updateTree(treeData));
  };

  // Function to rename a node
  const handleRenameNode = (nodeId: string) => {
    const newName = prompt("Enter the new name for this node");
    if (!newName) return;

    const updateTree = (data: any) => {
      return data.map((node: any) => {
        if (node.id === nodeId) {
          return { ...node, name: newName };
        } else if (node.children) {
          return { ...node, children: updateTree(node.children) };
        }
        return node;
      });
    };

    setTreeData(updateTree(treeData));
  };

  // Function to remove a node
  const handleRemoveNode = (nodeId: string) => {
    const updateTree = (data: any) => {
      return data.filter((node: any) => {
        if (node.id === nodeId) {
          return false;
        } else if (node.children) {
          node.children = updateTree(node.children);
        }
        return true;
      });
    };

    setTreeData(updateTree(treeData));
  };

  // Handle selection logic
  const handleSelect = (node: any) => {
    if (!node || !node.data) return;

    if (node.data.leaf) {
      const filePath = node.data.id;
      const folderPath = filePath.substring(0, filePath.lastIndexOf('/')) || '';
      const fileName = node.data.name;
      onFileClick(folderPath, fileName);
    } else {
      setSelectedFolder(node.data.id || "");
      onFolderSelect(node.data.id || "");
    }
  };

  return (
    <div>
      <div className="flex mb-4">
        <button onClick={() => handleAddNode(selectedFolder || "root", false)}>Add Folder</button>
        <button onClick={() => handleAddNode(selectedFolder || "root", true)}>Add File</button>
        {selectedFolder && <button onClick={() => handleRenameNode(selectedFolder)}>Rename</button>}
        {selectedFolder && <button onClick={() => handleRemoveNode(selectedFolder)}>Remove</button>}
      </div>

      <Tree
        data={treeData}
        onSelect={handleSelect}
        width={300}
        height={600}
        rowHeight={30}
        indent={20}
        selection="single"
        selectionFollowsFocus={true}
        
      />
    </div>
  );
};
