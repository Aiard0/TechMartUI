import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import Products from '../pages/Products';

const { mockAxios } = vi.hoisted(() => ({
  mockAxios: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

const mockProducts = [
  {
    id: '1',
    name: 'Notebook',
    description: '16GB RAM',
    price: 4500.0,
    quantity: 10,
    sold: false,
    createdAt: '2026-07-22T10:00:00Z',
    updatedAt: '2026-07-22T10:00:00Z',
  },
  {
    id: '2',
    name: 'Mouse',
    description: 'Sem fio',
    price: 150.0,
    quantity: 0,
    sold: true,
    createdAt: '2026-07-22T10:00:00Z',
    updatedAt: '2026-07-22T10:00:00Z',
  },
];

vi.mock('../api/api', () => ({
  default: mockAxios,
  auth: {
    register: (...args) => mockAxios.post('/auth/register', ...args),
    login: (...args) => mockAxios.post('/auth/login', ...args),
  },
  products: {
    list: (...args) => mockAxios.get('/products', ...args),
    getById: (id) => mockAxios.get(`/products/${id}`),
    create: (...args) => mockAxios.post('/products', ...args),
    update: (id, ...args) => mockAxios.put(`/products/${id}`, ...args),
    delete: (id) => mockAxios.delete(`/products/${id}`),
  },
  users: {
    list: (...args) => mockAxios.get('/users', ...args),
    getById: (id) => mockAxios.get(`/users/${id}`),
  },
  orders: {
    create: (...args) => mockAxios.post('/orders', ...args),
    list: (...args) => mockAxios.get('/orders', ...args),
  },
  sales: {
    list: (...args) => mockAxios.get('/seller/sales', ...args),
    byProduct: (id) => mockAxios.get(`/seller/sales/${id}`),
  },
}));

function renderProducts(user = { id: '1', email: 'a@b.com', role: 'USER' }) {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem(
    'token',
    'eyJhbGciOiJSUzI1NiJ9.' +
      btoa(JSON.stringify({ sub: user.id, email: user.email, role: user.role })) +
      '.sig'
  );

  return render(
    <MemoryRouter>
      <AuthProvider>
        <Products />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Products page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    mockAxios.get.mockReturnValue(new Promise(() => {}));
    renderProducts();
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('renders product list', async () => {
    mockAxios.get.mockResolvedValue({ data: mockProducts });

    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('Notebook')).toBeInTheDocument();
      expect(screen.getByText('Mouse')).toBeInTheDocument();
      expect(screen.getByText('16GB RAM')).toBeInTheDocument();
    });
  });

  it('shows empty state when no products', async () => {
    mockAxios.get.mockResolvedValue({ data: [] });

    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('Nenhum produto cadastrado.')).toBeInTheDocument();
    });
  });

  it('shows error on API failure', async () => {
    mockAxios.get.mockRejectedValue({
      response: { data: { message: 'Erro interno' } },
    });

    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('Erro interno')).toBeInTheDocument();
    });
  });

  it('shows Novo Produto button for SELLER', async () => {
    mockAxios.get.mockResolvedValue({ data: [] });

    renderProducts({ id: '2', email: 'seller@email.com', role: 'SELLER' });

    await waitFor(() => {
      expect(screen.getByText('Novo Produto')).toBeInTheDocument();
    });
  });

  it('hides Novo Produto button for USER', async () => {
    mockAxios.get.mockResolvedValue({ data: [] });

    renderProducts({ id: '1', email: 'user@email.com', role: 'USER' });

    await waitFor(() => {
      expect(screen.queryByText('Novo Produto')).not.toBeInTheDocument();
    });
  });
});
