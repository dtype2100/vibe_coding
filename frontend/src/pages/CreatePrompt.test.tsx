import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CreatePrompt from './CreatePrompt';
import { getAllCategories, createPrompt } from '../services/api';
import type { Category, Prompt, CreatePromptPayload } from '../services/api';

// Mock the API service
jest.mock('../services/api');

// Mock react-router-dom hooks
const mockedNavigate = jest.fn();
const mockLocationState = jest.fn().mockReturnValue({ state: null });

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => mockLocationState(), // Use a mock function to allow per-test configuration
}));

// Type assertions for mocked functions
const mockedGetAllCategories = getAllCategories as jest.MockedFunction<typeof getAllCategories>;
const mockedCreatePrompt = createPrompt as jest.MockedFunction<typeof createPrompt>;

const mockCategoriesData: Category[] = [
  { id: 1, name: 'General', description: 'General prompts' },
  { id: 2, name: 'Coding', description: 'Coding assistance prompts' },
];

const mockCreatedPrompt: Prompt = {
  id: 101,
  title: 'Test Prompt Title',
  description: 'Test Description',
  content: 'Test Content',
  category_id: 1,
  category_name: 'General',
  tags: [{id: 1, name: 'test'}],
  user_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};


const renderComponent = (initialState = null) => {
  mockLocationState.mockReturnValue({ state: initialState });
  return render(
    <MemoryRouter> {/* No specific initialEntries needed unless testing navigation FROM this page */}
      <CreatePrompt />
       {/* Dummy route for navigation target verification if needed */}
      <Routes>
        <Route path="/prompts/:id" element={<div>Prompt Detail Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};


describe('CreatePrompt Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAllCategories.mockResolvedValue([...mockCategoriesData]); // Default mock for categories
    mockedCreatePrompt.mockResolvedValue(mockCreatedPrompt); // Default mock for create
    mockLocationState.mockReturnValue({ state: null }); // Reset location state
  });

  test('renders all form fields correctly', async () => {
    renderComponent();
    await waitFor(() => expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument()); // Wait for categories to load

    expect(screen.getByLabelText(/제목/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/카테고리/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/설명 \(선택 사항\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/프롬프트 내용/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/태그 \(쉼표로 구분\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /프롬프트 생성/i })).toBeInTheDocument();
  });

  test('loads and displays categories in the select dropdown', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument(); // Ensure category loading is done
    });

    // Click the category select to open it
    // The label text for MUI Select is associated with an InputLabel, not the select input itself.
    // We can get the button that opens the select.
    const categorySelect = screen.getByLabelText(/카테고리/i);
    await userEvent.click(categorySelect);
    
    // Check if categories are listed in the dropdown
    for (const category of mockCategoriesData) {
      expect(await screen.findByText(category.name)).toBeInTheDocument();
    }
  });

  test('allows user to input data into form fields', async () => {
    renderComponent();
    await waitFor(() => expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument());

    await userEvent.type(screen.getByLabelText(/제목/i), 'My New Prompt');
    expect(screen.getByLabelText(/제목/i)).toHaveValue('My New Prompt');

    await userEvent.type(screen.getByLabelText(/프롬프트 내용/i), 'Detailed content here.');
    expect(screen.getByLabelText(/프롬프트 내용/i)).toHaveValue('Detailed content here.');

    await userEvent.type(screen.getByLabelText(/태그 \(쉼표로 구분\)/i), 'test, new, tags');
    expect(screen.getByLabelText(/태그 \(쉼표로 구분\)/i)).toHaveValue('test, new, tags');

    // Category selection
    const categorySelect = screen.getByLabelText(/카테고리/i);
    await userEvent.click(categorySelect);
    await userEvent.click(await screen.findByText(mockCategoriesData[0].name));
    // Value of MUI select is not directly visible on the input, usually check by what's selected or how it affects submission
  });

  test('handles successful form submission', async () => {
    jest.useFakeTimers(); // For the setTimeout before navigation
    renderComponent();
    await waitFor(() => expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument());

    await userEvent.type(screen.getByLabelText(/제목/i), mockCreatedPrompt.title);
    await userEvent.type(screen.getByLabelText(/설명 \(선택 사항\)/i), mockCreatedPrompt.description!);
    await userEvent.type(screen.getByLabelText(/프롬프트 내용/i), mockCreatedPrompt.content);
    
    const categorySelect = screen.getByLabelText(/카테고리/i);
    await userEvent.click(categorySelect);
    await userEvent.click(await screen.findByText(mockCategoriesData[0].name)); // Select 'General'

    await userEvent.type(screen.getByLabelText(/태그 \(쉼표로 구분\)/i), 'test');
    
    await userEvent.click(screen.getByRole('button', { name: /프롬프트 생성/i }));

    await waitFor(() => {
      expect(mockedCreatePrompt).toHaveBeenCalledWith({
        title: mockCreatedPrompt.title,
        description: mockCreatedPrompt.description,
        content: mockCreatedPrompt.content,
        category_id: mockCategoriesData[0].id, // 'General' category ID
        tags: ['test'],
      });
    });

    expect(await screen.findByText(`프롬프트 "${mockCreatedPrompt.title}"가 성공적으로 생성되었습니다!`)).toBeInTheDocument();
    
    // Check form reset (example: title field)
    expect(screen.getByLabelText(/제목/i)).toHaveValue(''); 

    jest.runAllTimers(); // Fast-forward timers

    expect(mockedNavigate).toHaveBeenCalledWith(`/prompts/${mockCreatedPrompt.id}`);
    jest.useRealTimers();
  });

  test('handles failed form submission', async () => {
    mockedCreatePrompt.mockRejectedValueOnce(new Error('Creation Failed!'));
    renderComponent();
    await waitFor(() => expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument());

    await userEvent.type(screen.getByLabelText(/제목/i), 'Fail Test');
    await userEvent.type(screen.getByLabelText(/프롬프트 내용/i), 'Content');
    const categorySelect = screen.getByLabelText(/카테고리/i);
    await userEvent.click(categorySelect);
    await userEvent.click(await screen.findByText(mockCategoriesData[0].name));
    
    await userEvent.click(screen.getByRole('button', { name: /프롬프트 생성/i }));

    expect(await screen.findByText('Creation Failed!')).toBeInTheDocument();
  });

  test('shows validation error for missing required fields', async () => {
    renderComponent();
    await waitFor(() => expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /프롬프트 생성/i }));
    
    expect(await screen.findByText('제목, 내용, 카테고리는 필수 항목입니다.')).toBeInTheDocument();
    expect(mockedCreatePrompt).not.toHaveBeenCalled();
  });

  test('pre-fills form fields from location state', async () => {
    const initialState = { initialTitle: 'Pre-filled Title', initialContent: 'Pre-filled Content' };
    renderComponent(initialState);
    await waitFor(() => expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument());

    expect(screen.getByLabelText(/제목/i)).toHaveValue('Pre-filled Title');
    expect(screen.getByLabelText(/프롬프트 내용/i)).toHaveValue('Pre-filled Content');
  });
});
