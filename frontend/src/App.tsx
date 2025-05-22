import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PromptList from './pages/PromptList';
import PromptDetail from './pages/PromptDetail';
import CreatePrompt from './pages/CreatePrompt';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/prompts" element={<PromptList />} />
              <Route path="/prompts/:id" element={<PromptDetail />} />
              <Route path="/create" element={<CreatePrompt />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
