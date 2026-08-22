use crate::AppState;
use tauri::State;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Track {
    pub id: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub duration: u32,
    pub file_path: String,
    pub format: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LibraryStats {
    pub total_tracks: usize,
    pub total_albums: usize,
    pub total_artists: usize,
}

#[tauri::command]
pub async fn get_library(state: State<'_, AppState>) -> Result<Vec<Track>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let tracks = db.get_all_tracks().map_err(|e| e.to_string())?;
    Ok(tracks)
}

#[tauri::command]
pub async fn get_library_stats(state: State<'_, AppState>) -> Result<LibraryStats, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let stats = db.get_library_stats().map_err(|e| e.to_string())?;
    Ok(stats)
}

#[tauri::command]
pub async fn scan_folder(folder_path: String, state: State<'_, AppState>) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let scanner = crate::filesystem::scanner::FileScanner::new();
    let tracks = scanner.scan_folder(&folder_path).map_err(|e| e.to_string())?;
    let track_count = tracks.len();
    
    for track in tracks {
        db.add_track(&track).map_err(|e| e.to_string())?;
    }
    
    Ok(format!("Scanned {} tracks from {}", track_count, folder_path))
}

#[tauri::command]
pub async fn import_files(file_paths: Vec<String>, state: State<'_, AppState>) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let mut imported = 0;
    
    for file_path in file_paths {
        let metadata = crate::audio::metadata::extract_metadata(&file_path).map_err(|e| e.to_string())?;
        db.add_track(&metadata).map_err(|e| e.to_string())?;
        imported += 1;
    }
    
    Ok(format!("Imported {} tracks", imported))
}