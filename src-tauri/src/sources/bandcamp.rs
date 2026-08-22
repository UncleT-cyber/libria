// Bandcamp source adapter
// TODO: Implement Bandcamp API integration

use super::adapter::{SourceAdapter, AlbumMetadata, DownloadLink};
use async_trait::async_trait;

pub struct BandcampAdapter;

#[async_trait]
impl SourceAdapter for BandcampAdapter {
    fn name(&self) -> &'static str {
        "Bandcamp"
    }

    fn can_handle_url(&self, url: &str) -> bool {
        url.contains("bandcamp.com")
    }

    async fn fetch_metadata(&self, _url: &str) -> Result<AlbumMetadata, String> {
        // TODO: Implement Bandcamp metadata fetching
        Err("Not implemented yet".to_string())
    }

    async fn fetch_download_links(&self, _metadata: &AlbumMetadata) -> Result<Vec<DownloadLink>, String> {
        // TODO: Implement Bandcamp download link fetching
        Err("Not implemented yet".to_string())
    }

    async fn download_track(&self, _link: DownloadLink, _destination: std::path::PathBuf) -> Result<(), String> {
        // TODO: Implement Bandcamp track download
        Err("Not implemented yet".to_string())
    }
}