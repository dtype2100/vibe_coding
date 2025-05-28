import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  // Divider, // No longer explicitly used, Paper provides separation
} from '@mui/material';
import { getPromptById, Prompt as PromptType, Tag } from '../services/api'; // Renamed Prompt to PromptType to avoid conflict
import { useEffect, useState } from 'react';

const PromptDetail = () => {
  const { id } = useParams<{ id: string }>(); // Expect 'id' from URL
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<PromptType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchPromptDetail = async () => {
        try {
          setLoading(true);
          const data = await getPromptById(id);
          setPrompt(data);
          setError(null);
        } catch (err: any) {
          if (err.response && err.response.status === 404) {
            setError('프롬프트를 찾을 수 없습니다.');
          } else {
            setError('프롬프트를 불러오는 중 오류가 발생했습니다.');
          }
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchPromptDetail();
    } else {
      setError('잘못된 프롬프트 ID입니다.');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">로딩 중...</Typography>
      </Container>
    );
  }

  if (error || !prompt) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="error">
          {error || '프롬프트를 찾을 수 없습니다.'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/prompts')}
          sx={{ mt: 2 }}
        >
          목록으로 돌아가기
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/prompts')}
          sx={{ mb: 2 }}
        >
          ← 목록으로
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          {prompt.title}
        </Typography>
        {prompt.category_name && (
          <Chip label={prompt.category_name} color="primary" sx={{ mb: 2 }} />
        )}
      </Box>

      {prompt.description && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            설명
          </Typography>
          <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
            {prompt.description}
          </Typography>
        </Paper>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          프롬프트 내용
        </Typography>
        <Box
          component="pre"
          sx={{
            p: 2,
            bgcolor: 'grey.100',
            borderRadius: 1,
            whiteSpace: 'pre-wrap', // Ensures content wraps and preserves newlines/spaces
            fontFamily: 'monospace',
            overflowX: 'auto', // Add scroll for long lines if necessary
          }}
        >
          {prompt.content}
        </Box>
      </Paper>
      
      {prompt.tags && prompt.tags.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            관련 태그
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {prompt.tags.map((tag: Tag) => (
              <Chip
                key={tag.id}
                label={tag.name}
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 4 }}>
        {/* This button can be enhanced later to pass template content to create page if needed */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/create', { state: { initialContent: prompt.content, initialTitle: prompt.title } })}
        >
          이 내용으로 새 프롬프트 작성
        </Button>
      </Box>
    </Container>
  );
};

export default PromptDetail; 