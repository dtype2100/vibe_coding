import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import PromptDetail from './PromptDetail';
import { getPromptById } from '../services/api';
import type { Prompt, Tag, Category } from '../services/api';

// Mock the API service
jest.mock('../services/api');

// Mock react-router-dom hooks
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Preserve other exports
  useNavigate: () => mockedNavigate,
  useParams: jest.fn(), // Will be mocked per test for specific params
}));


// Type assertion for the mocked function
const mockedGetPromptById = getPromptById as jest.MockedFunction<typeof getPromptById>;

const mockPromptData: Prompt = {
  id: 1,
  title: 'Detailed Prompt Title',
  description: 'This is a detailed description.',
  content: 'This is the main content of the prompt.',
  category_id: 1,
  category_name: 'Awesome Category',
  user_id: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tags: [
    { id: 1, name: 'TagDetail1' },
    { id: 2, name: 'TagDetail2' },
  ],
};

const renderComponent = (promptId: string) => {
  // Mock useParams for each render with the specific ID
  (jest.requireMock('react-router-dom').useParams as jest.Mock).mockReturnValue({ id: promptId });
  
  return render(
    <MemoryRouter initialEntries={[`/prompts/${promptId}`]}>
      <Routes>
        <Route path="/prompts/:id" element={<PromptDetail />} />
        {/* Add a dummy route for create page if needed for navigation testing */}
        <Route path="/create" element={<div>Create Page</div>} /> 
      </Routes>
    </MemoryRouter>
  );
};

describe('PromptDetail Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('displays loading state initially', () => {
    mockedGetPromptById.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    renderComponent('1');
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  test('displays prompt details when data is loaded successfully', async () => {
    mockedGetPromptById.mockResolvedValueOnce(mockPromptData);
    renderComponent('1');

    await waitFor(() => expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument());

    expect(screen.getByText(mockPromptData.title)).toBeInTheDocument();
    expect(screen.getByText(mockPromptData.description!)).toBeInTheDocument(); // Assuming description is present
    expect(screen.getByText(mockPromptData.content)).toBeInTheDocument();
    expect(screen.getByText(mockPromptData.category_name!)).toBeInTheDocument(); // Assuming category_name is present
    
    mockPromptData.tags.forEach(tag => {
      expect(screen.getByText(tag.name)).toBeInTheDocument();
    });
  });

  test('displays "Prompt not found" message for 404 error', async () => {
    mockedGetPromptById.mockRejectedValueOnce({ response: { status: 404 } });
    renderComponent('999');

    await waitFor(() => {
      expect(screen.getByText('프롬프트를 찾을 수 없습니다.')).toBeInTheDocument();
    });
  });

  test('displays generic error message for other data load failures', async () => {
    mockedGetPromptById.mockRejectedValueOnce(new Error('Some API error'));
    renderComponent('1');

    await waitFor(() => {
      expect(screen.getByText('프롬프트를 불러오는 중 오류가 발생했습니다.')).toBeInTheDocument();
    });
  });
  
  test('displays error if ID is not provided or invalid (e.g. if useParams was not mocked correctly)', async () => {
    // This test simulates a scenario where the ID might be missing from params
    (jest.requireMock('react-router-dom').useParams as jest.Mock).mockReturnValue({ id: undefined });
    render( // Render without initialEntries matching the path, or with undefined ID
        <MemoryRouter initialEntries={[`/prompts/undefined`]}> 
            <Routes>
                <Route path="/prompts/:id" element={<PromptDetail />} />
            </Routes>
        </MemoryRouter>
    );
    await waitFor(() => {
        // Based on PromptDetail's useEffect, if id is undefined, it sets an error.
        expect(screen.getByText('잘못된 프롬프트 ID입니다.')).toBeInTheDocument();
    });
  });

  test('"Create new prompt with this content" button navigates correctly with state', async () => {
    mockedGetPromptById.mockResolvedValueOnce(mockPromptData);
    renderComponent('1');

    await waitFor(() => expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument());

    const createButton = screen.getByRole('button', { name: /이 내용으로 새 프롬프트 작성/i });
    expect(createButton).toBeInTheDocument();

    fireEvent.click(createButton);

    expect(mockedNavigate).toHaveBeenCalledWith('/create', {
      state: {
        initialContent: mockPromptData.content,
        initialTitle: mockPromptData.title,
      },
    });
  });
});
