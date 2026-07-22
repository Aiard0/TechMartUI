import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute, PublicRoute } from '../components/ProtectedRoute';

function renderWithAuth(ui, { initialEntries = ['/'], user } = {}) {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem(
      'token',
      'eyJhbGciOiJSUzI1NiJ9.' +
        btoa(JSON.stringify({ sub: user.id, email: user.email, role: user.role })) +
        '.sig'
    );
  } else {
    localStorage.clear();
  }

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page" />} />
          <Route path="/products" element={<div data-testid="products-page" />} />
          <Route path="/" element={<div data-testid="home" />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div data-testid="protected-page" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller-only"
            element={
              <ProtectedRoute roles={['SELLER']}>
                <div data-testid="seller-page" />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => localStorage.clear());

  it('redirects to login when not authenticated', () => {
    renderWithAuth(null, { initialEntries: ['/protected'] });
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    renderWithAuth(null, {
      initialEntries: ['/protected'],
      user: { id: '1', email: 'a@b.com', role: 'USER' },
    });
    expect(screen.getByTestId('protected-page')).toBeInTheDocument();
  });

  it('redirects to /products when role does not match', () => {
    renderWithAuth(null, {
      initialEntries: ['/seller-only'],
      user: { id: '1', email: 'a@b.com', role: 'USER' },
    });
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
  });

  it('renders children when role matches', () => {
    renderWithAuth(null, {
      initialEntries: ['/seller-only'],
      user: { id: '1', email: 'a@b.com', role: 'SELLER' },
    });
    expect(screen.getByTestId('seller-page')).toBeInTheDocument();
  });
});

describe('PublicRoute', () => {
  beforeEach(() => localStorage.clear());

  it('renders children when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<PublicRoute><div data-testid="login-page" /></PublicRoute>} />
            <Route path="/products" element={<div data-testid="products-page" />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('redirects to /products when authenticated', () => {
    const user = { id: '1', email: 'a@b.com', role: 'USER' };
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem(
      'token',
      'eyJhbGciOiJSUzI1NiJ9.' +
        btoa(JSON.stringify({ sub: user.id, email: user.email, role: user.role })) +
        '.sig'
    );

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<PublicRoute><div data-testid="login-page" /></PublicRoute>} />
            <Route path="/products" element={<div data-testid="products-page" />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
  });
});
