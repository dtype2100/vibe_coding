import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
} from '@mui/material';
import { getAllPrompts, Prompt, Tag } from '../services/api'; // Updated import
import { useEffect, useState } from 'react'; // Added imports

const PromptList = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        const data = await getAllPrompts();
        setPrompts(data);
        setError(null);
      } catch (err) {
        setError('프롬프트를 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">로딩 중...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Container>
    );
  }

  if (prompts.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">등록된 프롬프트가 없습니다.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        프롬프트 목록
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
        {prompts.map((prompt) => (
          <Box key={prompt.id}> {/* Use prompt.id as key */}
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {prompt.title}
                </Typography>
                {prompt.category_name && (
                  <Chip label={prompt.category_name} size="small" sx={{ mb: 1 }} />
                )}
                <Typography variant="body2" color="text.secondary" paragraph sx={{
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minHeight: '60px' // Approx 3 lines
                }}>
                  {prompt.description || '설명이 없습니다.'} 
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {prompt.tags && prompt.tags.map((tag: Tag) => ( // Ensure tags is an array of Tag
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  component={RouterLink}
                  to={`/prompts/${prompt.id}`} {/* Updated link to use prompt.id */}
                >
                  자세히 보기
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default PromptList; 