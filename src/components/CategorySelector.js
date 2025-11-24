// src/components/CategorySelector.js
import React from 'react';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const categories = ['All', 'Technology', 'Business', 'Entertainment', 'Sports'];

const CategorySelector = ({ selectedCategory, onCategoryChange }) => {
  return (
    <FormControl fullWidth >
      {/* <InputLabel>Category</InputLabel> */}
      <Select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        {categories.map((category, i) => (
          <MenuItem key={i} value={category}>
            {category}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CategorySelector;
