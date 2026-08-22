use lofty::file::{AudioFile, TaggedFileExt};
use lofty::tag::Accessor;
use std::path::Path;
use crate::commands::library::Track;
use uuid::Uuid;

pub fn extract_metadata(file_path: &str) -> Result<Track, String> {
    let path = Path::new(file_path);
    
    if !path.exists() {
        return Err("File does not exist".to_string());
    }

    let tagged_file = lofty::read_from_path(path)
        .map_err(|e| format!("Failed to read audio file: {}", e))?;

    let tag = tagged_file.tags()
        .first()
        .ok_or("No tags found")?;

    let title = tag.title()
        .unwrap_or_else(|| {
            let stem = path.file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("Unknown");
            std::borrow::Cow::Borrowed(stem)
        })
        .to_string();

    let artist = tag.artist()
        .unwrap_or(std::borrow::Cow::Borrowed("Unknown Artist"))
        .to_string();

    let album = tag.album()
        .unwrap_or(std::borrow::Cow::Borrowed("Unknown Album"))
        .to_string();

    let duration = tagged_file.properties().duration().as_secs() as u32;
    let format = path.extension()
        .and_then(|s| s.to_str())
        .unwrap_or("unknown")
        .to_string();

    Ok(Track {
        id: Uuid::new_v4().to_string(),
        title,
        artist,
        album,
        duration,
        file_path: file_path.to_string(),
        format,
    })
}