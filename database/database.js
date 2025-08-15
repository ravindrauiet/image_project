const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table to store GitHub user information
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          github_id INTEGER UNIQUE NOT NULL,
          username TEXT NOT NULL,
          email TEXT,
          avatar_url TEXT,
          access_token TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Repositories table to store user repositories
      db.run(`
        CREATE TABLE IF NOT EXISTS repositories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          github_repo_id INTEGER UNIQUE NOT NULL,
          name TEXT NOT NULL,
          full_name TEXT NOT NULL,
          description TEXT,
          private BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

              // Images table to store image metadata
        db.run(`
          CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            repository_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            mime_type TEXT NOT NULL,
            width INTEGER,
            height INTEGER,
            github_url TEXT,
            cdn_url TEXT,
            sha TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (repository_id) REFERENCES repositories (id)
          )
        `);
      
      // Add SHA and CDN URL columns if they don't exist (for existing databases)
      db.all(`PRAGMA table_info(images)`, (err, columns) => {
        if (err) {
          console.error('Error checking table schema:', err);
          return;
        }
        
        if (columns && Array.isArray(columns)) {
          const hasShaColumn = columns.some(col => col.name === 'sha');
          const hasCdnUrlColumn = columns.some(col => col.name === 'cdn_url');
          
          if (!hasShaColumn) {
            db.run(`ALTER TABLE images ADD COLUMN sha TEXT`, (err) => {
              if (err) {
                console.error('Error adding SHA column:', err);
              } else {
                console.log('SHA column added successfully');
              }
            });
          }
          
          if (!hasCdnUrlColumn) {
            db.run(`ALTER TABLE images ADD COLUMN cdn_url TEXT`, (err) => {
              if (err) {
                console.error('Error adding CDN URL column:', err);
              } else {
                console.log('CDN URL column added successfully');
              }
            });
          }
        } else {
          console.log('No columns found or invalid response');
        }
      });

      // Create indexes for better performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_repos_user_id ON repositories(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_images_repo_id ON images(repository_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_images_filename ON images(filename)`);

      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  db,
  initDatabase,
  closeDatabase
};

