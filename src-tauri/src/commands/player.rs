use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PlayerState {
    pub is_playing: bool,
    pub current_track: Option<String>,
    pub position: u32,
    pub duration: u32,
    pub volume: f32,
}

#[tauri::command]
pub async fn play_track(track_id: String) -> Result<String, String> {
    // TODO: Implement actual audio playback
    Ok(format!("Playing track: {}", track_id))
}

#[tauri::command]
pub async fn pause_playback() -> Result<String, String> {
    // TODO: Implement pause
    Ok("Playback paused".to_string())
}

#[tauri::command]
pub async fn stop_playback() -> Result<String, String> {
    // TODO: Implement stop
    Ok("Playback stopped".to_string())
}

#[tauri::command]
pub async fn seek_playback(position: u32) -> Result<String, String> {
    // TODO: Implement seek
    Ok(format!("Seeked to {} seconds", position))
}

#[tauri::command]
pub async fn get_player_state() -> Result<PlayerState, String> {
    Ok(PlayerState {
        is_playing: false,
        current_track: None,
        position: 0,
        duration: 0,
        volume: 1.0,
    })
}