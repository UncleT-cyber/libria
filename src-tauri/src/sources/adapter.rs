// Source adapter trait for different music platforms
// TODO: Implement source adapter system

use async_trait::async_trait;

#[derive(Debug, Clone)]
pub enum AudioFormat {
    Mp3,
    Flac,
    Wav,
    Ogg,
    M4a,
}

#[derive(Debug, Clone)]
pub enum AudioQuality {
    Standard,
    High,
    Lossless,
}

#[derive(Debug, Clone)]
pub struct DownloadLink {
    pub url: String,
    pub format: AudioFormat,
    pub quality: AudioQuality,
}

#[derive(Debug, Clone)]
pub struct TrackMetadata {
    pub title: String,
    pub artist: String,
    pub album: String,
    pub track_number: Option<u32>,
    pub duration: Option<u32>,
}

#[derive(Debug, Clone)]
pub struct AlbumMetadata {
    pub title: String,
    pub artist: String,
    pub tracks: Vec<TrackMetadata>,
    pub artwork_url: Option<String>,
    pub release_date: Option<String>,
}

#[async_trait]
pub trait SourceAdapter: Send + Sync {
    fn name(&self) -> &'static str;
    fn can_handle_url(&self, url: &str) -> bool;
    
    async fn fetch_metadata(&self, url: &str) -> Result<AlbumMetadata, String>;
    async fn fetch_download_links(&self, metadata: &AlbumMetadata) -> Result<Vec<DownloadLink>, String>;
    async fn download_track(&self, link: DownloadLink, destination: std::path::PathBuf) -> Result<(), String>;
}