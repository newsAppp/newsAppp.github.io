import React, { useState } from 'react';
import {
  IconButton,
  Popover,
  Box,
  Typography,
  Button,
  Snackbar,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Email,
  Share as ShareIcon,
  ContentCopy,
  Image as ImageIcon,
  Download,
  IosShare
} from '@mui/icons-material';
import { handleShareAsImage, canUseWebShareAPI } from '../utils/shareUtils';

const ShareButton = ({ icon: Icon, color, label, onClick }) => (
  <IconButton
    onClick={onClick}
    sx={{
      color: 'white',
      backgroundColor: color,
      '&:hover': {
        backgroundColor: color,
        opacity: 0.8,
      },
      transition: 'all 0.3s',
      '&:hover': {
        transform: 'scale(1.1)',
      },
    }}
  >
    <Icon />
  </IconButton>
);

const Share = ({ url, title, news, isHindi = false, open: externalOpen, anchorEl: externalAnchorEl, onClose: externalOnClose }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [generatedCanvas, setGeneratedCanvas] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`,
    email: `mailto:?subject=${shareTitle}&body=Check this out: ${shareUrl}`
  };

  // Use external props if provided, otherwise use internal state
  const isOpen = externalOpen !== undefined ? externalOpen : Boolean(anchorEl);
  const currentAnchorEl = externalAnchorEl !== undefined ? externalAnchorEl : anchorEl;

  const handleClick = (event) => {
    if (externalOpen === undefined) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setAnchorEl(null);
    }
  };

  const handleShare = (platform) => {
    window.open(shareLinks[platform], '_blank');
    handleClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    showSnackbar('Link copied to clipboard');
    handleClose();
  };

  const handleGenerateImage = async () => {
    if (!news) {
      showSnackbar('Unable to generate image for this content');
      return;
    }

    setIsGenerating(true);
    setError(null);
    handleClose(); // Close the share popover

    try {
      // Import the function
      const { generateNewsCardImage } = require('../utils/shareUtils');

      // Generate canvas for preview
      const canvas = await generateNewsCardImage(news, isHindi);

      // Convert canvas to data URL for preview
      const dataUrl = canvas.toDataURL('image/png', 0.92);
      setGeneratedCanvas({ canvas, dataUrl });
      setImageDialogOpen(true);
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err.message || 'Failed to generate image');
      showSnackbar('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareImage = async () => {
    if (!generatedCanvas) return;

    try {
      const { downloadImage, shareImageViaWebShareAPI, generateFilename } = require('../utils/shareUtils');
      const titleText = isHindi ? news.titlehindi : news.title;
      const filename = generateFilename(titleText, isHindi);

      if (canUseWebShareAPI()) {
        // Mobile - use Web Share API
        await shareImageViaWebShareAPI(generatedCanvas.canvas, titleText);
        setImageDialogOpen(false);
        showSnackbar('Image shared successfully!');
      } else {
        // Desktop - download
        await downloadImage(generatedCanvas.canvas, filename);
        setImageDialogOpen(false);
        showSnackbar('Image downloaded successfully!');
      }
    } catch (err) {
      console.error('Error sharing image:', err);
      showSnackbar(err.message || 'Failed to share image');
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const id = isOpen ? 'simple-popover' : undefined;

  return (
    <>
      <Popover
        id={id}
        open={isOpen}
        anchorEl={currentAnchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, width: 250 }}>
          <Typography variant="h6" gutterBottom>
            Share this content
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <ShareButton
              icon={Facebook}
              color="#1877F2"
              label="Share on Facebook"
              onClick={() => handleShare('facebook')}
            />
            <ShareButton
              icon={Twitter}
              color="#1DA1F2"
              label="Share on Twitter"
              onClick={() => handleShare('twitter')}
            />
            <ShareButton
              icon={LinkedIn}
              color="#0A66C2"
              label="Share on LinkedIn"
              onClick={() => handleShare('linkedin')}
            />
            <ShareButton
              icon={Email}
              color="#EA4335"
              label="Share via Email"
              onClick={() => handleShare('email')}
            />
          </Box>
          <Button
            variant="outlined"
            startIcon={<ContentCopy />}
            fullWidth
            onClick={handleCopyLink}
          >
            Copy Link
          </Button>

          {/* Share as Image Button */}
          {news && (
            <Button
              variant="contained"
              startIcon={<ImageIcon />}
              fullWidth
              onClick={handleGenerateImage}
              disabled={isGenerating}
              sx={{ mt: 1.5 }}
            >
              {isGenerating ? 'Generating...' : 'Share as Image'}
            </Button>
          )}
        </Box>
      </Popover>

      {/* Image Preview Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Preview Share Image
        </DialogTitle>
        <DialogContent>
          {generatedCanvas && (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                padding: 2
              }}
            >
              <img
                src={generatedCanvas.dataUrl}
                alt="Share preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '600px',
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={canUseWebShareAPI() ? <IosShare /> : <Download />}
            onClick={handleShareImage}
          >
            {canUseWebShareAPI() ? 'Share' : 'Download'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for messages */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />

      {/* Loading overlay */}
      {isGenerating && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white' }}>
            Generating shareable image...
          </Typography>
        </Box>
      )}
    </>
  );
};

export default Share;