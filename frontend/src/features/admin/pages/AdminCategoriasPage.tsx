import { useState } from 'react';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import { useAllCategorias, useCreateCategoriaMutation, useUpdateCategoriaMutation, useDeleteCategoriaMutation } from '../hooks/useAdmin';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export function AdminCategoriasPage() {
  const { data: categorias, isLoading } = useAllCategorias();
  const createMutation = useCreateCategoriaMutation();
  const updateMutation = useUpdateCategoriaMutation();
  const deleteMutation = useDeleteCategoriaMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');

  const abrirCrear = () => {
    setEditId(null);
    setNombre('');
    setDescripcion('');
    setError('');
    setModalOpen(true);
  };

  const abrirEditar = (cat: any) => {
    setEditId(cat.id);
    setNombre(cat.nombre);
    setDescripcion(cat.descripcion ?? '');
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, data: { nombre, descripcion } });
      } else {
        await createMutation.mutateAsync({ nombre, descripcion });
      }
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de desactivar esta categoría?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-500 mt-1">Gestioná las categorías de productos</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva categoría
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
          {categorias?.map((cat) => (
            <Card key={cat.id}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{cat.nombre}</h3>
                  {cat.descripcion && (
                    <p className="text-sm text-gray-500 mt-1">{cat.descripcion}</p>
                  )}
                  <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                    cat.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {cat.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => abrirEditar(cat)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal crear/editar */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Editar categoría' : 'Nueva categoría'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}
          <Input
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
            />
          </div>
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
