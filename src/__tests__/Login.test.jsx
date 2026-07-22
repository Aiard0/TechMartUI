import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';

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

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Login page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    renderLogin();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('shows error message on failed login', async () => {
    mockApi.post.mockRejectedValue({
      response: { data: { message: 'Credenciais inválidas' } },
    });

    renderLogin();
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });
  });

  it('has link to register', () => {
    renderLogin();
    expect(screen.getByRole('link', { name: /cadastre-se/i })).toHaveAttribute(
      'href',
      '/register'
    );
  });
});
