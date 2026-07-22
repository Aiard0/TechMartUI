import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { products as productsApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    productsApi
      .getById(id)
      .then((res) => setProduct(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Erro ao carregar produto'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await productsApi.delete(id);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir produto');
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="container" style={{ paddingTop: '2rem' }}><div className="alert alert-error">{error}</div></div>;
  if (!product) return null;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <Link to="/products" className="text-sm" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        &larr; Voltar
      </Link>

      <div className="page-header">
        <h1>{product.name}</h1>
        {user?.role === 'SELLER' && (
          <div className="flex gap-2">
            <Link to={`/products/${id}/edit`} className="btn btn-outline">
              Editar
            </Link>
            <button className="btn btn-danger" onClick={handleDelete}>
              Excluir
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="detail-grid">
          <div className="detail-row">
            <span className="detail-label">ID</span>
            <span className="text-sm">{product.id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Nome</span>
            <span>{product.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Descrição</span>
            <span>{product.description || '-'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Preço</span>
            <span className="font-semibold">
              {product.price.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Quantidade</span>
            <span>{product.quantity}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <span className={`badge ${product.sold ? 'badge-green' : 'badge-blue'}`}>
              {product.sold ? 'Vendido' : 'Disponível'}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Criado em</span>
            <span className="text-sm">{new Date(product.createdAt).toLocaleString('pt-BR')}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Atualizado em</span>
            <span className="text-sm">{new Date(product.updatedAt).toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
