import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PromptList from './pages/PromptList';
import PromptDetail from './pages/PromptDetail';
import CreatePrompt from './pages/CreatePrompt';

const theme = createTheme({
  palette: {
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
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prompts" element={<PromptList />} />
          <Route path="/prompts/:category/:subCategory" element={<PromptDetail />} />
          <Route path="/create" element={<CreatePrompt />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
