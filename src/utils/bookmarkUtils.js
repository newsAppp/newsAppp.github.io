// Utility functions for managing bookmarks in localStorage

const BOOKMARKS_KEY = 'newsflash_bookmarks';

/**
 * Get all bookmarked articles
 * @returns {Array} Array of bookmarked article objects
 */
export const getBookmarkedArticles = () => {
  try {
    const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (error) {
    console.error('Error reading bookmarks:', error);
    return [];
  }
};

/**
 * Get array of bookmarked article IDs
 * @returns {Array} Array of article IDs
 */
export const getBookmarkIds = () => {
  const bookmarks = getBookmarkedArticles();
  return bookmarks.map(article => article.article_id);
};

/**
 * Check if an article is bookmarked
 * @param {number|string} articleId - The article ID to check
 * @returns {boolean} True if bookmarked, false otherwise
 */
export const isBookmarked = (articleId) => {
  const bookmarkIds = getBookmarkIds();
  return bookmarkIds.includes(articleId);
};

/**
 * Toggle bookmark status for an article
 * @param {number|string} articleId - The article ID
 * @param {Object} articleData - Full article object to store
 * @returns {boolean} True if bookmarked after toggle, false if unbookmarked
 */
export const toggleBookmark = (articleId, articleData) => {
  try {
    const bookmarks = getBookmarkedArticles();
    const existingIndex = bookmarks.findIndex(
      article => article.article_id === articleId
    );

    if (existingIndex !== -1) {
      // Remove bookmark
      bookmarks.splice(existingIndex, 1);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      return false;
    } else {
      // Add bookmark
      bookmarks.push({
        ...articleData,
        bookmarked_at: new Date().toISOString()
      });
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      return true;
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return false;
  }
};

/**
 * Clear all bookmarks
 */
export const clearBookmarks = () => {
  try {
    localStorage.removeItem(BOOKMARKS_KEY);
  } catch (error) {
    console.error('Error clearing bookmarks:', error);
  }
};

/**
 * Get bookmark count
 * @returns {number} Number of bookmarked articles
 */
export const getBookmarkCount = () => {
  return getBookmarkedArticles().length;
};
