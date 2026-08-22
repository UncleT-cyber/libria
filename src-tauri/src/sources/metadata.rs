// Metadata-only integrations with streaming services
// TODO: Implement metadata fetching from Spotify, Apple Music, etc.

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct StreamingMetadata {
    pub title: String,
    pub artist: String,
    pub album: String,
    pub service: String,
    pub external_url: String,
}

pub struct MetadataFetcher;

impl MetadataFetcher {
    pub fn new() -> Self {
        MetadataFetcher
    }

    pub async fn search_spotify(&self, _query: &str) -> Result<Vec<StreamingMetadata>, String> {
        // TODO: Implement Spotify search
        Err("Not implemented yet".to_string())
    }

    pub async fn search_apple_music(&self, _query: &str) -> Result<Vec<StreamingMetadata>, String> {
        // TODO: Implement Apple Music search
        Err("Not implemented yet".to_string())
    }

    pub async fn search_youtube(&self, _query: &str) -> Result<Vec<StreamingMetadata>, String> {
        // TODO: Implement YouTube search
        Err("Not implemented yet".to_string())
    }
}