use std::fs::{self, File};
use std::io::{Read, Write};
use tauri::command;
use crate::utils::path_utils::{get_storage_dir, validate_extension};

/// Returns the storage directory path as a string.
#[command]
pub fn get_storage_directory() -> Result<String, String> {
    let path = get_storage_dir()?;
    Ok(path.to_string_lossy().into_owned())
}

/// Creates a new file with default name `Untitled.md`.
#[command]
pub fn create_file(filename: Option<String>) -> Result<String, String> {
    let storage_dir = get_storage_dir()?;
    let filename = filename.unwrap_or_else(|| "Untitled.md".to_string());

    validate_extension(&filename)?;

    let file_path = storage_dir.join(&filename);
    if file_path.exists() {
        return Err("File already exists".into());
    }

    File::create(&file_path).map_err(|e| format!("Failed to create file: {}", e))?;
    Ok(file_path.to_string_lossy().into_owned())
}

/// Modifies a file's name.
#[command]
pub fn modify_file(old_filename: String, new_filename: String) -> Result<(), String> {
    validate_extension(&new_filename)?;
    let storage_dir = get_storage_dir()?;
    let old_path = storage_dir.join(&old_filename);
    let new_path = storage_dir.join(&new_filename);

    if !old_path.exists() {
        return Err("Original file does not exist".into());
    }

    if new_path.exists() {
        return Err("New filename already exists".into());
    }

    fs::rename(&old_path, &new_path).map_err(|e| format!("Failed to rename file: {}", e))
}

/// Deletes a specified file.
#[command]
pub fn delete_file(filename: String) -> Result<(), String> {
    let storage_dir = get_storage_dir()?;
    let file_path = storage_dir.join(&filename);

    if !file_path.exists() {
        return Err("File does not exist".into());
    }

    fs::remove_file(&file_path).map_err(|e| format!("Failed to delete file: {}", e))
}

/// Retrieves the content of a file.
#[command]
pub fn get_file_content(filename: String) -> Result<String, String> {
    let storage_dir = get_storage_dir()?;
    let file_path = storage_dir.join(&filename);

    if !file_path.exists() {
        return Err("File does not exist".into());
    }

    let mut file = File::open(&file_path).map_err(|e| format!("Failed to open file: {}", e))?;
    let mut content = String::new();
    file.read_to_string(&mut content)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    Ok(content)
}

/// Saves content to a file.
#[command]
pub fn save_file_content(filename: String, content: String) -> Result<(), String> {
    let storage_dir = get_storage_dir()?;
    let file_path = storage_dir.join(&filename);

    if !file_path.exists() {
        return Err("File does not exist".into());
    }

    let mut file = File::create(&file_path).map_err(|e| format!("Failed to create file: {}", e))?;
    file.write_all(content.as_bytes())
        .map_err(|e| format!("Failed to write to file: {}", e))?;
    Ok(())
}

/// Lists all files in the storage directory and its subdirectories.
#[command]
pub fn list_all_files() -> Result<Vec<String>, String> {
    let storage_dir = get_storage_dir()?;
    let mut files = Vec::new();

    for entry in walkdir::WalkDir::new(&storage_dir).into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            if let Some(rel_path) = entry.path().strip_prefix(&storage_dir).ok() {
                files.push(rel_path.to_string_lossy().into_owned());
            }
        }
    }

    Ok(files)
}
