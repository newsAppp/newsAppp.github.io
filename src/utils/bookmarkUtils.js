// Utility functions for managing bookmarks in localStorage
// Supports user-specific bookmarks with guest fallback

const GUEST_BOOKMARKS_KEY = 'newsflash_bookmarks_guest';
const LEGACY_BOOKMARKS_KEY = 'newsflash_bookmarks'; // For migration

/**
 * Get the bookmark key for the current user
 * @param {Object|null} user - User object with email property, or null for guest
 * @returns {string} The localStorage key for bookmarks
 */
const getBookmarkKey = (user) => {
  if (user && user.email) {
    return `newsflash_bookmarks_${user.email}`;
  }
  return GUEST_BOOKMARKS_KEY;
};

/**
 * Migrate legacy bookmarks to the new user-specific or guest format
 * This runs once to convert old global bookmarks to the new format
 * @param {Object|null} user - User object, or null for guest
 */
export const migrateLegacyBookmarks = (user) => {
  try {
    const legacyBookmarks = localStorage.getItem(LEGACY_BOOKMARKS_KEY);
    if (legacyBookmarks) {
      const targetKey = getBookmarkKey(user);
      const existingBookmarks = localStorage.getItem(targetKey);

      // Only migrate if there are no existing bookmarks for this user
      if (!existingBookmarks) {
        localStorage.setItem(targetKey, legacyBookmarks);
        console.log('Migrated legacy bookmarks to:', targetKey);
      }

      // Remove legacy bookmarks
      localStorage.removeItem(LEGACY_BOOKMARKS_KEY);
    }
  } catch (error) {
    console.error('Error migrating legacy bookmarks:', error);
  }
};

/**
 * Migrate guest bookmarks to user account when they sign up or log in
 * @param {Object} user - User object with email property
 */
export const migrateGuestBookmarks = (user) => {
  try {
    if (!user || !user.email) return;

    const guestBookmarks = localStorage.getItem(GUEST_BOOKMARKS_KEY);
    if (guestBookmarks) {
      const userKey = getBookmarkKey(user);
      const existingUserBookmarks = localStorage.getItem(userKey);

      if (existingUserBookmarks) {
        // Merge guest bookmarks with existing user bookmarks
        const guest = JSON.parse(guestBookmarks);
        const existing = JSON.parse(existingUserBookmarks);

        // Create a map of existing article IDs to avoid duplicates
        const existingIds = new Set(existing.map(b => b.article_id));
        const newBookmarks = guest.filter(b => !existingIds.has(b.article_id));

        const merged = [...existing, ...newBookmarks];
        localStorage.setItem(userKey, JSON.stringify(merged));
        console.log(`Merged ${newBookmarks.length} guest bookmarks with user bookmarks`);
      } else {
        // No existing user bookmarks, just move guest bookmarks
        localStorage.setItem(userKey, guestBookmarks);
        console.log('Migrated guest bookmarks to user account');
      }

      // Clear guest bookmarks after migration
      localStorage.removeItem(GUEST_BOOKMARKS_KEY);
    }
  } catch (error) {
    console.error('Error migrating guest bookmarks:', error);
  }
};

/**
 * Get all bookmarked articles for a user
 * @param {Object|null} user - User object, or null for guest
 * @returns {Array} Array of bookmarked article objects
 */
export const getBookmarkedArticles = (user = null) => {
  try {
    const key = getBookmarkKey(user);
    const bookmarks = localStorage.getItem(key);
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (error) {
    console.error('Error reading bookmarks:', error);
    return [];
  }
};

/**
 * Get array of bookmarked article IDs
 * @param {Object|null} user - User object, or null for guest
 * @returns {Array} Array of article IDs
 */
export const getBookmarkIds = (user = null) => {
  const bookmarks = getBookmarkedArticles(user);
  return bookmarks.map(article => article.article_id);
};

/**
 * Check if an article is bookmarked
 * @param {number|string} articleId - The article ID to check
 * @param {Object|null} user - User object, or null for guest
 * @returns {boolean} True if bookmarked, false otherwise
 */
export const isBookmarked = (articleId, user = null) => {
  const bookmarkIds = getBookmarkIds(user);
  return bookmarkIds.includes(articleId);
};

/**
 * Toggle bookmark status for an article
 * @param {number|string} articleId - The article ID
 * @param {Object} articleData - Full article object to store
 * @param {Object|null} user - User object, or null for guest
 * @returns {boolean} True if bookmarked after toggle, false if unbookmarked
 */
export const toggleBookmark = (articleId, articleData, user = null) => {
  try {
    const key = getBookmarkKey(user);
    const bookmarks = getBookmarkedArticles(user);
    const existingIndex = bookmarks.findIndex(
      article => article.article_id === articleId
    );

    if (existingIndex !== -1) {
      // Remove bookmark
      bookmarks.splice(existingIndex, 1);
      localStorage.setItem(key, JSON.stringify(bookmarks));
      return false;
    } else {
      // Add bookmark
      bookmarks.push({
        ...articleData,
        bookmarked_at: new Date().toISOString()
      });
      localStorage.setItem(key, JSON.stringify(bookmarks));
      return true;
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return false;
  }
};

/**
 * Clear all bookmarks for a user
 * @param {Object|null} user - User object, or null for guest
 */
export const clearBookmarks = (user = null) => {
  try {
    const key = getBookmarkKey(user);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing bookmarks:', error);
  }
};

/**
 * Get bookmark count for a user
 * @param {Object|null} user - User object, or null for guest
 * @returns {number} Number of bookmarked articles
 */
export const getBookmarkCount = (user = null) => {
  return getBookmarkedArticles(user).length;
};
