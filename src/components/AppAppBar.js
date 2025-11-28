import * as React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import ToggleColorMode from './ToggleColorMode';
import AppMenus from './AppMenus'; // Import the new component
import { Badge, Divider, Typography } from '@mui/material';
import { Bookmark } from '@mui/icons-material';
import { getCategoriesV2 } from '../api';
import { getBookmarkCount } from '../utils/bookmarkUtils';
import { Link } from 'react-router-dom';

const logoStyle = {
  width: '140px',
  height: 'auto',
  cursor: 'pointer',
};

function AppAppBar({ mode, toggleColorMode, handleCategoryChange, isHindi, setIsHindi }) {
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [bookmarkCount, setBookmarkCount] = React.useState(0);
  const isMenuOpen = Boolean(anchorEl);
  const categories =
    [{ "section": ["national", "elections", "assembly-elections"], "label": "National & Politics", "labelhindi": "राष्ट्रीय और राजनीति", "url": "national-and-politics" }, { "section": ["international"], "label": "International", "labelhindi": "अंतर्राष्ट्रीय", "url": "international" }, { "section": ["business", "economy", "markets", "industry", "budget"], "label": "Business & Economy", "labelhindi": "व्यवसाय और अर्थव्यवस्था", "url": "business-and-economy" }, { "section": ["science", "technology", "sci-tech", "energy-and-environment"], "label": "Science & Technology", "labelhindi": "विज्ञान और तकनीक", "url": "science-and-technology" }, { "section": ["sports", "cricket", "football", "tennis", "olympics", "athletics", "hockey", "motorsport", "races-other-sports"], "label": "Sports", "labelhindi": "खेल", "url": "sports" }, { "section": ["entertainment", "movies", "music", "theatre-dance", "fashion-art", "life-and-style", "travel", "homes-and-gardens", "food-dining"], "label": "Entertainment & Lifestyle", "labelhindi": "मनोरंजन और जीवन शैली", "url": "entertainment-and-lifestyle" }, { "section": ["health", "society", "history-and-culture", "agriculture"], "label": "Health & Society", "labelhindi": "स्वास्थ्य और समाज", "url": "health-and-society" }]

    ;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const scrollToSection = (sectionId) => {
    handleCategoryChange(sectionId);
    const sectionElement = document.getElementById(sectionId);
    const offset = 128;
    if (sectionElement) {
      const targetScroll = sectionElement.offsetTop - offset;
      sectionElement.scrollIntoView({ behavior: 'smooth' });
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
      setOpen(false);
    }
  };

  // Update bookmark count
  React.useEffect(() => {
    const updateCount = () => setBookmarkCount(getBookmarkCount());
    updateCount();
    const interval = setInterval(updateCount, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <AppBar
        position="fixed"
        sx={{
          boxShadow: 0,
          bgcolor: 'transparent',
          backgroundImage: 'none',
          mt: 2,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            variant="regular"
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              borderRadius: '999px',
              bgcolor:
                theme.palette.mode === 'light'
                  ? 'rgba(255, 255, 255, 0.4)'
                  : 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(24px)',
              maxHeight: 40,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow:
                theme.palette.mode === 'light'
                  ? `0 0 1px rgba(85, 166, 246, 0.1), 1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)`
                  : '0 0 1px rgba(2, 31, 59, 0.7), 1px 1.5px 2px -1px rgba(2, 31, 59, 0.65), 4px 4px 12px -2.5px rgba(2, 31, 59, 0.65)',
            })}
          >
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                ml: '-18px',
                px: 0,
              }}
            >
              <img
                src={'/logo/vector/default.svg'}
                style={logoStyle}
                alt="logo of sitemark"
              />
              <AppMenus
                menuItems={categories}
                scrollToSection={scrollToSection}
                handleMenuOpen={handleMenuOpen}
                handleMenuClose={handleMenuClose}
                anchorEl={anchorEl}
                isMenuOpen={isMenuOpen}
                isHindi={isHindi}
              />
            </Box>
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                gap: 0.5,
                alignItems: 'center',
              }}
            >
              <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />
              <Button
                variant="text"
                color="primary"
                size="small"
                onClick={() => setIsHindi(true)}
                sx={{ minWidth: '30px', p: '4px' }}
              >
                हिंदी
              </Button>
              <Button
              >
                English
              </Button>
              <Link
                to="/contact-us"
                style={{ textDecoration: 'none' }}
              >
                <Button
                  variant="text"
                  color="primary"
                  size="small"
                  sx={{ minWidth: '30px', p: '4px' }}
                >
                  | Contact Us
                </Button>
              </Link>
              {/* <Button
                color="primary"
                variant="text"
                size="small"
                component="a"
                href="/material-ui/getting-started/templates/sign-in/"
                target="_blank"
              >
                Sign in
              </Button>
              <Button
                color="primary"
                variant="contained"
                size="small"
                component="a"
                href="/material-ui/getting-started/templates/sign-up/"
                target="_blank"
              >
                Sign up
              </Button> */}
            </Box>
            <Box sx={{ display: { sm: '', md: 'none' } }}>
              <Button
                variant="text"
                color="primary"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ minWidth: '30px', p: '4px' }}
              >
                <MenuIcon />
              </Button>
              <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
                <Box
                  sx={{
                    minWidth: '60dvw',
                    p: 2,
                    backgroundColor: 'background.paper',
                    flexGrow: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'end',
                      flexGrow: 1,
                    }}
                  >
                    <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />
                  </Box>
                  <Box marginY={1}>
                    <Button
                      variant="text"
                      color="primary"
                      size="small"
                      onClick={() => setIsHindi(true)}
                      sx={{ minWidth: '30px', p: '4px' }}
                    >
                      हिंदी
                    </Button>
                    <Button
                      variant="text"
                      color="primary"
                      size="small"
                      onClick={() => setIsHindi(false)}
                      sx={{ minWidth: '30px', p: '4px' }}
                    >
                      English
                    </Button>

                    <Link
                      to="/contact-us"
                      style={{ textDecoration: 'none' }}
                    >
                      <Button
                        variant="text"
                        color="primary"
                        size="small"
                        sx={{ minWidth: '30px', p: '4px' }}
                      >
                        | Contact Us
                      </Button>
                    </Link>
                  </Box>
                  <Divider />
                  {/* Bookmarks Option */}
                  <MenuItem
                    onClick={() => scrollToSection('bookmarks')}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 1.5
                    }}
                  >
                    <Badge badgeContent={bookmarkCount} color="primary">
                      <Bookmark color="primary" />
                    </Badge>
                    <Typography variant="body1">
                      {isHindi ? 'बुकमार्क' : 'Bookmarks'}
                    </Typography>
                  </MenuItem>
                  <Divider />
                  {categories.map((item, i) => (
                    <MenuItem key={i} onClick={() => scrollToSection(item.section)}>
                      {isHindi ? item.labelhindi : item.label}
                    </MenuItem>
                  ))}
                  {/* <Divider />
                  <MenuItem>
                    <Button
                      color="primary"
                      variant="contained"
                      component="a"
                      href="/material-ui/getting-started/templates/sign-up/"
                      target="_blank"
                      sx={{ width: '100%' }}
                    >
                      Sign up
                    </Button>
                  </MenuItem>
                  <MenuItem>
                    <Button
                      color="primary"
                      variant="outlined"
                      component="a"
                      href="/material-ui/getting-started/templates/sign-in/"
                      target="_blank"
                      sx={{ width: '100%' }}
                    >
                      Sign in
                    </Button>
                  </MenuItem> */}
                </Box>
              </Drawer>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
}

AppAppBar.propTypes = {
  mode: PropTypes.oneOf(['dark', 'light']).isRequired,
  toggleColorMode: PropTypes.func.isRequired,
};

export default AppAppBar;
