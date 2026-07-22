import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          TechMart
        </NavLink>

        <div className="navbar-nav">
          <NavLink to="/products" end>
            Produtos
          </NavLink>

          {user.role === 'SELLER' && (
            <>
              <NavLink to="/products/new">Novo Produto</NavLink>
              <NavLink to="/sales">Vendas</NavLink>
              <NavLink to="/users">Usuários</NavLink>
            </>
          )}

          {user.role === 'USER' && (
            <NavLink to="/orders">Meus Pedidos</NavLink>
          )}
        </div>

        <div className="navbar-user">
          <span>{user.email}</span>
          <span className={`badge ${user.role === 'SELLER' ? 'badge-yellow' : 'badge-blue'}`}>
            {user.role}
          </span>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
