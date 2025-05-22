import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Autocomplete,
} from '@mui/material';

const categories = ['웹 개발', '데이터 과학', 'AI/ML', '모바일 개발', '게임 개발'];
const tagOptions = ['React', 'Node.js', 'Python', 'TensorFlow', '웹 개발', '데이터 분석', '시각화', '머신러닝', 'AI'];

const CreatePrompt = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: API 연동
    console.log({ title, description, category, tags, content });
    navigate('/prompts');
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        프롬프트 작성
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <TextField
          fullWidth
          label="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="설명"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          required
          sx={{ mb: 3 }}
        />

        <Autocomplete
          options={categories}
          value={category}
          onChange={(_, newValue) => setCategory(newValue || '')}
          renderInput={(params) => (
            <TextField
              {...params}
              label="카테고리"
              required
            />
          )}
          sx={{ mb: 3 }}
        />

        <Autocomplete
          multiple
          options={tagOptions}
          value={tags}
          onChange={(_, newValue) => setTags(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="태그"
              placeholder="태그를 선택하세요"
            />
          )}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="프롬프트 내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          multiline
          rows={10}
          required
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
        >
          작성하기
        </Button>
      </Box>
    </Container>
  );
};

export default CreatePrompt; 