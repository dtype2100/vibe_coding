import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PromptList from './PromptList';
import { getAllPrompts } from '../services/api'; // Import the actual function to be mocked
import type { Prompt, Tag } from '../services/api'; // Import types

// Mock the API service
jest.mock('../services/api');

// Type assertion for the mocked function
const mockedGetAllPrompts = getAllPrompts as jest.MockedFunction<typeof getAllPrompts>;

const mockPromptsData: Prompt[] = [
  {
    id: 1,
    title: 'Test Prompt 1',
    description: 'Description for prompt 1',
    content: 'Content for prompt 1',
    category_id: 1,
    category_name: 'Category Alpha',
    user_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: [{ id: 1, name: 'TagA' }, { id: 2, name: 'TagB' }],
  },
  {
    id: 2,
    title: 'Test Prompt 2',
    description: 'Description for prompt 2',
    content: 'Content for prompt 2',
    category_id: 2,
    category_name: 'Category Beta',
    user_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: [{ id: 3, name: 'TagC' }],
  },
];

describe('PromptList Component', () => {
  afterEach(() => {
    // Clear all mock implementations and calls after each test
    jest.clearAllMocks();
  });

  test('displays loading state initially', () => {
    mockedGetAllPrompts.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(
      <MemoryRouter>
        <PromptList />
      </MemoryRouter>
    );

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  test('displays prompts when data is loaded successfully', async () => {
    mockedGetAllPrompts.mockResolvedValueOnce([...mockPromptsData]);

    render(
      <MemoryRouter>
        <PromptList />
      </MemoryRouter>
    );

    // Wait for loading to disappear and data to render
    await waitFor(() => expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument());

    // Check for prompt titles
    expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
    expect(screen.getByText('Test Prompt 2')).toBeInTheDocument();

    // Check for descriptions (or parts of them)
    expect(screen.getByText(/Description for prompt 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Description for prompt 2/i)).toBeInTheDocument();
    
    // Check for category names
    expect(screen.getByText('Category Alpha')).toBeInTheDocument();
    expect(screen.getByText('Category Beta')).toBeInTheDocument();

    // Check for tags
    expect(screen.getByText('TagA')).toBeInTheDocument();
    expect(screen.getByText('TagB')).toBeInTheDocument();
    expect(screen.getByText('TagC')).toBeInTheDocument();

    // Check "자세히 보기" links
    const links = screen.getAllByRole('link', { name: /자세히 보기/i });
    expect(links[0]).toHaveAttribute('href', '/prompts/1');
    expect(links[1]).toHaveAttribute('href', '/prompts/2');
  });

  test('displays error message when data loading fails', async () => {
    mockedGetAllPrompts.mockRejectedValueOnce(new Error('Failed to fetch prompts'));

    render(
      <MemoryRouter>
        <PromptList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('프롬프트를 불러오는 중 오류가 발생했습니다.')).toBeInTheDocument();
    });
  });

  test('displays message when no prompts are available', async () => {
    mockedGetAllPrompts.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <PromptList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('등록된 프롬프트가 없습니다.')).toBeInTheDocument();
    });
  });

  test('renders correct number of prompt cards', async () => {
    mockedGetAllPrompts.mockResolvedValueOnce([...mockPromptsData]);
    render(
      <MemoryRouter>
        <PromptList />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument());
    
    // Each prompt card has a title. We find all elements with role 'heading' and level 2 (h2 is used for title in CardContent).
    // This is a bit indirect. A better way would be to add a data-testid to the card Box.
    // For now, let's assume each card contains a unique title from our mock data.
    const promptTitles = screen.getAllByText(/Test Prompt/i);
    expect(promptTitles.length).toBe(mockPromptsData.length);

    // Or, more robustly, if cards have a specific role or test id
    // const cards = screen.getAllByTestId('prompt-card'); // Assuming you add data-testid="prompt-card" to the Box in PromptList
    // expect(cards.length).toBe(mockPromptsData.length);
  });
});
