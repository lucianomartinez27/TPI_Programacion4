"""Seed idempotente: crea las tablas y carga datos iniciales si no existen."""

from sqlmodel import Session

from app.core.database import engine, create_all_tables
from app.core.security import get_password_hash
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.usuarios.models import Usuario


def seed():
    """Carga datos iniciales de forma idempotente."""
    create_all_tables()

    with Session(engine) as session:
        try:
            # Admin por defecto
            admin = session.exec(
                Usuario.__table__.select().where(Usuario.email == "admin@foodstore.com")
            ).first()
            if not admin:
                admin = Usuario(
                    username="admin",
                    email="admin@foodstore.com",
                    full_name="Administrador",
                    hashed_password=get_password_hash("Admin1234!"),
                    role="admin",
                )
                session.add(admin)
                session.flush()
                session.commit()

            # Usuario de prueba
            user = session.exec(
                Usuario.__table__.select().where(Usuario.email == "cliente@foodstore.com")
            ).first()
            if not user:
                user = Usuario(
                    username="cliente",
                    email="cliente@foodstore.com",
                    full_name="Cliente Test",
                    hashed_password=get_password_hash("Cliente1234!"),
                    role="user",
                )
                session.add(user)
                session.flush()
                session.commit()

            # Categorías de ejemplo
            categorias = {
                "Hamburguesas": "Las mejores hamburguesas",
                "Pizzas": "Pizzas artesanales",
                "Bebidas": "Refrescos y jugos",
            }
            cat_map = {}
            for nombre, desc in categorias.items():
                cat = session.exec(
                    Categoria.__table__.select().where(Categoria.nombre == nombre)
                ).first()
                if not cat:
                    cat = Categoria(nombre=nombre, descripcion=desc)
                    session.add(cat)
                    session.flush()
                cat_map[nombre] = cat
            session.commit()

            # Productos de ejemplo (8 productos con stock)
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
                prod = session.exec(
                    Producto.__table__.select().where(Producto.nombre == nombre)
                ).first()
                if not prod:
                    prod = Producto(
                        categoria_id=cat.id,
                        nombre=nombre,
                        descripcion=desc,
                        precio_base=precio,
                        stock=stock,
                    )
                    session.add(prod)
                    session.flush()
            session.commit()

        except Exception:
            session.rollback()
            raise
