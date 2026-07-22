import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import Register from '../pages/Register';

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

function renderRegister() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Register page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders register form', () => {
    renderRegister();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Sobrenome')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de conta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
  });

  it('submits form and calls register api', async () => {
    mockApi.post.mockResolvedValue({ data: { id: '1' } });

    renderRegister();
    await userEvent.type(screen.getByLabelText('Nome'), 'João');
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'Silva');
    await userEvent.type(screen.getByLabelText('Email'), 'joao@email.com');
    await userEvent.type(screen.getByLabelText('Senha'), '123456');
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }));

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/auth/register', {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@email.com',
        password: '123456',
        role: 'USER',
      });
    });
  });

  it('shows error on failed registration', async () => {
    mockApi.post.mockRejectedValue({
      response: { data: { message: 'Email já cadastrado' } },
    });

    renderRegister();
    await userEvent.type(screen.getByLabelText('Nome'), 'João');
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'Silva');
    await userEvent.type(screen.getByLabelText('Email'), 'joao@email.com');
    await userEvent.type(screen.getByLabelText('Senha'), '123456');
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Email já cadastrado')).toBeInTheDocument();
    });
  });

  it('has link to login', () => {
    renderRegister();
    expect(screen.getByRole('link', { name: /entrar/i })).toHaveAttribute(
      'href',
      '/login'
    );
  });
});
