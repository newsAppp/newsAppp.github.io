import React, { useState, useEffect, useRef } from 'react';
import { Container, Grid, CircularProgress, Box } from '@mui/material';
import NewsCard from './NewsCard';
import { fetchNews } from '../api';

const NewsList = ({ selectedCategory, isHindi }) => {
  console.log('selectedCategory 2', selectedCategory)
  const [newsList, setNewsList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef();
  const lastNewsElementRef = useRef(null);

  const loadNews = async (page, isInitialLoad = false) => {
    if (isLoading || (!hasMore && !isInitialLoad)) return;

    setIsLoading(true);
    try {
      
      console.log('selectedCategory 3', selectedCategory)

      const data = await fetchNews(selectedCategory, page, perPage);

      // Filter out duplicates based on article_id
      const newNews = data.filter(
        (newsItem) => !newsList.some((existingItem) => existingItem.article_id === newsItem.article_id)
      );

      if (newNews.length < perPage) {
        setHasMore(false); // No more pages to load
      }

      setNewsList((prevNews) => isInitialLoad ? [...data] : [...prevNews, ...newNews]);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Reset state and load the first page when category changes
    setNewsList([]);
    setCurrentPage(1);
    setHasMore(true);
    loadNews(1, true);  // Initial load for new category
  }, [selectedCategory]);

  useEffect(() => {
    if (currentPage > 1) {
      loadNews(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    if (isLoading) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (lastNewsElementRef.current) {
      observer.current.observe(lastNewsElementRef.current);
    }

    return () => {
      if (observer.current && lastNewsElementRef.current) {
        observer.current.unobserve(lastNewsElementRef.current);
      }
    };
  }, [isLoading, hasMore]);

  return (
    <Container>
      <Grid container spacing={2}>
        {newsList.map((news, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={index}
            ref={index === newsList.length - 1 ? lastNewsElementRef : null}
          >
            <NewsCard news={news} isHindi={isHindi} />
          </Grid>
        ))}
      </Grid>
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default NewsList;
