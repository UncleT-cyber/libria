// Path utilities for handling file paths and templates
use std::path::Path;

pub struct PathUtils;

impl PathUtils {
    pub fn new() -> Self {
        PathUtils
    }

    pub fn sanitize_filename(&self, filename: &str) -> String {
        // Remove invalid characters for filenames
        filename
            .chars()
            .map(|c| match c {
                '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*' => '_',
                _ => c,
            })
            .collect()
    }

    pub fn apply_template(&self, template: &str, variables: &std::collections::HashMap<String, String>) -> String {
        let mut result = template.to_string();
        
        for (key, value) in variables {
            let placeholder = format!("{{{}}}", key);
            result = result.replace(&placeholder, value);
        }
        
        result
    }

    pub fn get_file_size(&self, path: &Path) -> Result<u64, std::io::Error> {
        Ok(std::fs::metadata(path)?.len())
    }
}