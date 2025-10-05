import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../../components/LoginPage.tsx';
import { AuthProvider, useAuth } from '../../contexts/AuthContext.tsx';
import { I18nProvider } from '../../contexts/I18nContext.tsx';

// Mock the useAuth hook
vi.mock('../../contexts/AuthContext.tsx', async (importOriginal) => {
  const mod = await importOriginal() as typeof import('../../contexts/AuthContext.tsx');
  return {
    ...mod,
    useAuth: vi.fn(),
  };
});

const mockLogin = vi.fn();

const renderComponent = () => {
    render(
        <I18nProvider>
            <LoginPage />
        </I18nProvider>
    );
};

describe('LoginPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      login: mockLogin,
      logout: vi.fn(),
    });
    mockLogin.mockClear();
  });

  it('renders login form correctly', () => {
    renderComponent();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('allows user to type into email and password fields', async () => {
    const user = userEvent.setup();
    renderComponent();

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    await user.clear(emailInput);
    await user.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');

    await user.clear(passwordInput);
    await user.type(passwordInput, 'password123');
    expect(passwordInput).toHaveValue('password123');
  });

  it('calls login function on form submission with the correct credentials', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    mockLogin.mockResolvedValue(true); // Mock a successful login

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    await user.clear(emailInput);
    await user.type(emailInput, 'user@test.com');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'securepass');

    await user.click(loginButton);

    expect(mockLogin).toHaveBeenCalledTimes(1);
    expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'securepass');
  });

  it('shows an error message on failed login', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Mock a failed login
    mockLogin.mockResolvedValue(false);

    const loginButton = screen.getByRole('button', { name: /Login/i });
    await user.click(loginButton);

    // Using findByText because the error message appears asynchronously
    const errorMessage = await screen.findByText(/Invalid credentials/i);
    expect(errorMessage).toBeInTheDocument();
  });
});