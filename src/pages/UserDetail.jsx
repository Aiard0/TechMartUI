import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { users as usersApi } from '../api/api';

export default function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    usersApi
      .getById(id)
      .then((res) => setUser(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || 'Erro ao carregar usuário')
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="container" style={{ paddingTop: '2rem' }}><div className="alert alert-error">{error}</div></div>;
  if (!user) return null;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <Link to="/users" className="text-sm" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        &larr; Voltar
      </Link>

      <div className="page-header">
        <h1>
          {user.firstName} {user.lastName}
        </h1>
      </div>

      <div className="card">
        <div className="detail-grid">
          <div className="detail-row">
            <span className="detail-label">ID</span>
            <span className="text-sm" style={{ fontFamily: 'monospace' }}>{user.id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Nome</span>
            <span>
              {user.firstName} {user.lastName}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Função</span>
            <span className={`badge ${user.role === 'SELLER' ? 'badge-yellow' : user.role === 'ADMIN' ? 'badge-green' : 'badge-blue'}`}>
              {user.role}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Criado em</span>
            <span className="text-sm">
              {new Date(user.createdAt).toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
