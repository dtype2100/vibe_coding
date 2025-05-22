import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Chip,
  Divider,
} from '@mui/material';

// 임시 데이터
const prompt = {
  id: 1,
  title: '웹 애플리케이션 개발 프롬프트',
  description: 'React와 Node.js를 사용한 웹 애플리케이션 개발을 위한 프롬프트',
  category: '웹 개발',
  tags: ['React', 'Node.js', '웹 개발'],
  content: `당신은 웹 애플리케이션 개발 전문가입니다. React와 Node.js를 사용하여 웹 애플리케이션을 개발하는 데 도움을 주세요.

다음 요구사항을 바탕으로 웹 애플리케이션을 설계하고 구현해주세요:

1. 사용자 인증 시스템
2. 데이터베이스 연동
3. RESTful API 설계
4. 반응형 UI 구현

각 단계별로 상세한 설명과 코드 예시를 제공해주세요.`,
  author: '개발자1',
  createdAt: '2024-03-15',
};

const PromptDetail = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {prompt.title}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            {prompt.category}
          </Typography>
          <Box sx={{ mb: 2 }}>
            {prompt.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{ mr: 1 }}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body1" paragraph>
          {prompt.description}
        </Typography>

        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {prompt.content}
          </Typography>
        </Paper>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            작성자: {prompt.author}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            작성일: {prompt.createdAt}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PromptDetail; 