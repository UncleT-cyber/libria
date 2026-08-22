// Custom error types for Libria
use thiserror::Error;

#[derive(Error, Debug)]
pub enum LibriaError {
    #[error("Database error: {0}")]
    Database(String),
    
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Audio error: {0}")]
    Audio(String),
    
    #[error("Metadata error: {0}")]
    Metadata(String),
    
    #[error("Download error: {0}")]
    Download(String),
    
    #[error("Configuration error: {0}")]
    Config(String),
}

pub type Result<T> = std::result::Result<T, LibriaError>;