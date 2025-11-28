import axios from 'axios';

// const API_URL = 'https://server3e.opencourse.live';
const API_URL = 'http://localhost:8000';

export const fetchNews = async (category, page = 1, perPage = 5) => {
  try {
    if (category === 'top30') {
      return await fetchTop30(1, page, perPage)
    }
    if (category !== 'top-news') {
      return await fetchSummary(2, page, perPage, [category])
    }
    const response = await axios.get(`${API_URL}/top`, {
      params: { category, page, per_page: perPage }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories`, {});
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

export const getSimilar = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/similar/${id}`, {});
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

export const getSimilarV2 = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/v2/similar/${id}`, {});
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

export const fetchSummary = async (day, page = 1, perPage = 6, categories = ["cities"]) => {
  try {
    let s = ''
    categories = categories[0].splice(',')
    for (let c of categories) {
      s += 'categories=' + c + '&'
    }
    const response = await axios.get(`${API_URL}/v1.1/summary?${s}&day=${day}&page=${page}&per_page=${perPage}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw error;
  }
};

export const fetchTop30 = async (day, page = 1, perPage = 6) => {
  try {
    const response = await axios.get(`${API_URL}/top30`, {
      params: {
        page: page,
        per_page: perPage
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw error;
  }
};


export const getCategoriesV2 = async () => {
  // try {
  //   const response = await axios.get(`${API_URL}/v1.1/categories`, {});
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching news:', error);
  //   throw error;
  // }
  return [{ "section": ["national", "elections", "assembly-elections"], "label": "National & Politics", "labelhindi": "राष्ट्रीय और राजनीति", "url": "national-and-politics" }, { "section": ["international"], "label": "International", "labelhindi": "अंतर्राष्ट्रीय", "url": "international" }, { "section": ["business", "economy", "markets", "industry", "budget"], "label": "Business & Economy", "labelhindi": "व्यवसाय और अर्थव्यवस्था", "url": "business-and-economy" }, { "section": ["science", "technology", "sci-tech", "energy-and-environment"], "label": "Science & Technology", "labelhindi": "विज्ञान और तकनीक", "url": "science-and-technology" }, { "section": ["sports", "cricket", "football", "tennis", "olympics", "athletics", "hockey", "motorsport", "races-other-sports"], "label": "Sports", "labelhindi": "खेल", "url": "sports" }, { "section": ["entertainment", "movies", "music", "theatre-dance", "fashion-art", "life-and-style", "travel", "homes-and-gardens", "food-dining"], "label": "Entertainment & Lifestyle", "labelhindi": "मनोरंजन और जीवन शैली", "url": "entertainment-and-lifestyle" }, { "section": ["health", "society", "history-and-culture", "agriculture"], "label": "Health & Society", "labelhindi": "स्वास्थ्य और समाज", "url": "health-and-society" }]

};