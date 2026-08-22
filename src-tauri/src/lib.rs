mod commands;
mod database;
mod audio;
mod filesystem;
mod download;
mod sources;
mod utils;

use commands::*;
use database::Database;
use std::sync::Mutex;

pub struct AppState {
    pub db: Mutex<Database>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db = Database::new().expect("Failed to initialize database");
    let state = AppState {
        db: Mutex::new(db),
    };

    tauri::Builder::default()
        .manage(state)
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            app.handle().plugin(tauri_plugin_dialog::init())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            library::get_library,
            library::scan_folder,
            library::import_files,
            player::play_track,
            player::pause_playback,
            player::stop_playback,
            player::seek_playback,
            player::get_player_state,
            settings::get_settings,
            settings::update_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}