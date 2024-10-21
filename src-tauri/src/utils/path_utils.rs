use std::path::{Path, PathBuf};
use dirs::home_dir;
use std::fs;


/// Returns the path to the storage directory (`corvex/data/`).
pub fn get_storage_dir() -> Result<PathBuf, String> {
    if let Some(home) = home_dir() {
        let storage_path = home.join("corvex").join("data");
        fs::create_dir_all(&storage_path).map_err(|e| format!("Failed to create storage directory: {}", e))?;
        Ok(storage_path)
    } else {
        Err(String::from("Unable to determine home directory"))
    }
}

/// Validates the file extension.
pub fn validate_extension(filename: &str) -> Result<(), String> {
    let allowed_extensions = ["md", "tex"];
    let path = Path::new(filename);
    if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
        if allowed_extensions.contains(&ext) {
            Ok(())
        } else {
            Err(format!("Unsupported file extension: .{}", ext))
        }
    } else {
        Err(String::from("File must have an extension"))
    }
}
