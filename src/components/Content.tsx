'use client'

import React from "react";
import { TopNav } from "./TopNav";
import { Note } from "./Note";
import { invoke } from "@tauri-apps/api/core";

interface ContentProps {
    toggleSidebar: () => void;
    selectedNode: string | null;
    setSelectedNode: (note: string | null) => void;
    nodeContent: string;
    setNodeContent: (content: string) => void;

}
export const Content: React.FC<ContentProps> = ({
    toggleSidebar, 
    selectedNode, 
    setSelectedNode,
    nodeContent
}) => {

    const saveNode = () => {
        if (selectedNode) {
            const [folder, filename] = selectedNode?.split("/");
            invoke('save_node_in_folder', { folder, filename: selectedNode, content: nodeContent })
                .then(() => {
                    setSelectedNode(null)
                    console.log('Node saved successfully')
                })
                .catch((error) => console.error('Failed to save node:', error))
        }
    }

    return (
        <main className="flex-1 flex flex-col overflow-hidden">
            <TopNav selectedNode={selectedNode} setSelectedNode={setSelectedNode} toggleSidebar={toggleSidebar} />

            <Note selectedNode={selectedNode} />
        </main>
    )
}