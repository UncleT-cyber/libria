use crate::audio::metadata::extract_metadata;
use crate::commands::library::Track;
use std::path::Path;
use walkdir::WalkDir;
use std::collections::HashSet;

const SUPPORTED_EXTENSIONS: &[&str] = &[
    "mp3", "flac", "wav", "ogg", "oga", "opus", "m4a", "aac", "wma", "aiff"
];

pub struct FileScanner;

impl FileScanner {
    pub fn new() -> Self {
        FileScanner
    }

    pub fn scan_folder(&self, folder_path: &str) -> Result<Vec<Track>, String> {
        let path = Path::new(folder_path);
        
        if !path.exists() {
            return Err("Folder does not exist".to_string());
        }

        if !path.is_dir() {
            return Err("Path is not a folder".to_string());
        }

        let mut tracks = Vec::new();
        let mut seen_files = HashSet::new();

        for entry in WalkDir::new(path)
            .follow_links(true)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            let file_path = entry.path();
            
            if file_path.is_file() {
                if let Some(extension) = file_path.extension() {
                    let ext = extension.to_string_lossy().to_lowercase();
                    
                    if SUPPORTED_EXTENSIONS.contains(&ext.as_str()) {
                        let path_str = file_path.to_string_lossy().to_string();
                        
                        // Avoid duplicates
                        if seen_files.insert(path_str.clone()) {
                            match extract_metadata(&path_str) {
                                Ok(track) => tracks.push(track),
                                Err(e) => {
                                    eprintln!("Failed to extract metadata from {}: {}", path_str, e);
                                }
                            }
                        }
                    }
                }
            }
        }

        Ok(tracks)
    }

    pub fn get_audio_files(&self, folder_path: &str) -> Result<Vec<String>, String> {
        let path = Path::new(folder_path);
        
        if !path.exists() {
            return Err("Folder does not exist".to_string());
        }

        let mut audio_files = Vec::new();

        for entry in WalkDir::new(path)
            .follow_links(true)
            .max_depth(10)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            let file_path = entry.path();
            
            if file_path.is_file() {
                if let Some(extension) = file_path.extension() {
                    let ext = extension.to_string_lossy().to_lowercase();
                    
                    if SUPPORTED_EXTENSIONS.contains(&ext.as_str()) {
                        audio_files.push(file_path.to_string_lossy().to_string());
                    }
                }
            }
        }

        Ok(audio_files)
    }
}