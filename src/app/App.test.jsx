import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App.jsx';

describe('FoodBridge App Shell — ₹0 Spark Baseline', () => {
  it('renders the brand name, skip link, and Spark ₹0 status banner', () => {
    render(<App />);

    // Brand title
    expect(screen.getAllByText('FoodBridge').length).toBeGreaterThan(0);

    // Skip to content accessible link
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');

    // Status banner confirming Spark plan
    expect(screen.getByText('Firebase Spark (₹0 Plan)')).toBeInTheDocument();
    expect(screen.getByText(/Strict zero-cost contract active/i)).toBeInTheDocument();
  });

  it('renders default Donor view on initial load', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Donor Operations/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Viewing as:/i)).toHaveTextContent('Donor Member');
  });

  it('switches views when role switcher buttons are clicked', () => {
    render(<App />);

    // Switch to Recipient
    const recipientBtn = screen.getByRole('button', { name: 'Recipient NGO' });
    fireEvent.click(recipientBtn);
    expect(
      screen.getByRole('heading', { level: 1, name: /Verified Recipient Feed/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Viewing as:/i)).toHaveTextContent('Verified Recipient (NGO)');

    // Switch to Mess Operator
    const messBtn = screen.getByRole('button', { name: 'Mess Operator' });
    fireEvent.click(messBtn);
    expect(
      screen.getByRole('heading', { level: 1, name: /Mess Waste & Production Records/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Viewing as:/i)).toHaveTextContent('Mess Operator');

    // Switch to Admin
    const adminBtn = screen.getByRole('button', { name: 'Admin' });
    fireEvent.click(adminBtn);
    expect(
      screen.getByRole('heading', { level: 1, name: /Administrative & Moderation Console/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Viewing as:/i)).toHaveTextContent('Administrator');
  });

  it('renders privacy notice when clicking sidebar compliance link', () => {
    render(<App />);

    const privacyBtn = screen.getByRole('button', { name: /Privacy & Retention/i });
    fireEvent.click(privacyBtn);

    expect(
      screen.getByRole('heading', { level: 1, name: /Privacy, Retention & Data Minimisation/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Zero Scans \/ Photos:/i)).toBeInTheDocument();
  });
});
