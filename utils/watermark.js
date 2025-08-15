const Jimp = require('jimp');

class WatermarkProcessor {
  constructor() {
    this.defaultOptions = {
      text: '',
      color: '#FFFFFF',
      size: 24,
      opacity: 0.8,
      position: 'bottom-right',
      margin: 20
    };
  }

  async addWatermark(imageBuffer, options = {}) {
    try {
      const watermarkOptions = { ...this.defaultOptions, ...options };
      
      if (!watermarkOptions.text || watermarkOptions.text.trim() === '') {
        return imageBuffer; // Return original if no watermark text
      }

      // Validate input buffer
      if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
        throw new Error('Invalid image buffer provided');
      }

      console.log('Starting watermark process with options:', watermarkOptions);
      console.log('Image buffer size:', imageBuffer.length);
      console.log('Jimp type:', typeof Jimp);
      console.log('Jimp.read type:', typeof Jimp.read);

      // Load image from buffer
      const image = await Jimp.read(imageBuffer);
      console.log('Image loaded successfully, dimensions:', image.getWidth(), 'x', image.getHeight());
      
      // Validate image dimensions
      if (image.getWidth() === 0 || image.getHeight() === 0) {
        throw new Error('Invalid image dimensions');
      }
      
      // Convert hex color to Jimp color format
      const textColor = this.hexToJimpColor(watermarkOptions.color);
      console.log('Text color converted:', watermarkOptions.color, '->', textColor);
      
      // Validate color values
      if (textColor.r < 0 || textColor.r > 255 || textColor.g < 0 || textColor.g > 255 || textColor.b < 0 || textColor.b > 255) {
        throw new Error('Invalid color values');
      }
      
      // Create watermark text with proper size
      const fontSize = Math.max(12, Math.min(watermarkOptions.size, 200)); // Clamp size between 12-200
      console.log('Using font size:', fontSize);
      
      // Validate opacity
      const opacity = Math.max(0.1, Math.min(watermarkOptions.opacity, 1.0)); // Clamp opacity between 0.1-1.0
      console.log('Using opacity:', opacity);
      
      // Load appropriate font based on size
      let font;
      if (fontSize <= 16) {
        font = await Jimp.loadFont(Jimp.FONT_SANS_8_WHITE);
      } else if (fontSize <= 32) {
        font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
      } else if (fontSize <= 64) {
        font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
      } else if (fontSize <= 128) {
        font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
      } else {
        font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
      }
      
      console.log('Font loaded successfully, type:', font.constructor.name);
      
      // Create watermark text image with proper dimensions
      const textWidth = Jimp.measureText(font, watermarkOptions.text);
      const textHeight = Jimp.measureTextHeight(font, watermarkOptions.text, textWidth);
      
      console.log('Text dimensions:', textWidth, 'x', textHeight);
      
      // Create a larger canvas for the watermark to accommodate scaling
      const watermarkWidth = textWidth + 40;
      const watermarkHeight = textHeight + 40;
      
      const watermarkText = new Jimp(watermarkWidth, watermarkHeight, 0x00000000); // Transparent background
      
      // Add text to watermark with proper color
      watermarkText.print(font, 20, 20, {
        text: watermarkOptions.text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
      }, watermarkWidth, watermarkHeight);
      
      // Apply color to the text by replacing white pixels with custom color
      const targetColor = Jimp.rgbaToInt(textColor.r, textColor.g, textColor.b, 255);
      try {
        watermarkText.scan(0, 0, watermarkWidth, watermarkHeight, function(x, y) {
          try {
            const pixel = this.getPixelColor(x, y);
            // If pixel is not transparent
            if (pixel !== 0x00000000) {
              const rgba = Jimp.intToRGBA(pixel);
              // Check if it's a white pixel (text from font) - more flexible detection
              if (rgba.r > 150 && rgba.g > 150 && rgba.b > 150 && rgba.a > 0) {
                // Apply the custom color with full opacity
                this.setPixelColor(targetColor, x, y);
              }
            }
          } catch (pixelError) {
            console.warn(`Error processing pixel at (${x}, ${y}):`, pixelError.message);
            // Continue with next pixel
          }
        });
        console.log('Watermark created with custom color:', watermarkOptions.color);
      } catch (colorError) {
        console.error('Error applying color:', colorError);
        throw new Error(`Failed to apply color: ${colorError.message}`);
      }
      
      // Set opacity (0-1 to 0-255)
      const opacityValue = Math.round(opacity * 255);
      console.log('Setting opacity to:', opacity, '->', opacityValue);
      
      // Apply opacity by scanning each pixel and ensuring valid values
      try {
        watermarkText.scan(0, 0, watermarkWidth, watermarkHeight, function(x, y) {
          try {
            const pixel = this.getPixelColor(x, y);
            if (pixel !== 0x00000000) { // If not transparent
              const rgba = Jimp.intToRGBA(pixel);
              
              // Ensure RGB values are within valid range (0-255)
              const r = Math.max(0, Math.min(255, rgba.r));
              const g = Math.max(0, Math.min(255, rgba.g));
              const b = Math.max(0, Math.min(255, rgba.b));
              const a = Math.max(0, Math.min(255, opacityValue));
              
              // Create new pixel with proper opacity
              const newPixel = Jimp.rgbaToInt(r, g, b, a);
              this.setPixelColor(newPixel, x, y);
            }
          } catch (pixelError) {
            console.warn(`Error processing pixel opacity at (${x}, ${y}):`, pixelError.message);
            // Continue with next pixel
          }
        });
        console.log('Watermark created with color and opacity');
      } catch (opacityError) {
        console.error('Error applying opacity:', opacityError);
        throw new Error(`Failed to apply opacity: ${opacityError.message}`);
      }
      
      // Scale the watermark if size is different from default
      let finalWatermark = watermarkText;
      if (fontSize !== 24) { // 24 is the default size
        const scaleFactor = fontSize / 24;
        const newWidth = Math.round(watermarkWidth * scaleFactor);
        const newHeight = Math.round(watermarkHeight * scaleFactor);
        finalWatermark = watermarkText.resize(newWidth, newHeight);
        console.log('Watermark scaled by factor:', scaleFactor, 'to dimensions:', newWidth, 'x', newHeight);
      }
      
      // Calculate position
      const position = this.calculatePosition(
        image.getWidth(),
        image.getHeight(),
        finalWatermark.getWidth(),
        finalWatermark.getHeight(),
        watermarkOptions.position,
        watermarkOptions.margin
      );
      
      console.log('Watermark position calculated:', position);
      
      // Composite watermark onto image
      image.composite(finalWatermark, position.x, position.y);
      
      console.log('Watermark composited successfully');
      
      // Convert back to buffer
      const resultBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
      console.log('Watermarked image buffer size:', resultBuffer.length);
      
      return resultBuffer;
    } catch (error) {
      console.error('Watermark processing error:', error);
      console.error('Error stack:', error.stack);
      
      // Try fallback method if main method fails
      try {
        console.log('Attempting fallback watermark method...');
        return await this.fallbackWatermark(imageBuffer, watermarkOptions);
      } catch (fallbackError) {
        console.error('Fallback watermark also failed:', fallbackError);
        throw new Error(`Failed to add watermark to image: ${error.message}`);
      }
    }
  }

  // Fallback watermark method - simpler and more reliable
  async fallbackWatermark(imageBuffer, options) {
    try {
      console.log('Using fallback watermark method...');
      
      const image = await Jimp.read(imageBuffer);
      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
      
      // Simple text overlay without complex color/opacity manipulation
      const text = options.text || 'Watermark';
      const x = 20;
      const y = image.getHeight() - 50;
      
      // Add text directly to image
      image.print(font, x, y, text);
      
      console.log('Fallback watermark applied successfully');
      
      return await image.getBufferAsync(Jimp.MIME_JPEG);
    } catch (fallbackError) {
      console.error('Fallback watermark failed:', fallbackError);
      throw fallbackError;
    }
  }

  hexToJimpColor(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return { r, g, b };
  }

  calculatePosition(imageWidth, imageHeight, watermarkWidth, watermarkHeight, position, margin) {
    let x, y;
    
    switch (position) {
      case 'top-left':
        x = margin;
        y = margin;
        break;
      case 'top-right':
        x = imageWidth - watermarkWidth - margin;
        y = margin;
        break;
      case 'bottom-left':
        x = margin;
        y = imageHeight - watermarkHeight - margin;
        break;
      case 'bottom-right':
      default:
        x = imageWidth - watermarkWidth - margin;
        y = imageHeight - watermarkHeight - margin;
        break;
      case 'center':
        x = (imageWidth - watermarkWidth) / 2;
        y = (imageHeight - watermarkHeight) / 2;
        break;
    }
    
    return { x: Math.max(0, x), y: Math.max(0, y) };
  }

  parseWatermarkOptions(reqBody) {
    const options = {};
    
    if (reqBody.watermark_text && reqBody.watermark_text.trim()) {
      options.text = reqBody.watermark_text.trim();
    }
    
    if (reqBody.watermark_color) {
      options.color = reqBody.watermark_color;
    }
    
    if (reqBody.watermark_size) {
      const size = parseInt(reqBody.watermark_size);
      if (!isNaN(size) && size > 0) {
        options.size = size;
      }
    }
    
    if (reqBody.watermark_opacity) {
      const opacity = parseFloat(reqBody.watermark_opacity);
      if (!isNaN(opacity) && opacity >= 0 && opacity <= 1) {
        options.opacity = opacity;
      }
    }
    
    if (reqBody.watermark_position) {
      options.position = reqBody.watermark_position;
    }
    
    if (reqBody.watermark_margin) {
      const margin = parseInt(reqBody.watermark_margin);
      if (!isNaN(margin) && margin >= 0) {
        options.margin = margin;
      }
    }
    
    return options;
  }
}

module.exports = new WatermarkProcessor();
