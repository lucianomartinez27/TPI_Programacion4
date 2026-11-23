from sqlmodel import select

from app.core.database import create_all_tables
from app.core.security import hash_password
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

CATEGORIAS_INICIALES = [
    {
        "nombre": "Hamburguesas",
        "descripcion": "Hamburguesas artesanales a la parrilla con pan brioche.",
    },
    {
        "nombre": "Pizzas",
        "descripcion": "Pizzas a la piedra con masa madre y mozzarella seleccionada.",
    },
    {
        "nombre": "Empanadas",
        "descripcion": "Empanadas caseras horneadas y fritas al momento.",
    },
    {
        "nombre": "Bebidas",
        "descripcion": "Gaseosas, aguas saborizadas y cervezas artesanales.",
    },
]

PRODUCTOS_INICIALES = [
    {
        "categoria": "Hamburguesas",
        "nombre": "Hamburguesa Clásica Doble",
        "descripcion": "Doble medallón de carne vacuna, cheddar, lechuga, tomate y salsa especial.",
        "precio_base": 9500.0,
        "imagen_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "stock": 25,
    },
    {
        "categoria": "Hamburguesas",
        "nombre": "Hamburguesa Crispy Bacon",
        "descripcion": "Medallón smash, panceta crocante, cebolla caramelizada y barbacoa ahumada.",
        "precio_base": 10800.0,
        "imagen_url": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80",
        "stock": 20,
    },
    {
        "categoria": "Hamburguesas",
        "nombre": "Hamburguesa Veggie NotBurger",
        "descripcion": "Medallón de lentejas y hongos portobello, rúcula, queso tybo y alioli.",
        "precio_base": 9200.0,
        "imagen_url": "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80",
        "stock": 15,
    },
    {
        "categoria": "Pizzas",
        "nombre": "Pizza Muzzarella Grande",
        "descripcion": "Salsa de tomate casera, abundante mozzarella, orégano y aceitunas verdes.",
        "precio_base": 12500.0,
        "imagen_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
        "stock": 18,
    },
    {
        "categoria": "Pizzas",
        "nombre": "Pizza Napolitana",
        "descripcion": "Mozzarella, rodajas de tomate fresco, ajo perejil y aceite de oliva.",
        "precio_base": 13800.0,
        "imagen_url": "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=800&q=80",
        "stock": 16,
    },
    {
        "categoria": "Pizzas",
        "nombre": "Pizza Pepperoni",
        "descripcion": "Mozzarella fundida con láminas de pepperoni ligeramente picante.",
        "precio_base": 14900.0,
        "imagen_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80",
        "stock": 14,
    },
    {
        "categoria": "Empanadas",
        "nombre": "Empanadas de Carne Cortada a Cuchillo (x6)",
        "descripcion": "Media docena de empanadas salteñas jugosas con huevo y cebolla de verdeo.",
        "precio_base": 7800.0,
        "imagen_url": "https://images.unsplash.com/photo-1619221882220-947b3d3c8861?auto=format&fit=crop&w=800&q=80",
        "stock": 30,
    },
    {
        "categoria": "Empanadas",
        "nombre": "Empanadas de Jamón y Queso (x6)",
        "descripcion": "Media docena de empanadas horneadas rellenas de jamón cocido y mozzarella.",
        "precio_base": 7400.0,
        "imagen_url": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
        "stock": 28,
    },
    {
        "categoria": "Bebidas",
        "nombre": "Coca-Cola 1.5L",
        "descripcion": "Gaseosa sabor cola bien fría para compartir.",
        "precio_base": 3500.0,
        "imagen_url": "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80",
        "stock": 40,
    },
    {
        "categoria": "Bebidas",
        "nombre": "Limonada Casera con Menta y Jengibre 500ml",
        "descripcion": "Exprimida en el día con limones frescos, menta y un toque de jengibre.",
        "precio_base": 2900.0,
        "imagen_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "stock": 35,
    },
]


def seed() -> None:
    create_all_tables()
    with UnitOfWork() as uow:
        session = uow.session
        # 1. Usuario administrador (idempotente)
        admin = session.exec(
            select(Usuario).where(Usuario.username == "admin")
        ).first()
        if admin is None:
            admin = Usuario(
                username="admin",
                full_name="Administrador Food Store",
                email="admin@foodstore.com",
                hashed_password=hash_password("Admin1234!"),
                role="admin",
                disabled=False,
            )
            session.add(admin)
            session.flush()
            print("Usuario 'admin' creado.")
        else:
            print("Usuario 'admin' ya existe.")

        # 2. Categorías (idempotente)
        mapa_categorias: dict[str, Categoria] = {}
        for cat_data in CATEGORIAS_INICIALES:
            cat = session.exec(
                select(Categoria).where(Categoria.nombre == cat_data["nombre"])
            ).first()
            if cat is None:
                cat = Categoria(
                    nombre=cat_data["nombre"],
                    descripcion=cat_data["descripcion"],
                    activo=True,
                )
                session.add(cat)
                session.flush()
                print(f"Categoría '{cat.nombre}' creada.")
            mapa_categorias[cat.nombre] = cat

        # 3. Productos (idempotente por nombre)
        for prod_data in PRODUCTOS_INICIALES:
            existente = session.exec(
                select(Producto).where(Producto.nombre == prod_data["nombre"])
            ).first()
            if existente is None:
                categoria = mapa_categorias[prod_data["categoria"]]
                producto = Producto(
                    categoria_id=categoria.id,  # type: ignore[arg-type]
                    nombre=prod_data["nombre"],
                    descripcion=prod_data["descripcion"],
                    precio_base=prod_data["precio_base"],
                    imagen_url=prod_data["imagen_url"],
                    stock=prod_data["stock"],
                    disponible=True,
                    activo=True,
                )
                session.add(producto)
                session.flush()
                print(f"Producto '{producto.nombre}' creado.")

    print("Seed completado correctamente.")


if __name__ == "__main__":
    seed()
