import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
};

vi.mock('axios', () => ({
  default: {
    create: () => mockAxiosInstance,
  },
}));

describe('API layer', () => {
  let mod;

  beforeAll(async () => {
    mod = await import('../api/api');
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('auth endpoints', () => {
    it('auth.register calls POST /auth/register', () => {
      const data = { firstName: 'João', email: 'joao@email.com' };
      mod.auth.register(data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', data);
    });

    it('auth.login calls POST /auth/login', () => {
      const data = { email: 'joao@email.com', password: '123' };
      mod.auth.login(data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', data);
    });
  });

  describe('products endpoints', () => {
    it('products.list calls GET /products', () => {
      mod.products.list();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products');
    });

    it('products.getById calls GET /products/:id', () => {
      mod.products.getById('abc-123');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/abc-123');
    });

    it('products.create calls POST /products', () => {
      const data = { name: 'Notebook', price: 4500 };
      mod.products.create(data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/products', data);
    });

    it('products.update calls PUT /products/:id', () => {
      const data = { name: 'Notebook Updated' };
      mod.products.update('abc-123', data);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/products/abc-123', data);
    });

    it('products.delete calls DELETE /products/:id', () => {
      mod.products.delete('abc-123');
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/products/abc-123');
    });
  });

  describe('users endpoints', () => {
    it('users.list calls GET /users', () => {
      mod.users.list();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users');
    });

    it('users.getById calls GET /users/:id', () => {
      mod.users.getById('abc-123');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/abc-123');
    });
  });

  describe('orders endpoints', () => {
    it('orders.create calls POST /orders', () => {
      const data = { items: [{ productId: 'abc', quantity: 2 }] };
      mod.orders.create(data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/orders', data);
    });

    it('orders.list calls GET /orders', () => {
      mod.orders.list();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/orders');
    });
  });

  describe('sales endpoints', () => {
    it('sales.list calls GET /seller/sales', () => {
      mod.sales.list();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/seller/sales');
    });

    it('sales.byProduct calls GET /seller/sales/:productId', () => {
      mod.sales.byProduct('abc-123');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/seller/sales/abc-123');
    });
  });
});
