import React from 'react';
import { render, screen } from '@testing-library/react';
import SupportPage from '../SupportPage';

// Mock the withAuth HOC
jest.mock('@/components/auth/withAuth', () => (Component: React.ComponentType) => (props: any) => <Component {...props} />);

describe('SupportPage', () => {
  it('renders the main heading', () => {
    render(<SupportPage />);
    const heading = screen.getByRole('heading', { name: /support/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders the FAQ section title', () => {
    render(<SupportPage />);
    const faqTitle = screen.getByRole('heading', { name: /frequently asked questions/i });
    expect(faqTitle).toBeInTheDocument();
  });

  it('renders all FAQ items', () => {
    render(<SupportPage />);
    const faqItems = screen.getAllByRole('button', { name: /how do i|how can i|where can i/i });
    // There are 4 FAQs in the component
    expect(faqItems).toHaveLength(4);
  });

  it('displays the correct question for the first FAQ', () => {
    render(<SupportPage />);
    const firstFaq = screen.getByText('How do I create a new task?');
    expect(firstFaq).toBeInTheDocument();
  });
});
