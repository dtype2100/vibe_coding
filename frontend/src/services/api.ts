import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Define a basic Prompt type based on expected API response
// This should be expanded and moved to a dedicated types file later
export interface Tag {
  id: number;
  name: string;
}

export interface Prompt {
  id: number;
  title: string;
  description?: string;
  content: string;
  category_id: number;
  category_name?: string; // From JOIN in backend
  user_id?: number | null;
  created_at: string;
  updated_at: string;
  tags: Tag[]; // Array of Tag objects
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

// Type for the payload when creating a new prompt
export interface CreatePromptPayload {
  title: string;
  description?: string; // Optional
  content: string;
  category_id: number;
  user_id?: number | null; // Optional, backend defaults to null
  tags?: string[]; // Array of tag names or IDs (backend handles resolution)
}

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Prompt related API calls
export const getAllPrompts = async (): Promise<Prompt[]> => {
  try {
    const response = await apiClient.get('/prompts');
    return response.data;
  } catch (error) {
    console.error('Error fetching all prompts:', error);
    throw error;
  }
};

export const getPromptById = async (id: number | string): Promise<Prompt> => {
  try {
    const response = await apiClient.get(`/prompts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching prompt with id ${id}:`, error);
    throw error;
  }
};

// createPrompt data type would need to be defined based on backend expectations
// For example: interface CreatePromptData { title: string; content: string; category_id: number; tags?: (number | string)[]; ... }
export const createPrompt = async (promptData: CreatePromptPayload): Promise<Prompt> => {
  try {
    const response = await apiClient.post('/prompts', promptData);
    return response.data;
  } catch (error) {
    console.error('Error creating prompt:', error);
    throw error;
  }
};

// Category related API calls
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching all categories:', error);
    throw error;
  }
};

// Tag related API calls
export const getAllTags = async (): Promise<Tag[]> => {
  try {
    const response = await apiClient.get('/tags');
    return response.data;
  } catch (error)
    {
    console.error('Error fetching all tags:', error);
    throw error;
  }
};
