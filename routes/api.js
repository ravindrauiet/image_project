const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { Octokit } = require('octokit');
const { db } = require('../database/database');
const path = require('path');
const fs = require('fs').promises;
const watermarkProcessor = require('../utils/watermark');

const router = express.Router();

// Middleware to check authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get user's repositories
router.get('/repositories', ensureAuthenticated, async (req, res) => {
  try {
    const { db } = require('../database/database');
    
    db.all(
      'SELECT * FROM repositories WHERE user_id = (SELECT id FROM users WHERE github_id = ?) ORDER BY created_at DESC',
      [req.user.id],
      (err, repositories) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch repositories' });
        }
        res.json(repositories);
      }
    );
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single repository by ID
router.get('/repositories/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the user's database ID from their GitHub ID
    db.get(
      'SELECT id FROM users WHERE github_id = ?',
      [req.user.id],
      (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch user' });
        }
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        // Now get the repository using the user's database ID
        db.get(
          'SELECT r.*, u.username FROM repositories r JOIN users u ON r.user_id = u.id WHERE r.id = ? AND r.user_id = ?',
          [id, user.id],
          (err, repository) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Failed to fetch repository' });
            }
            
            if (!repository) {
              return res.status(404).json({ error: 'Repository not found or access denied' });
            }
            
            res.json(repository);
          }
        );
      }
    );
  } catch (error) {
    console.error('Error fetching repository:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new repository
router.post('/repositories', ensureAuthenticated, async (req, res) => {
  try {
    const { name, description, private: isPrivate } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Repository name is required' });
    }

    // Get user's access token
    db.get('SELECT access_token FROM users WHERE github_id = ?', [req.user.id], async (err, user) => {
      if (err || !user) {
        return res.status(500).json({ error: 'User not found' });
      }

      const octokit = new Octokit({ auth: user.access_token });

      try {
        // Create repository on GitHub
        const response = await octokit.rest.repos.createForAuthenticatedUser({
          name,
          description,
          private: isPrivate || false,
          auto_init: true
        });

        const repo = response.data;

        // Store repository in database
        db.run(
          'INSERT INTO repositories (user_id, github_repo_id, name, full_name, description, private) VALUES ((SELECT id FROM users WHERE github_id = ?), ?, ?, ?, ?, ?)',
          [req.user.id, repo.id, repo.name, repo.full_name, description || '', isPrivate || false],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Failed to save repository' });
            }

            res.status(201).json({
              id: this.lastID,
              github_repo_id: repo.id,
              name: repo.name,
              full_name: repo.full_name,
              description: repo.description,
              private: repo.private,
              html_url: repo.html_url
            });
          }
        );
      } catch (githubError) {
        console.error('GitHub API error:', githubError);
        res.status(400).json({ 
          error: 'Failed to create repository on GitHub',
          details: githubError.message 
        });
      }
    });
  } catch (error) {
    console.error('Error creating repository:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload image to repository
router.post('/repositories/:repoId/images', ensureAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { repoId } = req.params;
    const { filename, originalname, mimetype, buffer } = req.file;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // First get the user's database ID from their GitHub ID
    db.get(
      'SELECT id FROM users WHERE github_id = ?',
      [req.user.id],
      (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch user' });
        }
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Verify repository belongs to user
        db.get(
          'SELECT r.*, u.access_token FROM repositories r JOIN users u ON r.user_id = u.id WHERE r.id = ? AND r.user_id = ?',
          [repoId, user.id],
          async (err, repo) => {
            if (err || !repo) {
              return res.status(404).json({ error: 'Repository not found or access denied' });
            }

            try {
              // Check if watermark should be applied
              const watermarkOptions = watermarkProcessor.parseWatermarkOptions(req.body);
              const hasWatermark = watermarkOptions.text && watermarkOptions.text.trim() !== '';
              
              console.log('Watermark options received:', req.body);
              console.log('Parsed watermark options:', watermarkOptions);
              console.log('Has watermark:', hasWatermark);
              
              let finalBuffer = buffer;
              let finalMetadata = await sharp(buffer).metadata();
              
              // Apply watermark if specified
              if (hasWatermark) {
                try {
                  console.log('Attempting to apply watermark...');
                  finalBuffer = await watermarkProcessor.addWatermark(buffer, watermarkOptions);
                  finalMetadata = await sharp(finalBuffer).metadata();
                  console.log('Watermark applied successfully');
                } catch (watermarkError) {
                  console.error('Watermark processing error:', watermarkError);
                  console.log('Continuing without watermark...');
                  // Continue without watermark if it fails
                  finalBuffer = buffer;
                  finalMetadata = await sharp(buffer).metadata();
                }
              }
              
              // Process image with Sharp
              const image = sharp(finalBuffer);
              const metadata = finalMetadata;
              
              // Generate unique filename
              const timestamp = Date.now();
              const fileExtension = path.extname(originalname);
              const uniqueFilename = `${timestamp}_${Math.random().toString(36).substring(2)}${fileExtension}`;
              
              // Optimize image (resize if too large, convert to WebP for better compression)
              let optimizedBuffer;
              if (metadata.width > 1920 || metadata.height > 1080) {
                optimizedBuffer = await image
                  .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
                  .webp({ quality: 85 })
                  .toBuffer();
              } else {
                optimizedBuffer = await image
                  .webp({ quality: 85 })
                  .toBuffer();
              }

              const octokit = new Octokit({ auth: repo.access_token });

              // Upload to GitHub
              const commitMessage = hasWatermark 
                ? `Add image: ${originalname} (with watermark: ${watermarkOptions.text})`
                : `Add image: ${originalname}`;
              
              const response = await octokit.rest.repos.createOrUpdateFileContents({
                owner: req.user.username,
                repo: repo.name,
                path: `images/${uniqueFilename}`,
                message: commitMessage,
                content: optimizedBuffer.toString('base64'),
                branch: 'main'
              });

                            const githubUrl = response.data.content.html_url;
              // Create CDN URL for direct image access
              const cdnUrl = `https://raw.githubusercontent.com/${req.user.username}/${repo.name}/main/images/${uniqueFilename}`;

              // Store image metadata in database
              db.run(
                'INSERT INTO images (repository_id, filename, original_name, file_path, file_size, mime_type, width, height, github_url, cdn_url, sha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [repoId, uniqueFilename, originalname, `images/${uniqueFilename}`, optimizedBuffer.length, 'image/webp', metadata.width, metadata.height, githubUrl, cdnUrl, response.data.content.sha],
            function(err) {
              if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to save image metadata' });
              }

              res.status(201).json({
                id: this.lastID,
                filename: uniqueFilename,
                original_name: originalname,
                github_url: githubUrl,
                cdn_url: cdnUrl,
                width: metadata.width,
                height: metadata.height,
                file_size: optimizedBuffer.length,
                sha: response.data.content.sha,
                watermark_applied: hasWatermark && finalBuffer !== buffer, // Only true if watermark was actually applied
                watermark_text: hasWatermark && finalBuffer !== buffer ? watermarkOptions.text : null
              });
            }
          );
            } catch (processingError) {
              console.error('Image processing error:', processingError);
              res.status(500).json({ error: 'Failed to process image' });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get images from repository
router.get('/repositories/:repoId/images', ensureAuthenticated, async (req, res) => {
  try {
    const { repoId } = req.params;

    // First get the user's database ID from their GitHub ID
    db.get(
      'SELECT id FROM users WHERE github_id = ?',
      [req.user.id],
      (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch user' });
        }
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Verify repository belongs to user
        db.get(
          'SELECT r.* FROM repositories r WHERE r.id = ? AND r.user_id = ?',
          [repoId, user.id],
          (err, repo) => {
            if (err || !repo) {
              return res.status(404).json({ error: 'Repository not found or access denied' });
            }

            // Get images for this repository
            db.all(
              'SELECT * FROM images WHERE repository_id = ? ORDER BY created_at DESC',
              [repoId],
              (err, images) => {
                if (err) {
                  console.error('Database error:', err);
                  return res.status(500).json({ error: 'Failed to fetch images' });
                }
                res.json(images);
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete image from repository
router.delete('/repositories/:repoId/images/:imageId', ensureAuthenticated, async (req, res) => {
  try {
    const { repoId, imageId } = req.params;

    // First get the user's database ID from their GitHub ID
    db.get(
      'SELECT id FROM users WHERE github_id = ?',
      [req.user.id],
      (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch user' });
        }
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Get image and repository details
        db.get(
          'SELECT i.*, r.name, u.access_token FROM images i JOIN repositories r ON i.repository_id = r.id JOIN users u ON r.user_id = u.id WHERE i.id = ? AND r.id = ? AND r.user_id = ?',
          [imageId, repoId, user.id],
          async (err, image) => {
            if (err || !image) {
              console.error('Image not found:', { imageId, repoId, userId: user.id, error: err });
              return res.status(404).json({ error: 'Image not found or access denied' });
            }

            console.log('Image found for deletion:', { 
              imageId, 
              filename: image.filename, 
              sha: image.sha, 
              hasSha: !!image.sha,
              accessToken: image.access_token ? 'present' : 'missing'
            });

            if (!image.sha) {
              console.log('Image SHA missing, attempting to fetch from GitHub...');
              
              try {
                const octokit = new Octokit({ auth: image.access_token });
                
                // Try to get the file info from GitHub to get the SHA
                const fileResponse = await octokit.rest.repos.getContent({
                  owner: req.user.username,
                  repo: image.name,
                  path: image.file_path,
                  ref: 'main'
                });
                
                if (fileResponse.data && fileResponse.data.sha) {
                  console.log('Retrieved SHA from GitHub:', fileResponse.data.sha);
                  image.sha = fileResponse.data.sha;
                  
                  // Update the SHA in database for future use
                  db.run('UPDATE images SET sha = ? WHERE id = ?', [image.sha, imageId], (err) => {
                    if (err) {
                      console.error('Error updating SHA in database:', err);
                    } else {
                      console.log('SHA updated in database successfully');
                    }
                  });
                } else {
                  console.error('Could not retrieve SHA from GitHub');
                  return res.status(400).json({ error: 'Could not retrieve image SHA from GitHub. Cannot delete.' });
                }
              } catch (githubError) {
                console.error('Error fetching SHA from GitHub:', githubError.message);
                return res.status(400).json({ error: 'Could not retrieve image SHA from GitHub. Cannot delete.' });
              }
            }

            try {
              console.log('Attempting GitHub deletion:', {
                owner: req.user.username,
                repo: image.name,
                path: image.file_path,
                sha: image.sha
              });

              const octokit = new Octokit({ auth: image.access_token });

              // Delete from GitHub
              const deleteResponse = await octokit.rest.repos.deleteFile({
                owner: req.user.username,
                repo: image.name, // This is the repository name from the JOIN
                path: image.file_path,
                message: `Delete image: ${image.original_name}`,
                sha: image.sha
              });

              console.log('GitHub deletion successful:', deleteResponse.data);

              // Delete from database
              db.run('DELETE FROM images WHERE id = ?', [imageId], (err) => {
                if (err) {
                  console.error('Database error:', err);
                  return res.status(500).json({ error: 'Failed to delete image from database' });
                }

                res.json({ message: 'Image deleted successfully' });
              });
            } catch (githubError) {
              console.error('GitHub API error:', githubError);
              res.status(400).json({ 
                error: 'Failed to delete image from GitHub',
                details: githubError.message 
              });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get image by ID
router.get('/images/:imageId', ensureAuthenticated, async (req, res) => {
  try {
    const { imageId } = req.params;

    // First get the user's database ID from their GitHub ID
    db.get(
      'SELECT id FROM users WHERE github_id = ?',
      [req.user.id],
      (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch user' });
        }
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Get image details
        db.get(
          'SELECT i.*, r.name FROM images i JOIN repositories r ON i.repository_id = r.id WHERE i.id = ? AND r.user_id = ?',
          [imageId, user.id],
          (err, image) => {
            if (err || !image) {
              return res.status(404).json({ error: 'Image not found or access denied' });
            }
            res.json(image);
          }
        );
      }
    );
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get CDN URLs for all images in a repository (public endpoint for customers)
router.get('/repositories/:repoId/cdn', async (req, res) => {
  try {
    const { repoId } = req.params;
    
    // Get repository details
    db.get(
      'SELECT r.*, u.username FROM repositories r JOIN users u ON r.user_id = u.id WHERE r.id = ?',
      [repoId],
      (err, repo) => {
        if (err || !repo) {
          return res.status(404).json({ error: 'Repository not found' });
        }
        
        // Get all images with CDN URLs
        db.all(
          'SELECT id, filename, original_name, cdn_url, width, height, file_size, created_at FROM images WHERE repository_id = ? ORDER BY created_at DESC',
          [repoId],
          (err, images) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Failed to fetch images' });
            }
            
            res.json({
              repository: {
                name: repo.name,
                username: repo.username,
                description: repo.description
              },
              images: images.map(img => ({
                ...img,
                // Generate CDN URL if not stored
                cdn_url: img.cdn_url || `https://raw.githubusercontent.com/${repo.username}/${repo.name}/main/images/${img.filename}`
              }))
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Error fetching CDN URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get CDN URL for a specific image (public endpoint for customers)
router.get('/images/:imageId/cdn', async (req, res) => {
  try {
    const { imageId } = req.params;
    
    // Get image details
    db.get(
      'SELECT i.*, r.name, u.username FROM images i JOIN repositories r ON i.repository_id = r.id JOIN users u ON r.user_id = u.id WHERE i.id = ?',
      [imageId],
      (err, image) => {
        if (err || !image) {
          return res.status(404).json({ error: 'Image not found' });
        }
        
        const cdnUrl = image.cdn_url || `https://raw.githubusercontent.com/${image.username}/${image.name}/main/images/${image.filename}`;
        
        res.json({
          id: image.id,
          filename: image.filename,
          original_name: image.original_name,
          cdn_url: cdnUrl,
          width: image.width,
          height: image.height,
          file_size: image.file_size,
          created_at: image.created_at
        });
      }
    );
  } catch (error) {
    console.error('Error fetching image CDN URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

