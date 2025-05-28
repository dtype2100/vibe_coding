import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Autocomplete,
  Paper, // Keep Paper for grouping if desired
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  CircularProgress,
  Alert
} from '@mui/material';
import { createPrompt, getAllCategories, Category as CategoryType, Prompt } from '../services/api';
import { useLocation } from 'react-router-dom';

const CreatePrompt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { initialTitle?: string; initialContent?: string } | undefined;

  const [title, setTitle] = useState<string>(state?.initialTitle || '');
  const [description, setDescription] = useState<string>(''); // Optional field
  const [content, setContent] = useState<string>(state?.initialContent || '');
  const [categoryId, setCategoryId] = useState<string>(''); // Store as string for Select, convert to number on submit
  const [tagsInput, setTagsInput] = useState<string>(''); // Comma-separated tags

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
        setError('카테고리 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);
  
  // Clear messages when form inputs change
  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
  }, [title, description, content, categoryId, tagsInput]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!title.trim() || !content.trim() || !categoryId) {
      setError('제목, 내용, 카테고리는 필수 항목입니다.');
      return;
    }

    setSubmitting(true);
    const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);

    try {
      const payload = {
        title,
        description: description.trim() || undefined, // Send undefined if empty, matching backend
        content,
        category_id: Number(categoryId),
        tags: tagsArray,
      };
      const newPrompt: Prompt = await createPrompt(payload);
      setSuccessMessage(`프롬프트 "${newPrompt.title}"가 성공적으로 생성되었습니다!`);
      // Reset form or navigate
      setTitle('');
      setDescription('');
      setContent('');
      setCategoryId('');
      setTagsInput('');
      
      // Navigate to the new prompt's detail page after a short delay
      setTimeout(() => {
        navigate(`/prompts/${newPrompt.id}`);
      }, 1500);

    } catch (err: any) {
      console.error('Failed to create prompt:', err);
      setError(err.response?.data?.error || err.message || '프롬프트 생성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4, mb: 3 }}>
        새 프롬프트 작성
      </Typography>

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 3 } }}>
        <TextField
          fullWidth
          label="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          sx={{ mb: 3 }}
          disabled={submitting}
        />

        <FormControl fullWidth sx={{ mb: 3 }} required disabled={loadingCategories || submitting}>
          <InputLabel id="category-select-label">카테고리</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={categoryId}
            label="카테고리"
            onChange={(e) => setCategoryId(e.target.value as string)}
          >
            {loadingCategories ? (
              <MenuItem value="" disabled><em>로딩 중...</em></MenuItem>
            ) : categories.length === 0 ? (
              <MenuItem value="" disabled><em>카테고리를 찾을 수 없습니다.</em></MenuItem>
            ) : (
              categories.map((cat) => (
                <MenuItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </MenuItem>
              ))
            )}
          </Select>
          {!loadingCategories && categories.length === 0 && <FormHelperText error>카테고리 로딩 실패 또는 없음</FormHelperText>}
        </FormControl>

        <TextField
          fullWidth
          label="설명 (선택 사항)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          sx={{ mb: 3 }}
          disabled={submitting}
        />

        <TextField
          fullWidth
          label="프롬프트 내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          multiline
          rows={6}
          required
          sx={{ mb: 3 }}
          disabled={submitting}
          InputProps={{
            sx: {
              fontFamily: 'monospace', // Good for code/templates
            },
          }}
        />

        <TextField
          fullWidth
          label="태그 (쉼표로 구분)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          helperText="예: react, typescript, api"
          sx={{ mb: 3 }}
          disabled={submitting}
        />
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={submitting || loadingCategories || !title.trim() || !content.trim() || !categoryId}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {submitting ? '생성 중...' : '프롬프트 생성'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreatePrompt; 