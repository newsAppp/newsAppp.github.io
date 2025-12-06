// Horizontal scrollable chip bar for category selection

import React from 'react';
import { Box, Chip } from '@mui/material';
import { Favorite } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const CategoryChipBar = ({ categories, selectedCategory, onCategoryChange, isHindi, feedType, onFeedTypeChange }) => {
    const { isAuthenticated } = useAuth();

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
                overflowX: 'auto',
                overflowY: 'hidden',
                py: 1.5,
                px: 2,
                '&::-webkit-scrollbar': {
                    height: '6px',
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '10px',
                    '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.3)',
                    },
                },
                // Hide scrollbar for Firefox
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,0,0,0.2) rgba(0,0,0,0.05)',
            }}
        >
            {/* For You Chip (only for authenticated users) */}
            {isAuthenticated && (
                <Chip
                    icon={<Favorite />}
                    label={isHindi ? 'आपके लिए' : 'For You'}
                    onClick={() => onFeedTypeChange && onFeedTypeChange('foryou')}
                    color={feedType === 'foryou' ? 'primary' : 'default'}
                    variant={feedType === 'foryou' ? 'filled' : 'outlined'}
                    sx={{
                        fontWeight: feedType === 'foryou' ? 'bold' : 'normal',
                        transition: 'all 0.3s',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        },
                    }}
                />
            )}

            {/* All Categories Chip */}
            <Chip
                label={isHindi ? 'सभी' : 'All'}
                onClick={() => onCategoryChange([])}
                color={(!selectedCategory || selectedCategory.length === 0) && feedType !== 'foryou' ? 'primary' : 'default'}
                variant={(!selectedCategory || selectedCategory.length === 0) && feedType !== 'foryou' ? 'filled' : 'outlined'}
                sx={{
                    fontWeight: (!selectedCategory || selectedCategory.length === 0) && feedType !== 'foryou' ? 'bold' : 'normal',
                    transition: 'all 0.3s',
                    '&:hover': {
                        transform: 'scale(1.05)',
                    },
                }}
            />

            {/* Category Chips */}
            {categories.map((category, index) => {
                const isSelected = selectedCategory?.some(cat =>
                    category.section.includes(cat)
                ) && feedType !== 'foryou';

                return (
                    <Chip
                        key={index}
                        label={isHindi ? category.labelhindi : category.label}
                        onClick={() => onCategoryChange(category.section)}
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        sx={{
                            fontWeight: isSelected ? 'bold' : 'normal',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s',
                            '&:hover': {
                                transform: 'scale(1.05)',
                            },
                        }}
                    />
                );
            })}
        </Box>
    );
};

export default CategoryChipBar;
