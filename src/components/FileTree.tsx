import { Tree, NodeApi, RowRendererProps } from "react-arborist";
import { Folder } from "./MainFrame";
import React, { useState, useEffect, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  ChevronDown,
  ChevronRight,
  Folder as FolderIcon,
  File as FileIcon,
  Edit,
} from 'lucide-react';
import { Cross2Icon } from "@radix-ui/react-icons";
import ContextMenu from "./ContexMenu";

interface FileTreeProps {
  folders: Folder[];
  onFileClick: (folderPath: string) => void;
  onFolderSelect: (folderPath: string | null) => void;
  refreshFolders: () => void;
}

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

const getParentPath = (path: string): string => {
  const parentPathMatch = path.match(/^.*[\\/]/);
  return parentPathMatch ? parentPathMatch[0] : '';
};

export const FileTree: React.FC<FileTreeProps> = ({
  folders,
  onFileClick,
  onFolderSelect,
  refreshFolders
}) => {
  const [selectedNode, setSelectedNode] = useState<NodeApi<any> | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>('');

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: NodeApi<any> | null;
  } | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const data = useMemo(() => folders.map(mapFolderToTree), [folders])

  const handleSelect = (nodes: NodeApi<any>[]) => {
    const node = nodes[0];
    if (!node) return;

    setSelectedNode(node)

    if (node.data.leaf) onFileClick(node.data.id) 
    else onFolderSelect(node.data.id || "")
  };


  const handleRename = async (node: NodeApi<any>) => {
    const newName = prompt("Enter the new name:");
    if (!newName) return;

    const parentPath = getParentPath(node.data.id);
    const newNamePath = `${parentPath}${newName}`;

    try {
      const command = node.data.leaf ? 'modify_file' : 'modify_folder';
      const params = node.data.leaf
        ? { oldFilename: node.data.id, newFilename: newNamePath }
        : { oldName: node.data.id, newName: newNamePath };

      await invoke(command, params);
      refreshFolders();
    } catch (error) {
      console.error("Failed to rename:", error);
      alert(`Failed to rename: ${error}`);
    }
  };

  const handleDelete = async (node: NodeApi<any>) => {
    const confirmDelete = confirm("Are you sure you want to delete this?");
    if (!confirmDelete) return;

    try {
      const command = node.data.leaf ? 'delete_file' : 'delete_folder';
      const params = node.data.leaf
        ? { filename: node.data.id }
        : { folderName: node.data.id };

      await invoke(command, params);
      refreshFolders();
    } catch (error) {
      console.error("Failed to delete:", error);
      alert(`Failed to delete: ${error}`);
    }
  };


  return (
    <div style={{ position: 'relative' }}>
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
              className={`p-1 hover:bg-gray-200 ${
                node.isSelected ? 'bg-slate-300' : ''
              }`}
              onClick={() => handleSelect([node])}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  node: node,
                });
              }}
            >
              <div
                style={{ paddingLeft: `${20 * node.level}px` }}
                className="flex max-w-[220px] justify-between"
              >
                <div className="flex items-center flex-grow">
                  {!node.isLeaf && (
                    <div onClick={() => node.toggle()} className="cursor-pointer">
                      {node.isOpen ? (
                        <ChevronDown className="h-4 w-4 mr-1" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-1" />
                      )}
                    </div>
                  )}

                  {node.isLeaf ? (
                    <FileIcon className="h-4 w-4 mr-2 ml-3" />
                  ) : (
                    <FolderIcon className="h-4 w-4 mr-2" />
                  )}

                  <span className="text-sm">
                    {node.isEditing ? (
                      <input
                        type="text"
                        defaultValue={node.data.name}
                        onFocus={(e) => e.currentTarget.select()}
                        onBlur={() => node.reset()}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") node.reset();
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            node.submit(e.currentTarget.value);
                            handleRename(node);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span>{node.data.name}</span>
                    )}
                  </span>
                </div>
                {hoveredNode === node.id && (
                  <div className="flex items-center ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        node.edit();
                      }}
                      title="Rename..."
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(node);
                      }}
                      title="Delete..."
                    >
                      <Cross2Icon className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        }}
      />

      {contextMenu && (
        <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onRename={() => {
                handleRename(contextMenu.node!);
                setContextMenu(null)
            }}
            onDelete={() => {
                handleDelete(contextMenu.node!);
                setContextMenu(null)
            }}
        />
      )}
    </div>
  );
};
