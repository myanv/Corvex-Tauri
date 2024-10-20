use std::{collections::HashMap, fs};
use tauri::command;
use walkdir::WalkDir;
use crate::utils::path_utils::get_storage_dir;
use std::path::Path;

/// Recursively builds the Folder hierarchy starting from `path`.
fn build_folder(path: &Path, storage_dir: &Path) -> Result<Folder, String> {
    // Determine the folder's name. Root folder has an empty name.
    let folder_name = if path == storage_dir {
        "".to_string()
    } else {
        path.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string()
    };

    let mut files = Vec::new();
    let mut subfolders = Vec::new();

    // Iterate through directory entries
    for entry in fs::read_dir(path).map_err(|e| format!("Failed to read directory {}: {}", path.display(), e))? {
        let entry = entry.map_err(|e| format!("Failed to read entry in {}: {}", path.display(), e))?;
        let entry_path = entry.path();

        if entry_path.is_dir() {
            // Recursively build subfolders
            subfolders.push(build_folder(&entry_path, storage_dir)?);
        } else if entry_path.is_file() {
            // Collect file names
            if let Some(file_name) = entry_path.file_name().and_then(|n| n.to_str()) {
                files.push(file_name.to_string());
            }
        }
    }

    Ok(Folder {
        name: folder_name,
        files,
        subfolders,
    })
}


/// Creates a new folder at the specified relative path.
#[tauri::command]
pub fn create_folder(foldername: String) -> Result<(), String> {
    let storage_dir = get_storage_dir()?;
    let folder_path = storage_dir.join(&foldername);

    if folder_path.exists() {
        return Err("Folder already exists".into());
    }

    fs::create_dir_all(&folder_path).map_err(|e| format!("Failed to create folder: {}", e))?;
    println!("Created folder: {}", folder_path.display());
    Ok(())
}

#[command]
pub fn modify_folder(old_name: String, new_name: String) -> Result<(), String> {
    let storage_dir = get_storage_dir()?;
    let old_path = storage_dir.join(&old_name);
    let new_path = storage_dir.join(&new_name);

    if !old_path.exists() {
        return Err("Original folder does not exist".into());
    }

    if new_path.exists() {
        return Err("New folder name already exists".into());
    }

    fs::rename(&old_path, &new_path).map_err(|e| format!("Failed to rename folder: {}", e))
}

#[command]
pub fn delete_folder(folder_name: String) -> Result<(), String> {
    let storage_dir = get_storage_dir()?;
    let folder_path = storage_dir.join(&folder_name);

    if !folder_path.exists() {
        return Err("Folder does not exist".into());
    }

    fs::remove_dir_all(&folder_path).map_err(|e| format!("Failed to delete folder: {}", e))
}

#[command]
pub fn list_folders() -> Result<Vec<Folder>, String> {
    let storage_dir = get_storage_dir()?;
    let mut folders = Vec::new();

    for entry in fs::read_dir(&storage_dir).map_err(|e| format!("Failed to read storage directory: {}", e))? {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let path = entry.path();
        if path.is_dir() {
            let folder_name = entry.file_name().into_string().map_err(|e| format!("Invalid folder name: {:?}", e))?;
            let mut files = Vec::new();
            for file_entry in fs::read_dir(&path).map_err(|e| format!("Failed to read folder: {}", e))? {
                let file_entry = file_entry.map_err(|e| format!("Failed to read file entry: {}", e))?;
                let file_path = file_entry.path();
                if file_path.is_file() {
                    if let Some(file_name) = file_path.file_name().and_then(|n| n.to_str()) {
                        files.push(file_name.to_string());
                    }
                }
            }
            folders.push(Folder { name: folder_name, files, subfolders: vec![] });
        }
    }

    Ok(folders)
}

/// Struct to represent folder information.
#[derive(Clone, serde::Serialize)]
pub struct Folder {
    pub name: String,
    pub files: Vec<String>,
    pub subfolders: Vec<Folder>,
}


/// Lists all files in the storage directory and its subdirectories.
// Define Folder structure
#[tauri::command]
pub fn list_all_files() -> Result<Vec<Folder>, String> {
    let storage_dir = get_storage_dir()?;
    let root_folder = build_folder(&storage_dir, &storage_dir)?;
    Ok(vec![root_folder])
}