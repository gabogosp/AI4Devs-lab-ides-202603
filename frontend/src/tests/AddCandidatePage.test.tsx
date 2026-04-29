import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AddCandidatePage from '../pages/AddCandidatePage';
import { createCandidate } from '../services/candidateService';

jest.mock('../services/candidateService', () => ({
  __esModule: true,
  uploadCv: jest.fn(),
  createCandidate: jest.fn().mockResolvedValue({
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
  }),
  ApiRequestError: class ApiRequestError extends Error {
    declare detail?: string;
    constructor(message: string) {
      super(message);
      this.name = 'ApiRequestError';
    }
  },
}));

const mockedCreateCandidate = jest.mocked(createCandidate);

describe('AddCandidatePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows validation errors when required fields are empty', async () => {
    render(
      <MemoryRouter>
        <AddCandidatePage />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: /save candidate/i }));
    expect(await screen.findByText(/first name must/i)).toBeInTheDocument();
  });

  it('submits when minimal fields are valid', async () => {
    render(
      <MemoryRouter>
        <AddCandidatePage />
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByLabelText(/first name/i), 'John');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Smith');
    await userEvent.type(screen.getByLabelText(/^email/i), 'john.smith@example.com');
    await userEvent.click(screen.getByRole('button', { name: /save candidate/i }));

    expect(mockedCreateCandidate).toHaveBeenCalled();
    expect(await screen.findByText(/candidate added successfully/i)).toBeInTheDocument();
  });
});
