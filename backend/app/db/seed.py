"""Seed idempotente: crea las tablas y carga datos iniciales si no existen."""

from app.core.database import create_all_tables, session_factory
from app.core.security import get_password_hash
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.models import Categoria
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.models import Producto
from app.modules.productos.repository import ProductoRepository
from app.modules.pedidos.models import DetallePedido, Pedido  # noqa: F401
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository


class SeedUnitOfWork(UnitOfWork):
    """Unit of Work para la carga inicial de datos (usuarios, categorías y productos)."""

    usuarios: UsuarioRepository
    categorias: CategoriaRepository
    productos: ProductoRepository

    def __enter__(self) -> "SeedUnitOfWork":
        super().__enter__()
        self.usuarios = UsuarioRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self


def seed():
    """Carga datos iniciales de forma idempotente en una única transacción."""
    create_all_tables()

    with SeedUnitOfWork(session_factory) as uow:
        # Admin por defecto
        admin = uow.usuarios.get_by_email("admin@foodstore.com")
        if not admin:
            admin = Usuario(
                username="admin",
                email="admin@foodstore.com",
                full_name="Administrador",
                hashed_password=get_password_hash("Admin1234!"),
                role="admin",
            )
            uow.usuarios.add(admin)

        # Usuario de prueba
        user = uow.usuarios.get_by_email("cliente@foodstore.com")
        if not user:
            user = Usuario(
                username="cliente",
                email="cliente@foodstore.com",
                full_name="Cliente Test",
                hashed_password=get_password_hash("Cliente1234!"),
                role="user",
            )
            uow.usuarios.add(user)

        # Categorías de ejemplo
        categorias = {
            "Hamburguesas": "Las mejores hamburguesas",
            "Pizzas": "Pizzas artesanales",
            "Bebidas": "Refrescos y jugos",
        }
        cat_map = {}
        for nombre, desc in categorias.items():
            cat = uow.categorias.get_by_name(nombre)
            if not cat:
                cat = Categoria(nombre=nombre, descripcion=desc)
                uow.categorias.add(cat)
            cat_map[nombre] = cat

        # Productos de ejemplo (8 productos con stock)
        existing_names = {p.nombre for p in uow.productos.get_all(skip=0, limit=1000)}
        productos_data = [
            ("Hamburguesa Clásica", "Carne, lechuga, tomate", cat_map["Hamburguesas"], 250.0, 20),
            ("Hamburguesa Doble", "Doble carne, queso", cat_map["Hamburguesas"], 350.0, 15),
            ("Hamburguesa BBQ", "Carne, bacon, salsa BBQ", cat_map["Hamburguesas"], 380.0, 12),
            ("Pizza Margarita", "Mozzarella, tomate, albahaca", cat_map["Pizzas"], 400.0, 10),
            ("Pizza Pepperoni", "Mozzarella, pepperoni", cat_map["Pizzas"], 450.0, 8),
            ("Coca Cola", "Refresco 500ml", cat_map["Bebidas"], 80.0, 50),
            ("Jugo de Naranja", "Jugo natural 300ml", cat_map["Bebidas"], 100.0, 30),
            ("Agua Mineral", "Agua sin gas 500ml", cat_map["Bebidas"], 50.0, 40),
        ]
        for nombre, desc, cat, precio, stock in productos_data:
            if nombre not in existing_names:
                prod = Producto(
                    categoria_id=cat.id,
                    nombre=nombre,
                    descripcion=desc,
                    precio_base=precio,
                    stock=stock,
                )
                uow.productos.add(prod)


if __name__ == "__main__":
    seed()
