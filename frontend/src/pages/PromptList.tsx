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
import { prompts } from '../data/prompts';

const dataScienceLabelMap: { [key: string]: string } = {
  analysis: '분석',
  visualization: '시각화',
  preprocessing: '전처리',
  forecasting: '시계열 예측',
  clustering: '클러스터링',
  regression: '회귀 분석',
};

const PromptList = () => {
  const promptList = Object.entries(prompts).flatMap(([category, subCategories]) =>
    Object.entries(subCategories).map(([subCategory, prompt]) => ({
      category,
      subCategory,
      ...prompt,
    }))
  );

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        프롬프트 목록
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
        {promptList.map((prompt) => (
          <Box key={`${prompt.category}-${prompt.subCategory}`}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  {prompt.category === 'react' && (
                    <>React - {prompt.subCategory === 'component' ? '컴포넌트' : prompt.subCategory === 'api' ? 'API' : prompt.subCategory === 'form' ? '폼' : prompt.subCategory === 'table' ? '테이블' : prompt.subCategory}</>
                  )}
                  {prompt.category === 'dataScience' && (
                    <>데이터 과학 - {dataScienceLabelMap[prompt.subCategory] || prompt.subCategory}</>
                  )}
                  {prompt.category === 'ai' && (
                    <>AI - {prompt.subCategory === 'classification' ? '분류' : prompt.subCategory === 'nlp' ? '자연어 처리' : prompt.subCategory === 'recommendation' ? '추천 시스템' : prompt.subCategory}</>
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {prompt.example.description}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {prompt.example.requirements.map((req, index) => (
                    <Chip
                      key={index}
                      label={req}
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
                  to={`/prompts/${prompt.category}/${prompt.subCategory}`}
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