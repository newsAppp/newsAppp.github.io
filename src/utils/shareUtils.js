// Canvas-based image generation utilities for NewsFlash
// Native browser API - no external dependencies needed!

/**
 * Check if Web Share API is available
 */
export const canUseWebShareAPI = () => {
    return typeof navigator !== 'undefined' &&
        navigator.share !== undefined &&
        navigator.canShare !== undefined;
};

/**
 * Convert canvas to Blob
 */
const canvasToBlob = (canvas) => {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/png', 0.92);
    });
};

/**
 * Helper function to draw rounded rectangle
 */
const roundRect = (ctx, x, y, width, height, radius, clipOnly = false) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (!clipOnly) {
        ctx.fill();
    }
};

/**
 * Helper function to wrap text
 */
const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    const lines = [];

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && i > 0) {
            lines.push({ text: line, y: currentY });
            line = words[i] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    lines.push({ text: line, y: currentY });

    // Draw all lines
    lines.forEach(l => ctx.fillText(l.text, x, l.y));

    return currentY + lineHeight; // Return final Y position
};

/**
 * Load image from URL
 */
const loadImage = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
};

/**
 * Parse image URL from news data
 */
const parseImageUrl = (imageJson) => {
    if (!imageJson) return null;

    try {
        const jsonString = imageJson.replace(/'/g, '"');
        let url = JSON.parse(jsonString)['identifier'];
        if (url === 'https://www.thehindu.com/theme/images/og-image.png') {
            return null; // Skip default placeholder
        }
        return url;
    } catch (error) {
        return null;
    }
};

/**
 * Generate news card image using Canvas API
 * Portrait orientation optimized for mobile sharing (1080x1920)
 */
export const generateNewsCardImage = async (news, isHindi = false) => {
    if (!news) {
        throw new Error('News data is required');
    }

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size - portrait for mobile (Instagram/WhatsApp stories)
    canvas.width = 1080;
    canvas.height = 1920;

    // Extract data
    const title = isHindi ? news.titlehindi : news.title;
    const summary = isHindi ? news.summaryhindi : news.summary;
    const category = news.category || 'News';
    const imageUrl = news.image_loc ? parseImageUrl(news.image_loc) : null;

    try {
        // Simple, clean background - light gray that works in both modes
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add subtle border
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Content area
        const padding = 60;
        const contentY = 120;

        // Load and draw logo
        try {
            const logo = await loadImage('/logo/vector/default.svg');
            const logoHeight = 240; // Increased from 60px to 240px (4x bigger)
            const logoWidth = (logo.width / logo.height) * logoHeight;
            ctx.drawImage(logo, padding, contentY - 80, logoWidth, logoHeight);
        } catch (error) {
            // Fallback to text if logo fails to load
            ctx.fillStyle = '#212529';
            ctx.font = 'bold 56px Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('NewsFlash', padding, contentY);
        }

        // Category badge
        ctx.fillStyle = '#6366f1'; // Indigo accent color
        const badgeText = category.toUpperCase();
        ctx.font = 'bold 28px Arial, sans-serif';
        const badgeWidth = ctx.measureText(badgeText).width + 40;
        const badgeX = canvas.width - padding - badgeWidth;
        const badgeY = contentY + 40; // Moved down to align with bigger logo
        roundRect(ctx, badgeX, badgeY, badgeWidth, 44, 22);

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(badgeText, badgeX + badgeWidth / 2, badgeY + 30);

        let currentY = contentY + 200; // Increased to account for bigger logo

        // Draw image if available
        if (imageUrl) {
            try {
                const img = await loadImage(imageUrl);
                const imgSize = 960; // 1080 - (60 padding * 2)
                const imgHeight = 540; // 16:9 aspect ratio
                const imgX = padding;
                const imgY = currentY;

                // Draw image with rounded corners and subtle shadow
                ctx.save();

                // Shadow
                ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
                ctx.shadowBlur = 20;
                ctx.shadowOffsetY = 10;

                roundRect(ctx, imgX, imgY, imgSize, imgHeight, 24, true);
                ctx.clip();

                // Calculate aspect ratio to cover the area
                const scale = Math.max(imgSize / img.width, imgHeight / img.height);
                const scaledWidth = img.width * scale;
                const scaledHeight = img.height * scale;
                const offsetX = imgX + (imgSize - scaledWidth) / 2;
                const offsetY = imgY + (imgHeight - scaledHeight) / 2;

                ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
                ctx.restore();

                currentY = imgY + imgHeight + 80;
            } catch (error) {
                console.warn('Failed to load image:', error);
                // Continue without image
            }
        }

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Draw title
        ctx.fillStyle = '#212529'; // Dark text
        ctx.font = 'bold 68px Arial, sans-serif';
        ctx.textAlign = 'left';

        const titleMaxWidth = canvas.width - padding * 2;
        currentY = wrapText(ctx, title || 'Untitled', padding, currentY, titleMaxWidth, 80);

        // Draw summary
        if (summary) {
            currentY += 40;
            ctx.font = '48px Arial, sans-serif';
            ctx.fillStyle = '#495057'; // Medium gray text
            const summaryMaxWidth = canvas.width - padding * 2;
            const summaryText = summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
            currentY = wrapText(ctx, summaryText, padding, currentY, summaryMaxWidth, 60);
        }

        // Footer section (at bottom)
        const footerY = canvas.height - 120;

        // Divider line
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(padding, footerY - 40);
        ctx.lineTo(canvas.width - padding, footerY - 40);
        ctx.stroke();

        // Footer text
        ctx.fillStyle = '#495057';
        ctx.font = 'bold 38px Arial, sans-serif';
        ctx.textAlign = 'left';
        const footerText = isHindi ? '📱 NewsFlash पर और पढ़ें' : '📱 Read more at NewsFlash';
        ctx.fillText(footerText, padding, footerY);

        // Date
        ctx.font = '32px Arial, sans-serif';
        ctx.fillStyle = '#6c757d'; // Light gray
        ctx.textAlign = 'right';
        const date = new Date().toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        ctx.fillText(date, canvas.width - padding, footerY);

        return canvas;
    } catch (error) {
        console.error('Error generating canvas image:', error);
        throw new Error('Failed to generate image. Please try again.');
    }
};

/**
 * Download image to device
 */
export const downloadImage = async (canvas, filename = 'newsflash-story.png') => {
    try {
        const blob = await canvasToBlob(canvas);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('Error downloading image:', error);
        throw new Error('Failed to download image. Please try again.');
    }
};

/**
 * Share image using Web Share API (mobile)
 */
export const shareImageViaWebShareAPI = async (canvas, title = 'NewsFlash Story') => {
    if (!canUseWebShareAPI()) {
        throw new Error('Web Share API is not supported on this device');
    }

    try {
        const blob = await canvasToBlob(canvas);
        const file = new File([blob], 'newsflash-story.png', { type: 'image/png' });

        // Check if we can share files
        if (!navigator.canShare({ files: [file] })) {
            throw new Error('Sharing images is not supported on this device');
        }

        await navigator.share({
            files: [file],
            title: title,
            text: `Check out this story from NewsFlash!`
        });

        return true;
    } catch (error) {
        // User cancelled the share or error occurred
        if (error.name === 'AbortError') {
            console.log('Share cancelled by user');
            return false;
        }
        console.error('Error sharing via Web Share API:', error);
        throw new Error('Failed to share image. Please try again.');
    }
};

/**
 * Generate filename for downloaded image
 */
export const generateFilename = (title, isHindi = false) => {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const sanitizedTitle = (title || 'story')
        .replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '-') // Allow Hindi characters
        .substring(0, 50)
        .toLowerCase();

    return `newsflash-${sanitizedTitle}-${date}.png`;
};

/**
 * Main function to handle share as image
 * Automatically detects if mobile (Web Share) or desktop (Download)
 */
export const handleShareAsImage = async (news, isHindi = false) => {
    try {
        // Generate the canvas
        const canvas = await generateNewsCardImage(news, isHindi);

        const title = isHindi ? news.titlehindi : news.title;
        const filename = generateFilename(title, isHindi);

        // Check if we should use Web Share API (mobile) or download (desktop)
        if (canUseWebShareAPI()) {
            // Mobile - use Web Share API
            await shareImageViaWebShareAPI(canvas, title);
            return { success: true, method: 'share', canvas };
        } else {
            // Desktop - download image
            await downloadImage(canvas, filename);
            return { success: true, method: 'download', canvas };
        }
    } catch (error) {
        console.error('Error in handleShareAsImage:', error);
        throw error;
    }
};
