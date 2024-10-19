use std::fs;
use tauri::command;
use crate::utils::path_utils::get_storage_dir;

/// Creates a new folder.
#[command]
pub fn create_folder(folder_name: String) -> Result<(), String> {
    let storage_dir = get_storage_dir()?;
    let folder_path = storage_dir.join(&folder_name);

    if folder_path.exists() {
        return Err("Folder already exists".into());
    }

    fs::create_dir_all(&folder_path).map_err(|e| format!("Failed to create folder: {}", e))
}

/// Modifies a folder's name.
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

/// Deletes a specified folder and its contents.
#[command]
pub fn delete_folder(folder_name: String) -> Result<(), String> {
    let storage_dir = get_storage_dir()?;
    let folder_path = storage_dir.join(&folder_name);

    if !folder_path.exists() {
        return Err("Folder does not exist".into());
    }

    fs::remove_dir_all(&folder_path).map_err(|e| format!("Failed to delete folder: {}", e))
}

/// Lists all folders and their respective files.
#[command]
pub fn list_folders() -> Result<Vec<FolderInfo>, String> {
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
            folders.push(FolderInfo { name: folder_name, files });
        }
    }

    Ok(folders)
}

/// Struct to represent folder information.
#[derive(serde::Serialize)]
pub struct FolderInfo {
    name: String,
    files: Vec<String>,
}
