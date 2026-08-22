// SoundCloud source adapter
// TODO: Implement SoundCloud API integration

use super::adapter::{SourceAdapter, AlbumMetadata, DownloadLink};
use async_trait::async_trait;

pub struct SoundCloudAdapter;

#[async_trait]
impl SourceAdapter for SoundCloudAdapter {
    fn name(&self) -> &'static str {
        "SoundCloud"
    }

    fn can_handle_url(&self, url: &str) -> bool {
        url.contains("soundcloud.com")
    }

    async fn fetch_metadata(&self, _url: &str) -> Result<AlbumMetadata, String> {
        // TODO: Implement SoundCloud metadata fetching
        Err("Not implemented yet".to_string())
    }

    async fn fetch_download_links(&self, _metadata: &AlbumMetadata) -> Result<Vec<DownloadLink>, String> {
        // TODO: Implement SoundCloud download link fetching
        Err("Not implemented yet".to_string())
    }

    async fn download_track(&self, _link: DownloadLink, _destination: std::path::PathBuf) -> Result<(), String> {
        // TODO: Implement SoundCloud track download
        Err("Not implemented yet".to_string())
    }
}