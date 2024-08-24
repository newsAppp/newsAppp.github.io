import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CardMedia, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import OGContentList from './OGContentList';
import { getSimilar } from '../api';

const NewsCard = ({ news, isHindi }) => {
  const [open, setOpen] = useState(false);
  const [similarUrls, setSimilarUrls] = useState([]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getImageUrl = (imageJson) => {
    try {
      const jsonString = imageJson.replace(/'/g, '"');
      let url = JSON.parse(jsonString)['identifier'] 
      console.log(url)
      return url
    } catch (error) {
    }
    return imageJson
  };

  useEffect(() => {
    const fetchSimilarUrls = async () => {
      try {
        const data = await getSimilar(news.article_id);
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
      <Card onClick={handleClickOpen}>
        {news.image_loc && (
          <CardMedia
            component="img"
            alt={news.title}
            height="200"
            image={getImageUrl(news.image_loc)}
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
        <DialogTitle>Refrences</DialogTitle>
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
