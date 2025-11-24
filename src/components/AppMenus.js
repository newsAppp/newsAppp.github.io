import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function AppMenus({ menuItems, scrollToSection, handleMenuOpen, handleMenuClose, anchorEl, isMenuOpen, isHindi }) {
  const MAX_ITEMS = 3;
  const menuItems2 = [  { "section": ["national", "elections", "assembly-elections"], "label": "National & Politics", "labelhindi": "राष्ट्रीय और राजनीति", "url": "national-and-politics" }, { "section": ["international"], "label": "International",  "labelhindi": "अंतर्राष्ट्रीय", "url": "international"  }, { "section": ["business", "economy", "markets", "industry", "budget"], "label": "Business & Economy", "labelhindi": "व्यवसाय और अर्थव्यवस्था", "url": "business-and-economy" }, { "section": ["science", "technology", "sci-tech", "energy-and-environment"], "label": "Science & Technology", "labelhindi": "विज्ञान और तकनीक", "url": "science-and-technology"   }, { "section": ["sports", "cricket", "football", "tennis", "olympics", "athletics", "hockey", "motorsport", "races-other-sports"], "label": "Sports", "labelhindi": "खेल", "url": "sports"   }, { "section": ["entertainment", "movies", "music", "theatre-dance", "fashion-art", "life-and-style", "travel", "homes-and-gardens", "food-dining"], "label": "Entertainment & Lifestyle", "labelhindi": "मनोरंजन और जीवन शैली", "url": "entertainment-and-lifestyle" }, { "section": ["health", "society", "history-and-culture", "agriculture"], "label": "Health & Society", "labelhindi": "स्वास्थ्य और समाज", "url": "health-and-society" } ]


  const mainItems = menuItems2.slice(0, MAX_ITEMS);
  const moreItems = menuItems2.slice(MAX_ITEMS);

  return (
    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
      {mainItems.map((item, index) => (
        <MenuItem
          key={index}
          onClick={() => {
            scrollToSection(item.section)
          }}
          sx={{ py: '6px', px: '12px' }}
        >
          <Typography variant="body2" color="text.primary">
            {isHindi ? item.labelhindi : item.label}
          </Typography>
        </MenuItem>
      ))}
      {moreItems.length > 0 && (
        <MenuItem onClick={handleMenuOpen} sx={{ py: '6px', px: '12px' }}>
          <Typography variant="body2" color="text.primary">
            { isHindi ? 'अन्य' : 'More' }
          </Typography>
          <ExpandMoreIcon />
        </MenuItem>
      )}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            maxHeight: 48 * 4.5,
            width: '20ch',
            borderRadius: '8px',
            boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.1)',
          },
        }}
        MenuListProps={{
          sx: {
            padding: 0,
          },
        }}
      >
        {moreItems.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              scrollToSection(item.section);
              handleMenuClose();
            }}
            sx={{ py: '6px', px: '12px' }}
          >
            <Typography variant="body2" color="text.primary">{isHindi ? item.labelHindi : item.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

AppMenus.propTypes = {
  menuItems: PropTypes.array.isRequired,
  scrollToSection: PropTypes.func.isRequired,
  handleMenuOpen: PropTypes.func.isRequired,
  handleMenuClose: PropTypes.func.isRequired,
  anchorEl: PropTypes.object,
  isMenuOpen: PropTypes.bool.isRequired,
  isHindi: PropTypes.bool,
};

export default AppMenus;
