// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::{self, File};
use std::io::{Read, Write};
use std::process::{Command, Stdio};
use tempfile::tempdir;
use std::path::{self, PathBuf};

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![generate_pdf, save_node, load_node, list_nodes, create_folder, list_folders, load_node_from_folder])
    .plugin(tauri_plugin_dialog::init())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
    
    app_lib::run();
}


#[tauri::command]
async fn generate_pdf(content: String) -> Result<Vec<u8>, String> {

    let temp_dir = tempdir().map_err(|e| format!("Failed to create temp dir: {}", e))?;
    let temp_dir_path = temp_dir.path().to_path_buf();

    let latex_file_path = temp_dir_path.join("document.tex");
    let mut latex_file = File::create(&latex_file_path).map_err(|e| format!("Failed to create LaTeX file: {}", e))?;

    latex_file
      .write_all(content.as_bytes())
      .map_err(|e| format!("Failed to write to LaTeX file: {}", e))?;

    let output = Command::new("pdflatex")
      .arg("-output-directory")
      .arg(&temp_dir_path.to_str().unwrap_or_default())
      .arg(latex_file_path.to_str().unwrap_or_default())
      .stderr(Stdio::piped())
      .output()
      .map_err(|e| format!("Failed to execute pdflatex: {}", e))?;
  
    if !output.status.success() {
      return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let pdf_file_path = temp_dir_path.join("document.pdf");
    let pdf_bytes = fs::read(&pdf_file_path)
      .map_err(|e| format!("Failed to read PDF file: {}", e))?;

    // Save to disk to manually verify PDF
    // fs::write("output_debug.pdf", pdf_bytes.clone()).expect("Failed to write PDF file");

    Ok(pdf_bytes)
}

#[tauri::command]
fn save_node(filename: String, content: String) -> Result<(), String> {
    let path = PathBuf::from("nodes").join(filename);
    let mut file = File::create(path).map_err(|e| format!("Failed to create file: {}", e))?;
    file.write_all(content.as_bytes())
        .map_err(|e| format!("Failed to write to file: {}", e))?;
    Ok(())
}

#[tauri::command]
fn load_node(filename: String) -> Result<String, String> {
    let path = PathBuf::from("nodes").join(filename);
    let mut file = File::open(path).map_err(|e| format!("Failed to open file: {}", e))?;
    let mut content = String::new();
    file.read_to_string(&mut content)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    Ok(content)
}

#[tauri::command]
fn list_nodes() -> Result<Vec<String>, String> {
    let paths = fs::read_dir("nodes").map_err(|e| format!("Failed to read directory: {}", e))?;
    let mut nodes = Vec::new();
    for path in paths {
        let path = path.map_err(|e| format!("Failed to access path: {}", e))?;
        if let Some(file_name) = path.path().file_name() {
            if let Some(file_name_str) = file_name.to_str() {
                nodes.push(file_name_str.to_string());
            }
        }
    }
    Ok(nodes)
}

#[tauri::command]
fn list_folders() -> Result<Vec<(String, Vec<String>)>, String> {
  let paths = fs::read_dir("nodes").map_err(|e| format!("Failed to read directory: {}", e))?;
  let mut folders = Vec::new();

  for path in paths {
    let path = path.map_err(|e| format!("Failed to access path: {}", e))?;
    let folder_name = path.file_name().into_string().map_err(|e| format!("Invalid folder name: {:#?}", e))?;

    if path.path().is_dir() {
      let nodes = fs::read_dir(path.path())
            .map_err(|e| format!("Failed to read directory: {}", e))?
            .filter_map(|entry| entry.ok())
            .filter(|entry| entry.path().is_file())
            .filter_map(|entry| entry.path().file_name().map(|name| name.to_string_lossy().into_owned()))
            .collect();
      folders.push((folder_name, nodes));

    }

  }
  Ok(folders)
}

#[tauri::command]
fn create_folder(folder_name: String) -> Result<(), String> {
  let path = PathBuf::from("nodes").join(folder_name);
  fs::create_dir(&path).map_err(|e| format!("Failed to create directory: {}", e))?;
  Ok(())
}

#[tauri::command]
fn save_node_in_folder(folder: String, filename: String, content: String) -> Result<(), String> {
  let path = PathBuf::from("nodes").join(folder).join(filename);
  let mut file = File::create(path).map_err(|e| format!("Failed to create file: {}", e))?;
  file.write_all(content.as_bytes())
    .map_err(|e| format!("Failed to write to file: {}", e))?;
  Ok(())
}

#[tauri::command]
fn load_node_from_folder(folder: String, filename: String) -> Result<String, String> {
  let path = PathBuf::from("nodes").join(folder).join(filename);
  let mut file = File::open(path).map_err(|e| format!("Failed to open file: {}", e))?;
  let mut content = String::new();
  file.read_to_string(&mut content)
    .map_err(|e| format!("Failed to read file: {}", e))?;
  Ok(content)
}