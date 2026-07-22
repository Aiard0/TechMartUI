import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { products as productsApi } from '../api/api';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  useEffect(() => {
    if (!isEditing) return;
    productsApi
      .getById(id)
      .then((res) => {
        const p = res.data;
        setForm({
          name: p.name,
          description: p.description || '',
          price: String(p.price),
          quantity: String(p.quantity),
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'Erro ao carregar produto'))
      .finally(() => setFetching(false));
  }, [id, isEditing]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
    };

    try {
      if (isEditing) {
        await productsApi.update(id, payload);
      } else {
        await productsApi.create(payload);
      }
      navigate('/products');
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Erro ao salvar produto.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading">Carregando...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <Link to="/products" className="text-sm" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        &larr; Voltar
      </Link>

      <div className="auth-card" style={{ maxWidth: 560, margin: '0 auto' }}>
        <h1>{isEditing ? 'Editar Produto' : 'Novo Produto'}</h1>
        <p>{isEditing ? 'Altere os dados do produto' : 'Cadastre um novo produto'}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              rows="3"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="price">Preço (R$)</label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="quantity">Quantidade</label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                className="form-input"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex gap-2" style={{ marginTop: '1.5rem' }}>
            <button className="btn btn-primary flex-1" disabled={loading}>
              {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
            </button>
            <Link to="/products" className="btn btn-outline flex-1">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
