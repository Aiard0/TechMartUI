import { useState, useEffect } from 'react';
import { sales as salesApi } from '../api/api';

export default function Sales() {
  const [salesList, setSalesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetail, setProductDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    salesApi
      .list()
      .then((res) => setSalesList(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || 'Erro ao carregar vendas')
      )
      .finally(() => setLoading(false));
  }, []);

  const viewProductSales = async (productId) => {
    setSelectedProduct(productId);
    setDetailLoading(true);
    setProductDetail(null);
    try {
      const res = await salesApi.byProduct(productId);
      setProductDetail(res.data);
    } catch (err) {
      setProductDetail({
        message: err.response?.data?.message || 'Erro ao carregar dados do produto',
      });
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <h1>Vendas</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {salesList.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma venda registrada.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preço</th>
                <th>Comprador</th>
                <th>Quantidade</th>
                <th>Data</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {salesList.map((sale) => (
                <tr key={sale.id}>
                  <td className="font-semibold">{sale.productName || sale.productId}</td>
                  <td>
                    {sale.unitPrice?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="text-sm">{sale.buyerName || '-'}</td>
                  <td>{sale.quantity}</td>
                  <td className="text-sm">
                    {sale.createdAt
                      ? new Date(sale.createdAt).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => viewProductSales(sale.productId)}
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedProduct && (
        <div className="card mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">
              {productDetail ? productDetail.productName : 'Produto'}
            </h2>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setSelectedProduct(null)}
            >
              Fechar
            </button>
          </div>

          {detailLoading ? (
            <div className="loading" style={{ padding: '1rem' }}>
              Carregando...
            </div>
          ) : productDetail ? (
            productDetail.message ? (
              <div className="alert alert-success">{productDetail.message}</div>
            ) : (
              <div className="detail-grid">
                <div className="detail-row">
                  <span className="detail-label">Produto</span>
                  <span>{productDetail.productName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">ID do Produto</span>
                  <span className="text-xs" style={{ fontFamily: 'monospace' }}>
                    {productDetail.productId}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Quantidade Vendida</span>
                  <span className="font-semibold">{productDetail.soldQuantity}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Receita Total</span>
                  <span className="font-semibold">
                    {productDetail.totalRevenue?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              </div>
            )
          ) : null}
        </div>
      )}
    </div>
  );
}
