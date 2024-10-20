use std::fs::{self, File};
use std::io::{Read, Write};
use tauri::command;
use crate::utils::path_utils::{get_storage_dir, validate_extension};

use super::folder_commands::FileEntry;

#[command]
pub fn get_storage_directory() -> Result<String, String> {
    let path = get_storage_dir()?;
    Ok(path.to_string_lossy().into_owned())
}

/// Creates a new file with default name `Untitled.md`.
#[tauri::command]
pub fn create_file(filename: String) -> Result<FileEntry, String> {
    let storage_dir = get_storage_dir()?;
    let file_path = storage_dir.join(&filename);

    if file_path.exists() {
        return Err("File already exists".into());
    }

    println!("Creating file: {}", filename);

    fs::File::create(&file_path).map_err(|e| format!("Failed to create file: {}", e))?;
    println!("Created file: {}", file_path.display());

    let file_id = file_path.strip_prefix(storage_dir)
                .map_err(|e| format!("Failed to strip prefix: {}", e))?
                .to_string_lossy()
                .into_owned();

    let content = fs::read_to_string(&file_path).map_err(|e| format!("Failed to read file: {}", e))?;

    Ok(FileEntry {
        id: file_id,
        name: filename.split('/').last().unwrap_or(&filename).to_string(),
        content: content,
    })
}

// Tauri automatically converts oldFilename from frontend into old_filename in Rust backend!!

#[command]
pub fn modify_file(old_filename: String, new_filename: String) -> Result<FileEntry, String> {
    validate_extension(&new_filename)?;
    let storage_dir = get_storage_dir()?;
    let old_path = storage_dir.join(&old_filename);
    let new_path = storage_dir.join(&new_filename);

    println!("Old file: {}, new file: {}", old_filename, new_filename);

    if !old_path.exists() {
        return Err("Original file does not exist".into());
    }

    if new_path.exists() {
        return Err("New filename already exists".into());
    }

    match fs::rename(&old_path, &new_path) {
        Ok(_) => println!("Renamed file: {}", new_filename),
        Err(e) => return Err(format!("Failed to rename file: {}", e)),
    }

    let file_id = new_path.strip_prefix(storage_dir)
        .map_err(|e| format!("Failed to strip prefix: {}", e))?
        .to_string_lossy()
        .into_owned();

    let content = fs::read_to_string(&new_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    Ok(FileEntry {
        id: file_id,
        name: new_filename.split('/').last().unwrap_or(&new_filename).to_string(),
        content: content,
    })
}

#[command]
pub fn delete_file(filename: String) -> Result<(), String> {
    let storage_dir = get_storage_dir()?;
    let file_path = storage_dir.join(&filename);

    if !file_path.exists() {
        return Err("File does not exist".into());
    }

    match fs::remove_file(&file_path) {
        Ok(_) => println!("Deleted file: {}", file_path.display()),
        Err(e) => return Err(format!("Failed to delete file: {}", e)),
    }

    println!("Deleted file: {}", file_path.display());
    Ok(())
}

#[command]
pub fn get_file_content(filename: String) -> Result<String, String> {
    let storage_dir = get_storage_dir()?;
    let file_path = storage_dir.join(&filename);

    println!("Storage directory: {}", storage_dir.display());
    println!("Reading file: {}", file_path.display());

    if !file_path.exists() {
        return Err("File does not exist".into());
    }

    let mut file = File::open(&file_path).map_err(|e| format!("Failed to open file: {}", e))?;
    let mut content = String::new();
    file.read_to_string(&mut content)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    Ok(content)
}

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

#[command]
pub fn move_file(old_path: String, new_path: String) -> Result<(), String> {
    let storage_dir = get_storage_dir()?;
    let old_file_path = storage_dir.join(&old_path);
    let new_file_path = storage_dir.join(&new_path);

    if !old_file_path.exists() {
        return Err("Original file does not exist".into());
    }

    if new_file_path.exists() {
        return Err("Target file already exists".into());
    }

    fs::rename(&old_file_path, &new_file_path)
        .map_err(|e| format!("Failed to move file: {}", e))
}