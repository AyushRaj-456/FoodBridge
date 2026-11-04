import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignInForm from './SignInForm.jsx';
import RegisterForm from './RegisterForm.jsx';
import PasswordResetForm from './PasswordResetForm.jsx';
import AccountStateBanner from './AccountStateBanner.jsx';
import UserProfileModal from './UserProfileModal.jsx';
import { formatAuthError } from './authService.js';
import * as AuthContextModule from './useAuth.js';

describe('Authentication & Profiles — Spark ₹0 Baseline', () => {
  describe('formatAuthError Security Helper', () => {
    it('prevents account enumeration with generic messages for invalid credentials', () => {
      expect(formatAuthError('auth/user-not-found')).toBe(
        'Invalid email or password. Please check your credentials and try again.'
      );
      expect(formatAuthError('auth/wrong-password')).toBe(
        'Invalid email or password. Please check your credentials and try again.'
      );
      expect(formatAuthError('auth/invalid-credential')).toBe(
        'Invalid email or password. Please check your credentials and try again.'
      );
    });

    it('formats weak password and duplicate email errors clearly', () => {
      expect(formatAuthError('auth/email-already-in-use')).toBe(
        'An account with this email address already exists.'
      );
      expect(formatAuthError('auth/weak-password')).toBe(
        'Password should be at least 6 characters.'
      );
    });
  });

  describe('SignInForm Component', () => {
    const mockLogin = vi.fn();
    const mockLoginWithGoogle = vi.fn();
    const mockSwitchToRegister = vi.fn();
    const mockSwitchToReset = vi.fn();
    const mockSuccess = vi.fn();

    beforeEach(() => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        login: mockLogin,
        loginWithGoogle: mockLoginWithGoogle,
      });
      mockLogin.mockReset();
      mockLoginWithGoogle.mockReset();
    });

    it('renders all sign-in controls including optional Google provider', () => {
      render(
        <SignInForm
          onSwitchToRegister={mockSwitchToRegister}
          onSwitchToReset={mockSwitchToReset}
          onSuccess={mockSuccess}
        />
      );

      expect(
        screen.getByRole('heading', { level: 2, name: /Sign In to FoodBridge/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Forgot password\?/i })).toBeInTheDocument();
    });

    it('validates empty inputs and displays error', async () => {
      render(
        <SignInForm
          onSwitchToRegister={mockSwitchToRegister}
          onSwitchToReset={mockSwitchToReset}
          onSuccess={mockSuccess}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /^Sign In$/i }));
      expect(await screen.findByRole('alert')).toHaveTextContent(
        /Please enter both email and password/i
      );
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('submits valid credentials and calls login', async () => {
      mockLogin.mockResolvedValueOnce({ user: { uid: '123' } });

      render(
        <SignInForm
          onSwitchToRegister={mockSwitchToRegister}
          onSwitchToReset={mockSwitchToReset}
          onSuccess={mockSuccess}
        />
      );

      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'test@foodbridge.org' },
      });
      fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /^Sign In$/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@foodbridge.org', 'password123');
        expect(mockSuccess).toHaveBeenCalled();
      });
    });

    it('triggers view switches when links are clicked', () => {
      render(
        <SignInForm
          onSwitchToRegister={mockSwitchToRegister}
          onSwitchToReset={mockSwitchToReset}
          onSuccess={mockSuccess}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Forgot password\?/i }));
      expect(mockSwitchToReset).toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: /Create an account/i }));
      expect(mockSwitchToRegister).toHaveBeenCalled();
    });
  });

  describe('RegisterForm Component & Role Invariant', () => {
    const mockRegister = vi.fn();
    const mockSwitchToSignIn = vi.fn();
    const mockSuccess = vi.fn();

    beforeEach(() => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        register: mockRegister,
      });
      mockRegister.mockReset();
    });

    it('enforces that user CANNOT choose admin or verified role', () => {
      render(<RegisterForm onSwitchToSignIn={mockSwitchToSignIn} onSuccess={mockSuccess} />);

      // Verify NO role selector dropdown or radio buttons exist
      expect(screen.queryByLabelText(/Role/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
      expect(
        screen.getByText(/Platform administrator privileges cannot be self-selected/i)
      ).toBeInTheDocument();
    });

    it('validates password length and password matching', async () => {
      render(<RegisterForm onSwitchToSignIn={mockSwitchToSignIn} onSuccess={mockSuccess} />);

      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Alice' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'alice@foodbridge.org' },
      });
      fireEvent.change(screen.getByLabelText(/Password \(min 6 characters\)/i), {
        target: { value: '123' },
      });
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: '123' } });

      fireEvent.click(screen.getByRole('button', { name: /Register Account/i }));
      expect(await screen.findByRole('alert')).toHaveTextContent(
        /Password must be at least 6 characters/i
      );

      // Mismatch
      fireEvent.change(screen.getByLabelText(/Password \(min 6 characters\)/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
        target: { value: 'differentPass' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Register Account/i }));
      expect(await screen.findByRole('alert')).toHaveTextContent(/Passwords do not match/i);
    });

    it('successfully calls register on valid inputs', async () => {
      mockRegister.mockResolvedValueOnce({ user: { uid: 'u1' } });

      render(<RegisterForm onSwitchToSignIn={mockSwitchToSignIn} onSuccess={mockSuccess} />);

      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Alice Donor' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'alice@donor.org' },
      });
      fireEvent.change(screen.getByLabelText(/Password \(min 6 characters\)/i), {
        target: { value: 'securePass123' },
      });
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
        target: { value: 'securePass123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Register Account/i }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          'alice@donor.org',
          'securePass123',
          'Alice Donor'
        );
        expect(mockSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('PasswordResetForm Component', () => {
    const mockReset = vi.fn();
    const mockBack = vi.fn();

    beforeEach(() => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        resetPassword: mockReset,
      });
      mockReset.mockReset();
    });

    it('submits email and displays confirmation message', async () => {
      mockReset.mockResolvedValueOnce();

      render(<PasswordResetForm onBackToSignIn={mockBack} />);

      fireEvent.change(screen.getByLabelText(/Registered Email Address/i), {
        target: { value: 'user@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Send Password Reset Email/i }));

      await waitFor(() => {
        expect(mockReset).toHaveBeenCalledWith('user@example.com');
        expect(screen.getByRole('status')).toHaveTextContent(/Reset Link Sent/i);
      });
    });
  });

  describe('AccountStateBanner Component', () => {
    it('renders pending status banner for unverified user', () => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: { uid: 'u1' },
        profile: { status: 'pending' },
        isAdmin: false,
      });

      render(<AccountStateBanner />);
      expect(screen.getByRole('status')).toHaveTextContent(/Account Verification Pending/i);
    });

    it('renders suspended alert banner for suspended user', () => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: { uid: 'u1' },
        profile: { status: 'suspended' },
        isAdmin: false,
      });

      render(<AccountStateBanner />);
      expect(screen.getByRole('alert')).toHaveTextContent(/Account Suspended/i);
    });

    it('renders nothing when active or unauthenticated', () => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: { uid: 'u1' },
        profile: { status: 'active' },
        isAdmin: false,
      });

      const { container } = render(<AccountStateBanner />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('UserProfileModal Component', () => {
    const mockLogout = vi.fn();
    const mockClose = vi.fn();
    const mockUpdate = vi.fn();

    beforeEach(() => {
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: { uid: 'u1', email: 'alice@foodbridge.org', displayName: 'Alice' },
        profile: { displayName: 'Alice', email: 'alice@foodbridge.org', status: 'pending' },
        isAdmin: false,
        logout: mockLogout,
        updateProfileData: mockUpdate,
      });
      mockLogout.mockReset();
      mockClose.mockReset();
    });

    it('renders profile details and allows signing out', async () => {
      mockLogout.mockResolvedValueOnce();

      render(<UserProfileModal isOpen={true} onClose={mockClose} />);

      expect(
        screen.getByRole('heading', { level: 2, name: /User Account & Profile/i })
      ).toBeInTheDocument();
      expect(screen.getByText('alice@foodbridge.org')).toBeInTheDocument();
      expect(screen.getByText('Pending Review')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Sign Out/i }));

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
        expect(mockClose).toHaveBeenCalled();
      });
    });
  });
});
