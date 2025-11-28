import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CardMedia, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Box } from '@mui/material';
import { Bookmark, BookmarkBorder } from '@mui/icons-material';
import OGContentList from './OGContentList';
import { getSimilarV2 } from '../api';
import { isBookmarked, toggleBookmark } from '../utils/bookmarkUtils';

const NewsCard = ({ news, isHindi, onBookmarkChange }) => {

  const [open, setOpen] = useState(false);
  const [similarUrls, setSimilarUrls] = useState([]);
  const [imageError, setImageError] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getImageUrl = (imageJson) => {
    try {
      const jsonString = imageJson.replace(/'/g, '"');
      let url = JSON.parse(jsonString)['identifier'];
      if (url == 'https://www.thehindu.com/theme/images/og-image.png') {
        return '/logo/vector/default.svg';
      }
      return url;
    } catch (error) {
      console.info('Error parsing image JSON:', error);
    }
    return imageJson;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleBookmarkToggle = (e) => {
    e.stopPropagation(); // Prevent opening the dialog
    const newBookmarkState = toggleBookmark(news.article_id, news);
    setBookmarked(newBookmarkState);

    // Notify parent component if callback provided
    if (onBookmarkChange) {
      onBookmarkChange(news.article_id, newBookmarkState);
    }
  };

  // Initialize bookmark state
  useEffect(() => {
    setBookmarked(isBookmarked(news.article_id));
  }, [news.article_id]);

  useEffect(() => {
    const fetchSimilarUrls = async () => {
      try {
        const data = await getSimilarV2(news.article_id);
        setSimilarUrls(data);
      } catch (error) {
        console.error('Error fetching similar URLs:', error);
      }
    };

    if (open) {
      fetchSimilarUrls();
    }
  }, [open, news.article_id]);



  return (
    <div>
      <Card
        onClick={handleClickOpen}
        sx={{
          position: 'relative',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          }
        }}
      >
        {/* Bookmark Button */}
        <Tooltip title={bookmarked ? "Remove bookmark" : "Bookmark"}>
          <IconButton
            onClick={handleBookmarkToggle}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              zIndex: 1,
              transition: 'all 0.3s',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.15)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              }
            }}
          >
            {bookmarked ? (
              <Bookmark sx={{ color: 'primary.main' }} />
            ) : (
              <BookmarkBorder sx={{ color: 'text.secondary' }} />
            )}
          </IconButton>
        </Tooltip>

        {news.image_loc && !imageError ? (
          <CardMedia
            component="img"
            alt={news.title}
            height="200"
            image={getImageUrl(news.image_loc)}
            onError={handleImageError}
          />
        ) : (
          <CardMedia
            component="img"
            alt="Placeholder"
            height="200"
            image="/logo/vector/default.svg"
          />
        )}
        <CardContent>
          <Typography variant="h5" component="div">
            {isHindi ? news.titlehindi : news.title}
          </Typography>
          <Typography variant="body2" marginTop={2} color="text.secondary">
            {isHindi ? news.summaryhindi : news.summary}
          </Typography>
        </CardContent>
      </Card>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>References</DialogTitle>
        <DialogContent>
          <OGContentList urls={similarUrls} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NewsCard;