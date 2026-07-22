import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { products as productsApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Products() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    productsApi
      .list()
      .then((res) => setList(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Erro ao carregar produtos'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <h1>Produtos</h1>
        {user?.role === 'SELLER' && (
          <Link to="/products/new" className="btn btn-primary">
            Novo Produto
          </Link>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {list.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum produto cadastrado.</p>
        </div>
      ) : (
        <div className="product-grid">
          {list.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="product-card">
                <h3>{p.name}</h3>
                <p className="desc">{p.description}</p>
                <p className="price">
                  {p.price.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
                <div className="flex items-center justify-between">
                  <span className="meta">
                    Qtd: {p.quantity}
                  </span>
                  <span className={`badge ${p.sold ? 'badge-green' : 'badge-blue'}`}>
                    {p.sold ? 'Vendido' : 'Disponível'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
