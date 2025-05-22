import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';

const Home = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mt: 4 }}>
        바이브 코딩 프롬프트 가이드
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom align="center" color="text.secondary" sx={{ mb: 6 }}>
        효과적인 프롬프트 작성과 공유를 위한 플랫폼
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                프롬프트 템플릿
              </Typography>
              <Typography variant="body1" color="text.secondary">
                다양한 상황에 맞는 프롬프트 템플릿을 제공합니다.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={RouterLink} to="/prompts">
                템플릿 보기
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                프롬프트 공유
              </Typography>
              <Typography variant="body1" color="text.secondary">
                자신만의 프롬프트를 작성하고 공유하세요.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={RouterLink} to="/create">
                프롬프트 작성
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                커뮤니티
              </Typography>
              <Typography variant="body1" color="text.secondary">
                다른 개발자들과 프롬프트 작성 경험을 공유하세요.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={RouterLink} to="/prompts">
                커뮤니티 참여
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 