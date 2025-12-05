import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, Autocomplete, Box, Typography, Avatar } from '@mui/material';
import { Search, TrendingUp } from '@mui/icons-material';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchContent();
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const searchContent = async () => {
    setLoading(true);
    try {
      const results = [];
      
      // Search posts
      const postsQuery = query(
        collection(db, 'posts'),
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff'),
        limit(5)
      );
      const postsSnapshot = await getDocs(postsQuery);
      postsSnapshot.docs.forEach(doc => {
        results.push({
          id: doc.id,
          type: 'post',
          title: doc.data().title,
          subtitle: doc.data().authorName,
          path: `/post/${doc.id}`
        });
      });

      // Search users
      const usersQuery = query(
        collection(db, 'users'),
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        limit(3)
      );
      const usersSnapshot = await getDocs(usersQuery);
      usersSnapshot.docs.forEach(doc => {
        results.push({
          id: doc.id,
          type: 'user',
          title: doc.data().displayName,
          subtitle: `Uy tín: ${doc.data().reputation || 0}`,
          path: `/profile/${doc.id}`
        });
      });

      setSuggestions(results);
    } catch (error) {
      console.error('Search error:', error);
    }
    setLoading(false);
  };

  const handleSelect = (option) => {
    if (option) {
      navigate(option.path);
      setSearchTerm('');
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={suggestions}
      loading={loading}
      getOptionLabel={(option) => typeof option === 'string' ? option : option.title}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Avatar sx={{ mr: 2, bgcolor: option.type === 'post' ? 'primary.main' : 'secondary.main' }}>
            {option.type === 'post' ? <TrendingUp /> : option.title.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2">{option.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {option.subtitle}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Tìm kiếm bài viết, người dùng..."
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
      )}
      onInputChange={(e, value) => setSearchTerm(value)}
      onChange={(e, value) => handleSelect(value)}
    />
  );
};

export default SearchBar;