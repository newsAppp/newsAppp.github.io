import React, { useState, useEffect } from 'react';
import { Card, CardMedia, CardContent, Typography, Dialog, DialogTitle, DialogContent, Box, IconButton, Tooltip } from '@mui/material';
import { Bookmark, BookmarkBorder, Share as ShareIcon } from '@mui/icons-material';
import OGContentList from './OGContentList';
import { getSimilarV2 } from '../api';
import { isBookmarked, toggleBookmark } from '../utils/bookmarkUtils';
import Share from './Share';



const NewsCard = ({ news, isHindi, onBookmarkChange }) => {

  const [open, setOpen] = useState(false);
  const [similarUrls, setSimilarUrls] = useState([]);
  const [imageError, setImageError] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked(news.article_id));
  const [shareOpen, setShareOpen] = useState(false);
  const [shareAnchor, setShareAnchor] = useState(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleBookmarkClick = (event) => {
    event.stopPropagation();
    const newBookmarkState = toggleBookmark(news.article_id, news);
    setBookmarked(newBookmarkState);

    if (onBookmarkChange) {
      onBookmarkChange(news.article_id, newBookmarkState);
    }
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

    if (onBookmarkChange) {
      onBookmarkChange(news.article_id, newBookmarkState);
    }
  };

  const handleShareClick = (event) => {
    event.stopPropagation();
    setShareAnchor(event.currentTarget);
    setShareOpen(true);
  };

  const handleShareClose = () => {
    setShareOpen(false);
    setShareAnchor(null);
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
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          },
          position: 'relative',
        }}
      >
        {/* Card Actions */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            display: 'flex',
            gap: 1,
          }}
        >
          {/* Share Button */}
          <Tooltip title="Share">
            <IconButton
              onClick={handleShareClick}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
                boxShadow: 2,
              }}
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>

          {/* Bookmark Button */}
          <Tooltip title={bookmarked ? 'Remove bookmark' : 'Bookmark'}>
            <IconButton
              onClick={handleBookmarkClick}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
                transition: 'transform 0.2s',
                '&:active': {
                  transform: 'scale(0.95)',
                },
                boxShadow: 2,
              }}
            >
              {bookmarked ? (
                <Bookmark sx={{ color: 'primary.main' }} />
              ) : (
                <BookmarkBorder />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        <CardMedia
          component="img"
          height="200"
          image={getImageUrl(news.image_loc)}
          alt={isHindi ? news.titlehindi : news.title}
          onError={handleImageError}
          loading="lazy"
        />
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom>
            {isHindi ? news.titlehindi : news.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isHindi ? news.summaryhindi : news.summary}
          </Typography>
        </CardContent>
      </Card>

      {/* Share Popover */}
      <Share
        open={shareOpen}
        anchorEl={shareAnchor}
        onClose={handleShareClose}
        url={`https://newsflash.com/article/${news.article_id}`}
        title={isHindi ? news.titlehindi : news.title}
        news={news}
        isHindi={isHindi}
      />

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>References</DialogTitle>
        <DialogContent>
          <OGContentList urls={similarUrls} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsCard;