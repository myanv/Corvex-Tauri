// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod utils;

use std::fs::File;
use std::io::Write;
use std::process::{Command, Stdio};
use tempfile::tempdir;
use std::fs;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            generate_pdf,

            // File Commands
            commands::file_commands::get_storage_directory,
            commands::file_commands::create_file,
            commands::file_commands::modify_file,
            commands::file_commands::delete_file,
            commands::file_commands::get_file_content,
            commands::file_commands::save_file_content,
            commands::file_commands::move_file,
          
            //, Folder Commands
            commands::folder_commands::create_folder,
            commands::folder_commands::modify_folder,
            commands::folder_commands::delete_folder,
            commands::folder_commands::list_all_files,
            commands::folder_commands::move_folder

        ])
        .plugin(tauri_plugin_dialog::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
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

