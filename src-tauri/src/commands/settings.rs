use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Settings {
    pub music_folders: Vec<String>,
    pub theme: String,
    pub output_device: String,
    pub auto_organize: bool,
    pub format_template: String,
}

#[tauri::command]
pub async fn get_settings() -> Result<Settings, String> {
    Ok(Settings {
        music_folders: vec![],
        theme: "dark".to_string(),
        output_device: "default".to_string(),
        auto_organize: false,
        format_template: "{Artist}/{Album}/{TrackNumber} - {Title}".to_string(),
    })
}

#[tauri::command]
pub async fn update_settings(_settings: Settings) -> Result<String, String> {
    // TODO: Implement settings persistence
    Ok("Settings updated".to_string())
}