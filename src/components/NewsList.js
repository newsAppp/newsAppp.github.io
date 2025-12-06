import React, { useState, useEffect, useRef } from 'react';
import { Container, Grid, CircularProgress, Box, Typography } from '@mui/material';
import { BookmarkBorder } from '@mui/icons-material';
import NewsCard from './NewsCard';
import { fetchNews } from '../api';
import { getBookmarkedArticles } from '../utils/bookmarkUtils';
import { usePersonalization } from '../hooks/usePersonalization';
import { useAuth } from '../contexts/AuthContext';

const NewsList = ({ selectedCategory, isHindi, feedType }) => {
  console.log('selectedCategory 2', selectedCategory, 'feedType', feedType)
  const { user } = useAuth();
  const [newsList, setNewsList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [bookmarkRefresh, setBookmarkRefresh] = useState(0);

  const { getPersonalizedFeed } = usePersonalization();

  const observer = useRef();
  const lastNewsElementRef = useRef(null);

  const loadNews = async (page, isInitialLoad = false) => {
    // Handle personalized feed
    if (feedType === 'foryou') {
      setIsLoading(true);
      const personalizedFeed = await getPersonalizedFeed(page, perPage);

      if (personalizedFeed) {
        setNewsList(isInitialLoad ? personalizedFeed : [...newsList, ...personalizedFeed]);
        setHasMore(personalizedFeed.length >= perPage);
      } else {
        // Fallback to regular feed if not authenticated
        const data = await fetchNews([], page, perPage);
        setNewsList(data);
      }
      setIsLoading(false);
      return;
    }

    // Handle bookmarks view
    if (selectedCategory === 'bookmarks') {
      setIsLoading(true);
      const bookmarkedArticles = getBookmarkedArticles(user);
      setNewsList(bookmarkedArticles.reverse()); // Show newest bookmarks first
      setHasMore(false); // No pagination for bookmarks
      setIsLoading(false);
      return;
    }

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

  const handleBookmarkChange = () => {
    // Refresh bookmarks view when a bookmark is toggled
    if (selectedCategory === 'bookmarks') {
      setBookmarkRefresh(prev => prev + 1);
    }
  };

  useEffect(() => {
    // Reset state and load the first page when category changes
    setNewsList([]);
    setCurrentPage(1);
    setHasMore(true);
    loadNews(1, true);  // Initial load for new category
  }, [selectedCategory, bookmarkRefresh, feedType, user]); // Add user to reload when auth changes

  useEffect(() => {
    if (selectedCategory === 'bookmarks' || feedType === 'foryou') return; // No pagination for bookmarks or personalized feed

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
            <NewsCard
              news={news}
              isHindi={isHindi}
              onBookmarkChange={handleBookmarkChange}
            />
          </Grid>
        ))}
      </Grid>

      {/* Empty state for bookmarks */}
      {selectedCategory === 'bookmarks' && newsList.length === 0 && !isLoading && (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 8, mb: 8 }}
        >
          <BookmarkBorder sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No bookmarked articles yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bookmark articles to read them later
          </Typography>
        </Box>
      )}

      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default NewsList;
