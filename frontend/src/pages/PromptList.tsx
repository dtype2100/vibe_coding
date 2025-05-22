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

// 임시 데이터
const prompts = [
  {
    id: 1,
    title: '웹 애플리케이션 개발 프롬프트',
    description: 'React와 Node.js를 사용한 웹 애플리케이션 개발을 위한 프롬프트',
    category: '웹 개발',
    tags: ['React', 'Node.js', '웹 개발'],
  },
  {
    id: 2,
    title: '데이터 분석 프롬프트',
    description: 'Python을 사용한 데이터 분석 및 시각화를 위한 프롬프트',
    category: '데이터 과학',
    tags: ['Python', '데이터 분석', '시각화'],
  },
  {
    id: 3,
    title: '머신러닝 모델 개발 프롬프트',
    description: 'TensorFlow를 사용한 머신러닝 모델 개발을 위한 프롬프트',
    category: 'AI/ML',
    tags: ['TensorFlow', '머신러닝', 'AI'],
  },
];

const PromptList = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        프롬프트 목록
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
        {prompts.map((prompt) => (
          <Box key={prompt.id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  {prompt.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {prompt.description}
                </Typography>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {prompt.category}
                </Typography>
                <div>
                  {prompt.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </div>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  component={RouterLink}
                  to={`/prompts/${prompt.id}`}
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