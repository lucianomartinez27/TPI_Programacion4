# Food Store — Sistema de Pedidos de Comida

Trabajo Práctico Integrador de **Programación 4** — Tecnicatura Universitaria en Programación a Distancia (UTN).

Aplicación web full-stack compuesta por dos proyectos independientes:
- **Backend (`backend/`)**: API REST con **FastAPI**, **SQLModel**, arquitectura en capas (`Router → Service → Unit of Work → Repository → Model`), autenticación **JWT en cookie HttpOnly** y autorización por roles (**RBAC**: `user` y `admin`).
- **Frontend (`frontend/`)**: SPA con **React 19**, **TypeScript** (`strict: true`), **Vite**, **Tailwind CSS 4**, **Axios**, **TanStack Query 5**, **TanStack Form 1**, **TanStack Table 8**, **React Router 7** y **Zustand 5**, organizada con arquitectura por features.

---

## Enlaces de entrega

- **Repositorio GitHub**: `https://github.com/lucianomartinez27/TPI_Programacion4`
- **Video de demostración**: `https://drive.google.com/file/d/1R26IvIAhyy7tC1hxnmgWD9HrEnbuoCBt/view?usp=vids_web`

---

## Requisitos previos

- **Python**: 3.11 a 3.13 *(no usar 3.14 por compatibilidad de SQLModel)*
- **PostgreSQL**: 15 o superior *(para desarrollo local también se admite SQLite cambiando `DATABASE_URL`)*
- **Node.js**: 20.19 o superior
- **pnpm**: 9 o superior

---

## Estructura del proyecto

```text
.
├── README.md
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── core/          # config, database, security, deps, unit_of_work, base_repository
│       ├── db/            # seed.py (idempotente)
│       └── modules/
│           ├── auth/      # registro, login OAuth2 con cookie HttpOnly, logout, /me
│           ├── usuarios/  # modelo Usuario y gestión admin (listar, activar, desactivar)
│           ├── categorias/# CRUD con baja lógica y nombre único
│           ├── productos/ # CRUD, stock/disponibilidad, búsqueda y paginación
│           └── pedidos/   # creación transaccional, máquina de estados, cancelación y resumen
└── frontend/
    ├── .env.example
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── shared/        # api (axios, interceptores, errores, queryClient), ui, components, layout
        ├── store/         # authStore (Zustand + persist + partialize), cartStore, notificationStore
        ├── routes/        # AppRouter, ProtectedRoute por sesión y rol
        └── features/      # auth, categorias, productos, usuarios, pedidos
```

---

## Variables de entorno

### Backend (`backend/.env`)

Copiar `backend/.env.example` a `backend/.env` y completar los valores:

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL o SQLite | `postgresql://postgres:postgres@localhost:5432/foodstore_db` (o `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Clave secreta para firmar los JWT (mínimo 32 caracteres) | `cambiar-esta-clave-secreta-por-una-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo de firma JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token y de la cookie HttpOnly en minutos | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS con credenciales | `http://localhost:5173` |

### Frontend (`frontend/.env`)

Copiar `frontend/.env.example` a `frontend/.env`:

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `VITE_API_URL` | URL base de la API REST del backend | `http://localhost:8000/api/v1` |

---

## Instalación y ejecución

### 1. Backend

```bash
cd backend

# Crear y activar entorno virtual
python -m venv .venv
# En Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# En Linux / macOS:
# source .venv/bin/activate

# Instalar dependencias con versiones fijadas
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# (En Windows PowerShell: Copy-Item .env.example .env)
# Editar .env con tu DATABASE_URL y SECRET_KEY

# Cargar datos iniciales (usuario admin, 4 categorías y 10 productos)
python -m app.db.seed

# Iniciar el servidor de desarrollo
uvicorn app.main:app --reload
```

La API quedará disponible en `http://localhost:8000`, con documentación interactiva en:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 2. Frontend

En otra terminal:

```bash
cd frontend

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# (En Windows PowerShell: Copy-Item .env.example .env)

# Verificar tipado estricto y compilación
pnpm build

# Iniciar servidor de desarrollo
pnpm dev
```

La aplicación quedará disponible en `http://localhost:5173`.

---

## Usuario administrador del seed

Al ejecutar `python -m app.db.seed` (script idempotente) se crea automáticamente:

- **Usuario**: `admin`
- **Contraseña**: `Admin1234!`
- **Rol**: `admin`
- **Datos iniciales**: 4 categorías (`Hamburguesas`, `Pizzas`, `Empanadas`, `Bebidas`) y 10 productos con stock inicial.

Los nuevos clientes pueden registrarse libremente desde `/register` y reciben automáticamente el rol `user`.

---

## Reglas de negocio y arquitectura implementadas

- **Unit of Work y Repository**: `BaseRepository[T]` y `UnitOfWork` con `commit`, `rollback` y `close` exclusivamente en `__exit__`. Ningún `Service` ni `Router` invoca `session.commit()`.
- **Autenticación y RBAC**: JWT emitido en cookie `HttpOnly` (`access_token`) vía formulario OAuth2 (`POST /api/v1/auth/token`), leído únicamente desde la cookie por `get_current_user`, validando cuentas activas con `get_current_active_user` y roles con `require_role`.
- **Pedidos transaccionales (RN-01 a RN-06)**:
  - Descuento de stock y creación de líneas con copia inmutable de `nombre_producto` y `precio_unitario` dentro de una única transacción.
  - Máquina de estados validada en `PedidoService`: `PENDIENTE → EN_PREPARACION | CANCELADO`, `EN_PREPARACION → ENTREGADO | CANCELADO`, con `ENTREGADO` y `CANCELADO` como estados terminales.
  - Cancelación (por el dueño en `PENDIENTE` o por `admin` desde cualquier estado no terminal) con restitución automática de stock en la misma transacción.
- **Separación de estado en Frontend**: TanStack Query para todo el estado del servidor (con invalidación en mutaciones) y Zustand con `persist` para el estado del cliente (`authStore` en `sessionStorage` con `partialize` sin token, y `cartStore` en `localStorage`).
