import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import { prompts } from '../data/prompts';

const PromptDetail = () => {
  const { category, subCategory } = useParams<{ category: string; subCategory: string }>();
  const navigate = useNavigate();

  if (!category || !subCategory || !prompts[category]?.[subCategory]) {
    return (
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
          프롬프트를 찾을 수 없습니다
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

  const prompt = prompts[category][subCategory];

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/prompts')}
          sx={{ mb: 2 }}
        >
          ← 목록으로
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          {category === 'react' ? 'React' : '데이터 과학'} - {subCategory === 'component' ? '컴포넌트' : subCategory === 'api' ? 'API' : '분석'} 프롬프트
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          템플릿
        </Typography>
        <Box
          component="pre"
          sx={{
            p: 2,
            bgcolor: 'grey.100',
            borderRadius: 1,
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
          }}
        >
          {prompt.template}
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          예시
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            설명:
          </Typography>
          <Typography variant="body1" paragraph>
            {prompt.example.description}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            요구사항:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {prompt.example.requirements.map((req, index) => (
              <Chip
                key={index}
                label={req}
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/create')}
        >
          이 템플릿으로 프롬프트 작성하기
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/prompts')}
        >
          목록으로 돌아가기
        </Button>
      </Box>
    </Container>
  );
};

export default PromptDetail; 