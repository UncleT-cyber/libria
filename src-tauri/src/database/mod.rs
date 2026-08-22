use rusqlite::{Connection, params};
use std::path::PathBuf;
use std::fs;
use crate::commands::library::Track;
use crate::commands::library::LibraryStats;
use crate::utils::error::LibriaError;

pub type Result<T> = std::result::Result<T, LibriaError>;

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new() -> Result<Self> {
        let libria_dir = Self::get_libria_dir()?;
        fs::create_dir_all(&libria_dir)?;
        
        let db_path = libria_dir.join("libria.db");
        let conn = Connection::open(&db_path).map_err(|e| LibriaError::Database(e.to_string()))?;
        
        let db = Database { conn };
        db.initialize_schema()?;
        Ok(db)
    }

    fn get_libria_dir() -> Result<PathBuf> {
        let home = dirs::home_dir().ok_or_else(|| LibriaError::Config("Failed to get home directory".to_string()))?;
        Ok(home.join(".libria"))
    }

    fn initialize_schema(&self) -> Result<()> {
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS artists (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                sort_name TEXT,
                metadata_json TEXT
            )",
            [],
        ).map_err(|e| LibriaError::Database(e.to_string()))?;

        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS albums (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                artist_id TEXT,
                year INTEGER,
                genre TEXT,
                artwork_path TEXT,
                metadata_json TEXT,
                FOREIGN KEY(artist_id) REFERENCES artists(id)
            )",
            [],
        ).map_err(|e| LibriaError::Database(e.to_string()))?;

        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS tracks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                album TEXT,
                artist TEXT,
                album_id TEXT,
                artist_id TEXT,
                track_number INTEGER,
                duration INTEGER,
                file_path TEXT NOT NULL,
                format TEXT,
                bitrate INTEGER,
                metadata_json TEXT,
                FOREIGN KEY(album_id) REFERENCES albums(id),
                FOREIGN KEY(artist_id) REFERENCES artists(id)
            )",
            [],
        ).map_err(|e| LibriaError::Database(e.to_string()))?;

        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS playlists (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                is_smart INTEGER DEFAULT 0,
                rules_json TEXT,
                created_at TEXT
            )",
            [],
        ).map_err(|e| LibriaError::Database(e.to_string()))?;

        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS playlist_tracks (
                playlist_id TEXT,
                track_id TEXT,
                position INTEGER,
                added_at TEXT,
                PRIMARY KEY(playlist_id, track_id),
                FOREIGN KEY(playlist_id) REFERENCES playlists(id),
                FOREIGN KEY(track_id) REFERENCES tracks(id)
            )",
            [],
        ).map_err(|e| LibriaError::Database(e.to_string()))?;

        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS folders (
                id TEXT PRIMARY KEY,
                path TEXT NOT NULL,
                last_scanned TEXT,
                watch_enabled INTEGER DEFAULT 0
            )",
            [],
        ).map_err(|e| LibriaError::Database(e.to_string()))?;

        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS play_history (
                id TEXT PRIMARY KEY,
                track_id TEXT,
                played_at TEXT,
                duration_played INTEGER,
                completion_percentage REAL,
                FOREIGN KEY(track_id) REFERENCES tracks(id)
            )",
            [],
        ).map_err(|e| LibriaError::Database(e.to_string()))?;

        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT,
                type TEXT
            )",
            [],
        ).map_err(|e| LibriaError::Database(e.to_string()))?;

        Ok(())
    }

    pub fn add_track(&self, track: &Track) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO tracks (id, title, album_id, artist_id, duration, file_path, format)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                track.id,
                track.title,
                track.album,
                track.artist,
                track.duration,
                track.file_path,
                track.format
            ],
        ).map_err(|e| LibriaError::Database(e.to_string()))?;
        Ok(())
    }

    pub fn get_all_tracks(&self) -> Result<Vec<Track>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, artist, album, duration, file_path, format 
             FROM tracks"
        ).map_err(|e| LibriaError::Database(e.to_string()))?;

        let tracks = stmt.query_map([], |row| {
            Ok(Track {
                id: row.get(0)?,
                title: row.get(1)?,
                artist: row.get(2)?,
                album: row.get(3)?,
                duration: row.get(4)?,
                file_path: row.get(5)?,
                format: row.get(6)?,
            })
        }).map_err(|e| LibriaError::Database(e.to_string()))?;

        tracks.collect::<std::result::Result<Vec<Track>, rusqlite::Error>>()
            .map_err(|e| LibriaError::Database(e.to_string()))
    }

    pub fn get_library_stats(&self) -> Result<LibraryStats> {
        let total_tracks: usize = self.conn.query_row(
            "SELECT COUNT(*) FROM tracks",
            [],
            |row| row.get(0),
        ).map_err(|e| LibriaError::Database(e.to_string()))?;

        let total_albums: usize = self.conn.query_row(
            "SELECT COUNT(DISTINCT album) FROM tracks",
            [],
            |row| row.get(0),
        ).map_err(|e| LibriaError::Database(e.to_string()))?;

        let total_artists: usize = self.conn.query_row(
            "SELECT COUNT(DISTINCT artist) FROM tracks",
            [],
            |row| row.get(0),
        ).map_err(|e| LibriaError::Database(e.to_string()))?;

        Ok(LibraryStats {
            total_tracks,
            total_albums,
            total_artists,
        })
    }
}