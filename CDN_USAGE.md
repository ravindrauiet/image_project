# GitHub Image API - CDN Usage Guide

## Overview

This project transforms GitHub repositories into a powerful CDN (Content Delivery Network) for images. Upload images through the web interface, and get direct HTTPS URLs that can be used in any web project.

## Features

- **Direct HTTPS URLs**: Get `https://raw.githubusercontent.com/` URLs for instant image access
- **Automatic Optimization**: Images are automatically resized and converted to WebP format
- **High Availability**: GitHub's global CDN ensures fast delivery worldwide
- **Version Control**: All images are version-controlled with Git
- **Public Access**: CDN URLs are publicly accessible (no authentication required)

## How It Works

1. **Upload**: Upload images through the web interface
2. **GitHub Storage**: Images are stored in your GitHub repository
3. **CDN URLs**: Get direct HTTPS URLs for immediate use
4. **Global Delivery**: GitHub's CDN serves images worldwide

## API Endpoints

### Public CDN Endpoints (No Authentication Required)

#### Get All Images in a Repository
```
GET /api/repositories/{repoId}/cdn
```

**Response:**
```json
{
  "repository": {
    "name": "my-project",
    "username": "yourusername",
    "description": "Project description"
  },
  "images": [
    {
      "id": 1,
      "filename": "1234567890_abc123.png",
      "original_name": "logo.png",
      "cdn_url": "https://raw.githubusercontent.com/yourusername/my-project/main/images/1234567890_abc123.png",
      "width": 800,
      "height": 600,
      "file_size": 45000,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Specific Image CDN URL
```
GET /api/images/{imageId}/cdn
```

**Response:**
```json
{
  "id": 1,
  "filename": "1234567890_abc123.png",
  "original_name": "logo.png",
  "cdn_url": "https://raw.githubusercontent.com/yourusername/my-project/main/images/1234567890_abc123.png",
  "width": 800,
  "height": 600,
  "file_size": 45000,
  "created_at": "2025-01-15T10:30:00Z"
}
```

## Usage Examples

### HTML
```html
<img src="https://raw.githubusercontent.com/yourusername/my-project/main/images/1234567890_abc123.png" 
     alt="Logo" 
     width="800" 
     height="600">
```

### CSS
```css
.hero-section {
  background-image: url('https://raw.githubusercontent.com/yourusername/my-project/main/images/hero-bg.png');
  background-size: cover;
}
```

### JavaScript
```javascript
// Load image dynamically
const img = new Image();
img.src = 'https://raw.githubusercontent.com/yourusername/my-project/main/images/dynamic-image.png';
img.onload = () => {
  document.body.appendChild(img);
};
```

### React
```jsx
function MyComponent() {
  return (
    <img 
      src="https://raw.githubusercontent.com/yourusername/my-project/main/images/react-logo.png"
      alt="React Logo"
      className="w-32 h-32"
    />
  );
}
```

### Next.js
```jsx
import Image from 'next/image';

export default function MyPage() {
  return (
    <Image
      src="https://raw.githubusercontent.com/yourusername/my-project/main/images/next-image.png"
      alt="Next.js Image"
      width={500}
      height={300}
      priority
    />
  );
}
```

## CDN URL Format

```
https://raw.githubusercontent.com/{username}/{repository}/main/images/{filename}
```

**Example:**
```
https://raw.githubusercontent.com/johndoe/my-website/main/images/1234567890_logo.png
```

## Benefits

### For Developers
- **Fast Development**: No need to set up separate image hosting
- **Version Control**: Track image changes with Git
- **Collaboration**: Team members can upload images through the interface
- **Backup**: All images are backed up on GitHub

### For Projects
- **Performance**: GitHub's global CDN ensures fast loading
- **Reliability**: GitHub's 99.9% uptime guarantee
- **Scalability**: Handle unlimited images and traffic
- **Cost**: Free hosting for public repositories

### For Clients
- **Professional**: Clean, professional URLs
- **Accessible**: No login required to access images
- **Fast**: Global CDN ensures fast loading worldwide
- **Reliable**: GitHub's enterprise-grade infrastructure

## Best Practices

### 1. Image Optimization
- Images are automatically optimized when uploaded
- Large images are resized to max 1920x1080
- Converted to WebP format for better compression

### 2. Naming Conventions
- Use descriptive filenames
- Include dimensions in filename if needed
- Use consistent naming patterns

### 3. Organization
- Group related images in the same repository
- Use descriptive repository names
- Add meaningful descriptions

### 4. Performance
- Use appropriate image dimensions
- Consider lazy loading for multiple images
- Use WebP format when possible

## Limitations

- **Public Access**: CDN URLs are publicly accessible
- **File Size**: Maximum 10MB per image
- **Format**: Images are converted to WebP
- **Repository**: Must be public for CDN access

## Security Considerations

- **Public URLs**: CDN URLs are publicly accessible
- **No Authentication**: Anyone with the URL can access images
- **Repository Privacy**: Consider repository privacy settings
- **Content**: Ensure uploaded content is appropriate for public access

## Troubleshooting

### Common Issues

1. **Image Not Loading**
   - Check if repository is public
   - Verify filename in URL
   - Ensure image exists in repository

2. **Slow Loading**
   - Check image file size
   - Consider image optimization
   - Verify CDN URL format

3. **404 Errors**
   - Check repository name
   - Verify image path
   - Ensure image was uploaded successfully

### Support

For technical support or questions:
- Check the web interface for image status
- Verify repository settings on GitHub
- Review API responses for error details

## Future Enhancements

- **Custom Domains**: Support for custom CDN domains
- **Image Transformations**: On-the-fly image resizing and cropping
- **Analytics**: Track image usage and performance
- **Caching**: Advanced caching strategies
- **Multiple Formats**: Support for additional image formats

---

**Note**: This CDN service is powered by GitHub's infrastructure and is subject to GitHub's terms of service and rate limits.
