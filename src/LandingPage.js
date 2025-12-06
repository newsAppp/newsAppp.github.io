import * as React from 'react';
import PropTypes from 'prop-types';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AppAppBar from './components/AppAppBar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import NotificationPrompt from './components/NotificationPrompt';
import CategoryChipBar from './components/CategoryChipBar';
import getLPTheme from './getLPTheme';

function ToggleCustomTheme({ showCustomTheme, toggleCustomTheme }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100dvw',
        position: 'fixed',
        bottom: 24,
      }}
    >
      <ToggleButtonGroup
        color="primary"
        exclusive
        value={showCustomTheme}
        onChange={toggleCustomTheme}
        aria-label="Platform"
        sx={{
          backgroundColor: 'background.default',
          '& .Mui-selected': {
            pointerEvents: 'none',
          },
        }}
      >
        <ToggleButton value>
          <AutoAwesomeRoundedIcon sx={{ fontSize: '20px', mr: 1 }} />
          Custom theme
        </ToggleButton>
        <ToggleButton value={false}>Material Design 2</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

ToggleCustomTheme.propTypes = {
  showCustomTheme: PropTypes.shape({
    valueOf: PropTypes.func.isRequired,
  }).isRequired,
  toggleCustomTheme: PropTypes.func.isRequired,
};

export default function LandingPage() {
  const [mode, setMode] = React.useState('light');
  const [showCustomTheme, setShowCustomTheme] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState([]);
  const [isHindi, setIsHindi] = React.useState(false);
  const [feedType, setFeedType] = React.useState('all'); // 'all' or 'foryou'

  const categories = [
    { "section": ["national", "elections", "assembly-elections"], "label": "National & Politics", "labelhindi": "राष्ट्रीय और राजनीति" },
    { "section": ["international"], "label": "International", "labelhindi": "अंतर्राष्ट्रीय" },
    { "section": ["business", "economy", "markets", "industry", "budget"], "label": "Business & Economy", "labelhindi": "व्यवसाय और अर्थव्यवस्था" },
    { "section": ["science", "technology", "sci-tech", "energy-and-environment"], "label": "Science & Technology", "labelhindi": "विज्ञान और तकनीक" },
    { "section": ["sports", "cricket", "football", "tennis", "olympics", "athletics", "hockey", "motorsport", "races-other-sports"], "label": "Sports", "labelhindi": "खेल" },
    { "section": ["entertainment", "movies", "music", "theatre-dance", "fashion-art", "life-and-style", "travel", "homes-and-gardens", "food-dining"], "label": "Entertainment & Lifestyle", "labelhindi": "मनोरंजन और जीवन शैली" },
    { "section": ["health", "society", "history-and-culture", "agriculture"], "label": "Health & Society", "labelhindi": "स्वास्थ्य और समाज" }
  ];

  const LPtheme = createTheme(getLPTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });

  const toggleColorMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleCustomTheme = () => {
    setShowCustomTheme((prev) => !prev);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setFeedType('all'); // Reset to all when category changes
  };

  const handleFeedTypeChange = (type) => {
    setFeedType(type);
    if (type === 'foryou') {
      setSelectedCategory([]); // Clear category selection for personalized feed
    }
  };

  return (
    <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
      <CssBaseline />
      <AppAppBar
        mode={mode}
        toggleColorMode={toggleColorMode}
        handleCategoryChange={handleCategoryChange}
        isHindi={isHindi}
        setIsHindi={setIsHindi}
      />

      {/* Add spacing for fixed AppBar */}
      <Box sx={{ height: '80px' }} />

      <CategoryChipBar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        isHindi={isHindi}
        feedType={feedType}
        onFeedTypeChange={handleFeedTypeChange}
      />
      <Hero
        selectedCategory={selectedCategory}
        isHindi={isHindi}
        feedType={feedType}
      />
      <NotificationPrompt />
      <Footer />
    </ThemeProvider>
  );
}
