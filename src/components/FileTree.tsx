import { Tree, NodeApi, RowRendererProps } from "react-arborist";
import { Folder, FileEntry } from "./MainFrame";
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ChevronDown, ChevronRight, Folder as FolderIcon, File as FileIcon } from 'lucide-react';

interface FileTreeProps {
  folders: Folder[];
  onFileClick: (folderPath: string, file: string) => void;
  onFolderSelect: (folderPath: string | null) => void;
  refreshFolders: () => void;
}

export const FileTree: React.FC<FileTreeProps> = ({
  folders,
  onFileClick,
  onFolderSelect,
  refreshFolders
}) => {
  const [selectedNode, setSelectedNode] = useState<NodeApi<any> | null>(null);

  // State for context menu
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    node: NodeApi<any> | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  });

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [contextMenu]);

  // Convert backend Folder structure to react-arborist Tree node structure
  const mapFolderToTree = (folder: Folder): any => ({
    id: folder.id || "root",
    name: folder.name || "corvex/data",
    children: [
      ...folder.files.map(file => ({
        id: file.id,
        name: file.name,
        leaf: true,
      })),
      ...folder.subfolders.map(mapFolderToTree)
    ],
  });

  const data = folders.map(mapFolderToTree);

  const handleSelect = (nodes: NodeApi<any>[]) => {
    const node = nodes[0];
    if (!node) return;

    setSelectedNode(node); // Update selected node state

    console.log(node);

    if (node.data.leaf) {
      const filePath = node.data.id;
      const folderPath = filePath.substring(0, filePath.lastIndexOf('/')) || '';
      const fileName = node.data.name;
      onFileClick(folderPath, fileName);
    } else {
      onFolderSelect(node.data.id || "");
    }
  };

  // Handle renaming a folder or file
  const handleRename = async () => {
    if (!contextMenu.node) return;

    const node = contextMenu.node;
    const newName = prompt("Enter the new name:");
    if (!newName) return;

    try {
      if (node.data.leaf) {
        await invoke('modify_file', { oldFilename: node.data.id, newFilename: newName });
      } else {
        await invoke('modify_folder', { oldName: node.data.id, newName: newName });
      }
      refreshFolders();
    } catch (error) {
      console.error("Failed to rename:", error);
      alert(`Failed to rename: ${error}`);
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  // Handle deleting a folder or file
  const handleDelete = async () => {
    if (!contextMenu.node) return;

    const node = contextMenu.node;
    const confirmDelete = confirm("Are you sure you want to delete this?");
    if (!confirmDelete) return;

    try {
      if (node.data.leaf) {
        await invoke('delete_file', { filename: node.data.id });
      } else {
        await invoke('delete_folder', { folderName: node.data.id });
      }
      refreshFolders();
    } catch (error) {
      console.error("Failed to delete:", error);
      alert(`Failed to delete: ${error}`);
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleContextMenu = (e: React.MouseEvent, node: NodeApi<any>) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      node: node,
    });
  };

  return (
    <div style={{ position: 'relative' }}>
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
                className={`p-1 ${
                  selectedNode?.data.id === node.data.id ? 'bg-gray-200' : ''
                }`}
                onContextMenu={(e) => handleContextMenu(e, node)}
              >
                <div
                  style={{ paddingLeft: `${20 * node.level}px` }}
                  className="flex items-center"
                  onClick={() => handleSelect([node])}
                >
                  {/* Toggle Icon */}
                  {!node.isLeaf && (
                    <div onClick={() => node.toggle()} className="cursor-pointer">
                      {node.isOpen ? (
                        <ChevronDown className="h-4 w-4 mr-1" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-1" />
                      )}
                    </div>
                  )}
                  {/* Icon based on type */}
                  {node.isLeaf ? (
                    <FileIcon className="h-4 w-4 mr-2 ml-6" />
                  ) : (
                    <FolderIcon className="h-4 w-4 mr-2" />
                  )}
                  {/* Node Name */}
                  <span className="text-sm">{node.data.name}</span>
                </div>
              </div>
            );
          }}
          
      />

      {/* Context Menu */}
      {contextMenu.visible && (
        <ul
          style={{
            position: 'absolute',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: 'white',
            border: '1px solid gray',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            zIndex: 1000,
          }}
        >
          <li
            style={{ padding: '8px', cursor: 'pointer' }}
            onClick={handleRename}
          >
            Rename
          </li>
          <li
            style={{ padding: '8px', cursor: 'pointer' }}
            onClick={handleDelete}
          >
            Delete
          </li>
        </ul>
      )}
    </div>
  );
};
