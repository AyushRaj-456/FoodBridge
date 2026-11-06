import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App.jsx';

describe('FoodBridge App Shell — ₹0 Spark Baseline', () => {
  it('renders public home page by default when visiting root', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getAllByText('FoodBridge').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('heading', { level: 1, name: /Good food shouldn't go to waste/i })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Share surplus food/i }).length).toBeGreaterThan(
      0
    );
    expect(
      screen.getByRole('heading', { level: 2, name: /Live Redistribution Activity/i })
    ).toBeInTheDocument();
  });

  it('renders the brand name, skip link, and status banner in operations mode', async () => {
    await act(async () => {
      render(<App initialPublic={false} />);
    });

    // Brand title
    expect(screen.getAllByText('FoodBridge').length).toBeGreaterThan(0);

    // Skip to content accessible link
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');

    // Status banner confirming community safety
    expect(screen.getByText('Verified Safe Handover')).toBeInTheDocument();
    expect(screen.getByText(/Direct community redistribution/i)).toBeInTheDocument();
  });

  it('renders default Donor view on initial load in operations mode', async () => {
    await act(async () => {
      render(<App initialPublic={false} />);
    });

    expect(
      screen.getByRole('heading', { level: 1, name: /Donor Operations/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Viewing as:/i)).toHaveTextContent('Donor Member');
  });

  it('switches views when role switcher buttons are clicked', async () => {
    await act(async () => {
      render(<App initialPublic={false} />);
    });

    // Switch to Recipient
    const recipientBtn = screen.getByRole('button', { name: 'Recipient NGO' });
    await act(async () => {
      fireEvent.click(recipientBtn);
    });
    expect(
      screen.getByRole('heading', { level: 1, name: /Verified Recipient Feed/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Viewing as:/i)).toHaveTextContent('Verified Recipient (NGO)');

    // Switch to Mess Operator
    const messBtn = screen.getByRole('button', { name: 'Mess Operator' });
    await act(async () => {
      fireEvent.click(messBtn);
    });
    expect(
      screen.getByRole('heading', { level: 1, name: /Mess Waste & Production Records/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Viewing as:/i)).toHaveTextContent('Mess Operator');

    // Switch to Admin
    const adminBtn = screen.getByRole('button', { name: 'Admin' });
    await act(async () => {
      fireEvent.click(adminBtn);
    });
    expect(
      screen.getByRole('heading', { level: 1, name: /Administrative & Moderation Console/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Viewing as:/i)).toHaveTextContent('Administrator');
  });

  it('renders privacy notice when clicking sidebar compliance link', async () => {
    await act(async () => {
      render(<App initialPublic={false} />);
    });

    const privacyBtn = screen.getByRole('button', { name: /Privacy & Retention/i });
    await act(async () => {
      fireEvent.click(privacyBtn);
    });

    expect(
      screen.getByRole('heading', { level: 1, name: /Privacy, Retention & Data Minimisation/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Zero Scans \/ Photos:/i)).toBeInTheDocument();
  });
});
