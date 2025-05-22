import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Autocomplete,
  Paper,
  Divider,
} from '@mui/material';
import { prompts } from '../data/prompts';

const categories = Object.keys(prompts);
const subCategories = {
  react: ['component', 'api'],
  dataScience: ['analysis'],
};

const CreatePrompt = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [currentRequirement, setCurrentRequirement] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!category || !subCategory) return;

    const template = prompts[category][subCategory].template;
    const prompt = template
      .replace('{description}', description)
      .replace('{requirements}', requirements.join('\n- '));

    // TODO: API 연동
    console.log(prompt);
    navigate('/prompts');
  };

  const handleAddRequirement = () => {
    if (currentRequirement.trim()) {
      setRequirements([...requirements, currentRequirement.trim()]);
      setCurrentRequirement('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        프롬프트 작성
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Autocomplete
          options={categories}
          value={category}
          onChange={(_, newValue) => {
            setCategory(newValue || '');
            setSubCategory('');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="카테고리"
              required
            />
          )}
          sx={{ mb: 3 }}
        />

        {category && (
          <Autocomplete
            options={subCategories[category as keyof typeof subCategories] || []}
            value={subCategory}
            onChange={(_, newValue) => setSubCategory(newValue || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="하위 카테고리"
                required
              />
            )}
            sx={{ mb: 3 }}
          />
        )}

        {subCategory && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              예시
            </Typography>
            <Typography variant="body1" gutterBottom>
              설명: {prompts[category][subCategory].example.description}
            </Typography>
            <Typography variant="body1" gutterBottom>
              요구사항:
            </Typography>
            <ul>
              {prompts[category][subCategory].example.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </Paper>
        )}

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

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            요구사항
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              label="요구사항 추가"
              value={currentRequirement}
              onChange={(e) => setCurrentRequirement(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRequirement();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddRequirement}
              disabled={!currentRequirement.trim()}
            >
              추가
            </Button>
          </Box>
          {requirements.map((req, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ flex: 1 }}>• {req}</Typography>
              <Button
                size="small"
                color="error"
                onClick={() => handleRemoveRequirement(index)}
              >
                삭제
              </Button>
            </Box>
          ))}
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={!category || !subCategory || !description || requirements.length === 0}
        >
          프롬프트 생성
        </Button>
      </Box>
    </Container>
  );
};

export default CreatePrompt; 