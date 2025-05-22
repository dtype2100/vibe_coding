import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <CodeIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          바이브 코딩 프롬프트 가이드
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/">
            홈
          </Button>
          <Button color="inherit" component={RouterLink} to="/prompts">
            프롬프트 목록
          </Button>
          <Button color="inherit" component={RouterLink} to="/create">
            새 프롬프트 작성
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 