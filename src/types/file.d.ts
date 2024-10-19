export interface FileInfo {
    name: string;
    path: string;
    is_dir: boolean;
  }
  
export interface Folder {
    name: string;
    path: string;
    nodes: FileInfo[];
  }