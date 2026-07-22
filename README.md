# TechMart Frontend

Frontend React + Vite para consumir a API do TechMart.

## Stack

- React 18
- Vite 5
- React Router DOM 6
- Axios

## Setup

```bash
cp .env.example .env   # configure as variáveis
npm install
npm run dev            # http://localhost:5173
```

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_API_URL` | URL base da API (build/produção) | — (usa proxy em dev) |
| `API_PROXY_URL` | URL do proxy no dev server | `http://localhost:8080` |

Em desenvolvimento, o Vite faz proxy de `/api` para o endereço definido em `API_PROXY_URL` (ou `localhost:8080`). Em produção/build, o Axios usa `VITE_API_URL` diretamente.

## Build

```bash
npm run build
```

Gera os arquivos estáticos em `dist/`.

### Deploy no Render (Static Site)

| Config | Valor |
|--------|-------|
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Environment Variable | `VITE_API_URL=https://techmart-1nnt.onrender.com` |

O arquivo `public/_redirects` garante que o React Router funcione corretamente.

## Estrutura

```
src/
├── api/api.js           # Axios + interceptors (JWT, 401)
├── context/AuthContext.jsx  # Estado de autenticação
├── components/
│   ├── Navbar.jsx       # Navegação adaptável por role
│   └── ProtectedRoute.jsx  # Guard de rotas (auth + role)
└── pages/
    ├── Login.jsx        # POST /auth/login
    ├── Register.jsx     # POST /auth/register
    ├── Products.jsx     # GET /products
    ├── ProductDetail.jsx    # GET /products/:id
    ├── ProductForm.jsx      # POST/PUT /products (SELLER)
    ├── Orders.jsx       # POST /orders + GET /orders (USER)
    ├── Sales.jsx        # GET /seller/sales (SELLER)
    ├── Users.jsx        # GET /users (SELLER)
    └── UserDetail.jsx   # GET /users/:id (SELLER)
```

## Endpoints consumidos

| Método | Rota | Role | Página |
|--------|------|------|--------|
| POST | `/auth/register` | — | Register |
| POST | `/auth/login` | — | Login |
| GET | `/products` | autenticado | Products |
| GET | `/products/{id}` | autenticado | ProductDetail |
| POST | `/products` | SELLER | ProductForm |
| PUT | `/products/{id}` | SELLER | ProductForm |
| DELETE | `/products/{id}` | SELLER | ProductDetail |
| GET | `/users` | SELLER | Users |
| GET | `/users/{id}` | SELLER | UserDetail |
| POST | `/orders` | USER | Orders |
| GET | `/orders` | USER | Orders |
| GET | `/seller/sales` | SELLER | Sales |
| GET | `/seller/sales/{productId}` | SELLER | Sales |
