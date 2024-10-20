use std::{collections::HashMap, fs};
use tauri::command;
use walkdir::WalkDir;
use crate::utils::path_utils::get_storage_dir;

#[command]
pub fn create_folder(foldername: String) -> Result<(), String> {
    let storage_dir = get_storage_dir()?;
    let folder_path = storage_dir.join(&foldername);

    if folder_path.exists() {
        return Err("Folder already exists".into());
    }

    fs::create_dir_all(&folder_path).map_err(|e| format!("Failed to create folder: {}", e));
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
    let mut folder_map: HashMap<String, Folder> = HashMap::new();

    // Root folder
    folder_map.insert(
        String::from(""),
        Folder {
            name: String::from(""),
            files: vec![],
            subfolders: vec![],
        },
    );

    // Traverse through all files and directories
    for entry in WalkDir::new(&storage_dir).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();

        // Safely strip the prefix; skip if fails
        let relative_path = match path.strip_prefix(&storage_dir) {
            Ok(p) => p.to_string_lossy().to_string(),
            Err(_) => continue,
        };

        if entry.file_type().is_dir() {
            // Determine parent folder
            let parent = match path.parent() {
                Some(p) => match p.strip_prefix(&storage_dir) {
                    Ok(p) => p.to_string_lossy().to_string(),
                    Err(_) => String::from(""),
                },
                None => String::from(""),
            };

            // If not root, add folder as a subfolder to its parent
            if !relative_path.is_empty() {
                if let Some(parent_folder) = folder_map.get_mut(&parent) {
                    // Create new Folder instance for the subfolder if it doesn't exist
                    let subfolder = Folder {
                        name: relative_path.clone(),
                        files: vec![],
                        subfolders: vec![],
                    };
                    parent_folder.subfolders.push(subfolder.clone());
                    // Insert subfolder into the map
                    folder_map.insert(relative_path.clone(), subfolder);
                } else {
                    // If parent folder isn't in the map then initialise it
                    let new_parent = Folder {
                        name: parent.clone(),
                        files: vec![],
                        subfolders: vec![],
                    };
                    folder_map.insert(parent.clone(), new_parent);
                    // Add the subfolder
                    if let Some(parent_folder) = folder_map.get_mut(&parent) {
                        let subfolder = Folder {
                            name: relative_path.clone(),
                            files: vec![],
                            subfolders: vec![],
                        };
                        parent_folder.subfolders.push(subfolder.clone());
                        folder_map.insert(relative_path.clone(), subfolder);
                    }
                }
            }

            // Ensure folder exists in the map
            folder_map.entry(relative_path.clone()).or_insert_with(|| Folder {
                name: relative_path.clone(),
                files: vec![],
                subfolders: vec![],
            });

        } else if entry.file_type().is_file() {
            // Determine parent folder
            if let Some(parent) = path.parent() {
                let parent_str = match parent.strip_prefix(&storage_dir) {
                    Ok(p) => p.to_string_lossy().to_string(),
                    Err(_) => String::from(""),
                };

                // Add file to the parent folder
                if let Some(parent_folder) = folder_map.get_mut(&parent_str) {
                    if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                        parent_folder.files.push(file_name.to_string());
                    }
                } else {
                    // If parent folder isn't in the map yet, initialise it
                    let new_parent = Folder {
                        name: parent_str.clone(),
                        files: vec![],
                        subfolders: vec![],
                    };
                    folder_map.insert(parent_str.clone(), new_parent);
                    // Add file
                    if let Some(parent_folder) = folder_map.get_mut(&parent_str) {
                        if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                            parent_folder.files.push(file_name.to_string());
                        }
                    }
                }
            }
        }
    }

    // Convert the folder_map into a Vec of Folder structs
    let root_folder = folder_map.remove("").unwrap(); // Remove root from the map
    Ok(vec![root_folder])
}