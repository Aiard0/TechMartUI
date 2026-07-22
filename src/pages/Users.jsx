import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { users as usersApi } from '../api/api';

export default function Users() {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    usersApi
      .list()
      .then((res) => setUserList(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || 'Erro ao carregar usuários')
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <h1>Usuários</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {userList.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum usuário cadastrado.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Função</th>
                <th>Criado em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {userList.map((u) => (
                <tr key={u.id}>
                  <td className="font-semibold">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="text-sm">{u.email}</td>
                  <td>
                    <span
                      className={`badge ${
                        u.role === 'SELLER' ? 'badge-yellow' : u.role === 'ADMIN' ? 'badge-green' : 'badge-blue'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="text-sm">
                    {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    <Link to={`/users/${u.id}`} className="btn btn-outline btn-sm">
                      Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
