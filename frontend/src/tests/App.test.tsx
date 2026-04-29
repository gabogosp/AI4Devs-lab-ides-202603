import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders recruiter dashboard with add candidate entry', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /recruiter dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /add candidate/i })).toBeInTheDocument();
  });
});
