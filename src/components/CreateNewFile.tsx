'use client'

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { FileText, GitBranch, Plus } from "lucide-react";

export const CreateNewFile: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    const onClose = () => setIsOpen(false);

    const onCreateLatex = () => {
        setIsOpen(false);
    }

    const onCreateChildNode = () => {
        setIsOpen(false);
    }

    return (
        <>
            <Button onClick={() => setIsOpen(true)} variant="ghost" className="w-full justify-start mb-4">
                <Plus className="mr-2 h-4 w-4" /> New
            </Button>

            <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Create New Page</DialogTitle>
                <DialogDescription>
                    Choose the type of page you want to create.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                <Button onClick={onCreateLatex} className="justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    LaTeX Document
                </Button>
                <Button onClick={onCreateChildNode} className="justify-start" variant="outline">
                    <GitBranch className="mr-2 h-4 w-4" />
                    Child Node
                </Button>
                </div>
            </DialogContent>
            </Dialog>
        </>
      )
}