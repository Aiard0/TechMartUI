import { useState, useEffect } from 'react';
import { orders as ordersApi, products as productsApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const { user } = useAuth();
  const [orderList, setOrderList] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [cart, setCart] = useState([{ productId: '', quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = () => {
    ordersApi
      .list()
      .then((res) => setOrderList(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    Promise.all([
      productsApi.list(),
      ordersApi.list(),
    ])
      .then(([prodRes, orderRes]) => {
        setProducts(prodRes.data);
        setOrderList(orderRes.data);
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Erro ao carregar dados')
      )
      .finally(() => setLoading(false));
  }, []);

  const handleCartChange = (index, field, value) => {
    const updated = [...cart];
    updated[index] = { ...updated[index], [field]: value };
    setCart(updated);
  };

  const addItem = () => {
    setCart([...cart, { productId: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    if (cart.length === 1) return;
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const items = cart.map((item) => ({
      productId: item.productId,
      quantity: parseInt(item.quantity, 10),
    }));

    try {
      await ordersApi.create({ items });
      setCart([{ productId: '', quantity: 1 }]);
      setShowForm(false);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao realizar pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <h1>Meus Pedidos</h1>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Novo Pedido
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="card mb-4">
          <h2 className="font-semibold" style={{ marginBottom: '1rem' }}>
            Novo Pedido
          </h2>
          <form onSubmit={handleSubmitOrder}>
            {cart.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2" style={{ marginBottom: '.75rem' }}>
                <div style={{ flex: 2 }}>
                  <select
                    className="form-input"
                    value={item.productId}
                    onChange={(e) => handleCartChange(idx, 'productId', e.target.value)}
                    required
                  >
                    <option value="">Selecione um produto</option>
                    {products
                      .filter((p) => !p.sold && p.quantity > 0)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} -{' '}
                          {p.price.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </option>
                      ))}
                  </select>
                </div>
                <div style={{ width: 100 }}>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleCartChange(idx, 'quantity', e.target.value)}
                    required
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => removeItem(idx)}
                  disabled={cart.length === 1}
                >
                  Remover
                </button>
              </div>
            ))}

            <div className="flex gap-2" style={{ marginTop: '.5rem' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>
                + Adicionar item
              </button>
              <button className="btn btn-primary btn-sm ml-auto" disabled={submitting}>
                {submitting ? 'Confirmando...' : 'Confirmar Pedido'}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {orderList.length === 0 ? (
        <div className="empty-state">
          <p>Você ainda não fez nenhum pedido.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Data</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orderList.map((order) => (
                <tr key={order.id}>
                  <td className="text-xs" style={{ fontFamily: 'monospace' }}>
                    {order.id.substring(0, 8)}...
                  </td>
                  <td>
                    {order.items.map((item) => (
                      <div key={item.id} className="text-sm">
                        {item.productName} x{item.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="font-semibold">
                    {order.totalPrice.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="text-sm">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    <details style={{ cursor: 'pointer' }}>
                      <summary className="text-sm">Detalhes</summary>
                      <div style={{ marginTop: '.5rem', fontSize: '.8125rem' }}>
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between" style={{ padding: '.25rem 0' }}>
                            <span>{item.productName}</span>
                            <span>
                              {item.quantity}x{' '}
                              {item.unitPrice.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
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
