import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

vi.mock('../api/api', () => ({
  default: mockApi,
  auth: {
    register: (...args) => mockApi.post('/auth/register', ...args),
    login: (...args) => mockApi.post('/auth/login', ...args),
  },
  products: {
    list: (...args) => mockApi.get('/products', ...args),
    getById: (id) => mockApi.get(`/products/${id}`),
    create: (...args) => mockApi.post('/products', ...args),
    update: (id, ...args) => mockApi.put(`/products/${id}`, ...args),
    delete: (id) => mockApi.delete(`/products/${id}`),
  },
  users: {
    list: (...args) => mockApi.get('/users', ...args),
    getById: (id) => mockApi.get(`/users/${id}`),
  },
  orders: {
    create: (...args) => mockApi.post('/orders', ...args),
    list: (...args) => mockApi.get('/orders', ...args),
  },
  sales: {
    list: (...args) => mockApi.get('/seller/sales', ...args),
    byProduct: (id) => mockApi.get(`/seller/sales/${id}`),
  },
}));

function TestComponent() {
  const { user, login, register, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? JSON.stringify(user) : 'null'}</span>
      <button data-testid="login-btn" onClick={() => login('a@b.com', '123')}>
        Login
      </button>
      <button data-testid="register-btn" onClick={() => register({ email: 'a@b.com' })}>
        Register
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts with null user', () => {
    renderWithProvider();
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('restores user from localStorage', () => {
    const fakeUser = { id: '123', email: 'a@b.com', role: 'USER' };
    localStorage.setItem('user', JSON.stringify(fakeUser));
    localStorage.setItem('token', 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature');
    renderWithProvider();
    expect(screen.getByTestId('user').textContent).toContain('a@b.com');
  });

  it('login stores user and token', async () => {
    const fakeToken =
      'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyLWlkIiwiZW1haWwiOiJhQGIuY29tIiwicm9sZSI6IlVTRVIifQ.signature';
    mockApi.post.mockResolvedValue({ data: { token: fakeToken, email: 'a@b.com' } });

    renderWithProvider();
    await userEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      const userText = screen.getByTestId('user').textContent;
      expect(userText).toContain('a@b.com');
      expect(userText).toContain('USER');
    });
    expect(localStorage.getItem('token')).toBe(fakeToken);
  });

  it('logout clears user and token', async () => {
    const fakeToken =
      'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyLWlkIiwiZW1haWwiOiJhQGIuY29tIiwicm9sZSI6IlVTRVIifQ.signature';
    mockApi.post.mockResolvedValue({ data: { token: fakeToken, email: 'a@b.com' } });

    renderWithProvider();
    await userEvent.click(screen.getByTestId('login-btn'));
    await waitFor(() => expect(screen.getByTestId('user').textContent).not.toBe('null'));

    await userEvent.click(screen.getByTestId('logout-btn'));
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('register calls api and returns data', async () => {
    const userData = { id: '123', email: 'a@b.com', role: 'USER' };
    mockApi.post.mockResolvedValue({ data: userData });

    renderWithProvider();
    await userEvent.click(screen.getByTestId('register-btn'));

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith(
        '/auth/register',
        { email: 'a@b.com' }
      );
    });
  });
});
