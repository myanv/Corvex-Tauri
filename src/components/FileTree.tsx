// src/components/FileTree.tsx

import { Tree, NodeApi, RowRendererProps, RenameHandler, DeleteHandler, CreateHandler, MoveHandler } from "react-arborist";
import { Folder } from "./MainFrame";
import React, { useState, useEffect, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  ChevronDown,
  ChevronRight,
  Folder as FolderIcon,
  File as FileIcon,
  Edit,
  FilePlus,
} from 'lucide-react';
import { Cross2Icon } from "@radix-ui/react-icons";
import ContextMenu from "./ContexMenu";
import { Button } from "./ui/button";

interface FileTreeProps {
  folders: Folder[];
  onFileClick: (folderPath: string) => void;
  onFolderSelect: (folderPath: string | null) => void;
  refreshFolders: () => void;
}

const mapFolderToTree = (folder: Folder): any => ({
  id: folder.id,
  name: folder.name === "" ? "corvex/data" : folder.name,
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
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: NodeApi<any> | null;
  } | null>(null);
  const [treeData, setTreeData] = useState(folders.map(mapFolderToTree));

  useEffect(() => {
    setTreeData(folders.map(mapFolderToTree));
  }, [folders])

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSelect = (nodes: NodeApi<any>[]) => {
    const node = nodes[0];
    if (!node) return;

    if (node.data.leaf) {
      onFileClick(node.data.id);
    } else {
      onFolderSelect(node.data.id || "");
    }
  };

  const handleRename = async (node: NodeApi<any>, newName: string) => {
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
    try {
      const command = node.data.leaf ? 'delete_file' : 'delete_folder';
      if (node.data.id === "root") alert("Root folder cannot be deleted.");
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

  const onRenameHandler: RenameHandler<any> = async ({ node, name }) => {
    if (!name) return;

    const isNewNode = node.id.startsWith("temp-");

    if (isNewNode) {
      const parentPath = node.parent && node.parent.id !== "root" ? node.parent.data.id : "";
      const newPath = parentPath ? `${parentPath}/${name}` : name;

      try {
        const command = node.data.leaf ? 'create_file' : 'create_folder';
        const params = node.data.leaf
          ? { filename: newPath }
          : { foldername: newPath };

        await invoke(command, params);
        refreshFolders();
      } catch (error) {
        console.error("Failed to create:", error);
        alert(`Failed to create: ${error}`);
      }
    } else {
      await handleRename(node, name);
    }
  };

  const onDeleteHandler: DeleteHandler<any> = async ({ nodes }) => {
    for (const node of nodes) {
      await handleDelete(node);
    }
  };

  const onCreateHandler: CreateHandler<any> = async ({ parentId, parentNode, index, type }) => {
    const tempId = "temp-" + Date.now();
    const newNode = { id: tempId, name: "", leaf: type === "leaf" }

    setTreeData(prevData => {
      const updateChildren = (node: any): any => {
        if (node.id === parentId) {
          const existingChildren = node.children || [];
          return {
            ...node,
            children: [
              ...existingChildren.slice(0, index),
              newNode,
              ...existingChildren.slice(index)
            ]
          }
        }

        if (node.children) {
          return {
            ...node,
            children: node.children.map(updateChildren)
          }
        }
        return node
      }
      return prevData.map(updateChildren)
    })
    return { id: tempId, name: "", leaf: type === "leaf" };
  };

  const onMoveHandler: MoveHandler<any> = async ({ dragNodes, parentNode }) => {
    try {
      await Promise.all(dragNodes.map(async (node) => {
        const oldPath = node.data.id;
        const newParentPath = parentNode && parentNode.id !== "root" ? parentNode.data.id : "";
        const newPath = newParentPath ? `${newParentPath}/${node.data.name}` : node.data.name;

        const command = node.data.leaf ? 'move_file' : 'move_folder';
        const params = { oldPath, newPath };

        await invoke(command, params);
      }));

      refreshFolders();
    } catch (error) {
      console.error("Failed to move:", error);
      alert(`Failed to move: ${error}`);
    }
  };

  const MAX_INDENT_LEVEL = 3

  return (
    <div>
      <Tree
        data={treeData}
        onSelect={handleSelect}
        onRename={onRenameHandler}
        onDelete={onDeleteHandler}
        onCreate={onCreateHandler}
        onMove={onMoveHandler}
        width={300}
        height={600}
        rowHeight={30}
        indent={20}
        selection="single"
        selectionFollowsFocus={true}
        renderRow={(rowProps: RowRendererProps<any>) => {
          const { node, innerRef, attrs } = rowProps;
          
          const currentIndentLevel = Math.min(node.level, MAX_INDENT_LEVEL)
          return (
            <div
              ref={innerRef}
              {...attrs}
              className={`p-1 cursor-pointer hover:bg-gray-200 ${
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
                style={{ paddingLeft: `${20 * currentIndentLevel}px` }}
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
                          if (e.key === "Escape") {
                            node.reset();
                          }
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            node.submit(e.currentTarget.value);
                          }
                        }}
                        autoFocus
                        className="border border-gray-300 rounded px-1"
                      />
                    ) : (
                      <span
                        className="text-sm truncate max-w-[150px]"
                        title={node.data.name}
                      >
                          {node.data.name}
                      </span>
                    )}
                  </span>
                </div>

                {hoveredNode === node.id && node.data.id !== "root" && (
                  <div className="flex items-center ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        node.edit();
                      }}
                      title="Rename..."
                      className="p-1 hover:bg-gray-300 rounded"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(node);
                      }}
                      title="Delete..."
                      className="p-1 hover:bg-gray-300 rounded"
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

      {contextMenu && contextMenu.node && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onRename={() => {
            if (contextMenu.node?.data.id !== "root") contextMenu.node?.edit();
            setContextMenu(null);
          }}
          onDelete={() => {
            if (contextMenu.node?.data.id !== "root")handleDelete(contextMenu.node!);
            setContextMenu(null);
          }}
          onNewFile={() => {
            contextMenu.node?.tree.create({
              parentId: contextMenu.node.id, 
              type: "leaf"
            });
            setContextMenu(null);
          }}
          onNewFolder={() => {
            contextMenu.node?.tree.create({
              parentId: contextMenu.node.id, 
              type: "internal"
            });
            setContextMenu(null);
          }}
        />
      )}
    </div>
  );
};
