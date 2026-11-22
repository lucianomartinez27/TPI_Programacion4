import { useState } from 'react';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import { useProductos } from '../../catalog/hooks/useCatalog';
import { useAllCategorias, useCreateProductoMutation, useUpdateProductoMutation, useDeleteProductoMutation } from '../hooks/useAdmin';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export function AdminProductosPage() {
  const { data: productos, isLoading } = useProductos(0, 100);
  const { data: categorias } = useAllCategorias();
  const createMutation = useCreateProductoMutation();
  const updateMutation = useUpdateProductoMutation();
  const deleteMutation = useDeleteProductoMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    categoria_id: '',
    nombre: '',
    descripcion: '',
    precio_base: '',
    imagen_url: '',
    stock: '0',
    disponible: true,
  });
  const [error, setError] = useState('');

  const abrirCrear = () => {
    setEditId(null);
    setForm({ categoria_id: '', nombre: '', descripcion: '', precio_base: '', imagen_url: '', stock: '0', disponible: true });
    setError('');
    setModalOpen(true);
  };

  const abrirEditar = (p: any) => {
    setEditId(p.id);
    setForm({
      categoria_id: String(p.categoria_id),
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      precio_base: String(p.precio_base),
      imagen_url: p.imagen_url ?? '',
      stock: String(p.stock),
      disponible: p.disponible,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = {
        categoria_id: Number(form.categoria_id),
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        precio_base: Number(form.precio_base),
        imagen_url: form.imagen_url || undefined,
        stock: Number(form.stock),
        disponible: form.disponible,
      };
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de desactivar este producto?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 mt-1">Gestioná los productos del catálogo</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo producto
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-48" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {productos?.items.map((p) => (
            <Card key={p.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{p.nombre}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.disponible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {p.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-1 text-sm text-gray-500">
                    <span>Cat: {p.categoria?.nombre ?? '-'}</span>
                    <span>Stock: {p.stock}</span>
                    <span className="font-medium text-orange-600">${p.precio_base.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => abrirEditar(p)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Editar producto' : 'Nuevo producto'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={form.categoria_id}
              onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value="">Seleccionar...</option>
              {categorias?.filter((c) => c.activo).map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          <Input
            label="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={2}
            />
          </div>
          <Input
            label="Precio base"
            type="number"
            step="0.01"
            min="0"
            value={form.precio_base}
            onChange={(e) => setForm({ ...form, precio_base: e.target.value })}
            required
          />
          <Input
            label="URL de imagen"
            value={form.imagen_url}
            onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
          />
          <Input
            label="Stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            required
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.disponible}
              onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
              className="text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm">Disponible</span>
          </label>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
