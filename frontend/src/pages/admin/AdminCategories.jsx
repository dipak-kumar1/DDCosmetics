import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { Layers, Plus, Hash, ToggleLeft, ToggleRight, Trash2, Edit2, Search } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', image: null });
  const [editingCategory, setEditingCategory] = useState(null); // Track category being edited
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await adminApi.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setNewCategory({ name: cat.name, slug: cat.slug, image: null }); // Keep image null unless changed
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setNewCategory({ name: '', slug: '', image: null });
    document.getElementById('cat-image-input').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', newCategory.name);
      formData.append('slug', newCategory.slug);
      if (newCategory.image) {
        formData.append('image', newCategory.image);
      }

      if (editingCategory) {
        // Update existing category
        await adminApi.put(`/categories/${editingCategory._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setEditingCategory(null);
      } else {
        // Create new category
        await adminApi.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setNewCategory({ name: '', slug: '', image: null });
      document.getElementById('cat-image-input').value = '';
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || `Error ${editingCategory ? 'updating' : 'adding'} category`);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await adminApi.put(`/categories/${id}`, { isActive: !currentStatus });
      fetchCategories();
    } catch (err) {
      alert('Error updating category');
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
          <p className="text-gray-500 mt-1">Manage your product categories</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Category Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              {editingCategory ? (
                <>
                  <Edit2 className="w-5 h-5 text-indigo-600" />
                  Edit Category
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-indigo-600" />
                  Add New Category
                </>
              )}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Category Image</label>
                {editingCategory && editingCategory.image && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Current Image:</p>
                    <img src={editingCategory.image} alt="Current" className="h-16 w-16 object-cover rounded-md border" />
                  </div>
                )}
                <input
                  id="cat-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewCategory({ ...newCategory, image: e.target.files[0] })}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Layers className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Skincare"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Slug</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. skincare"
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">URL-friendly version of the name.</p>
              </div>

              <div className="flex gap-2">
                <button 
                  type="submit" 
                  className={`flex-1 flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm hover:shadow text-white ${
                    editingCategory ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {editingCategory ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
                
                {editingCategory && (
                  <button 
                    type="button" 
                    onClick={cancelEdit}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
              <h3 className="font-semibold text-gray-800">All Categories</h3>
              <div className="relative max-w-xs w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                        Loading categories...
                      </td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => (
                      <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-200">
                            {cat.image ? (
                              <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                {cat.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{cat.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block font-mono">
                            {cat.slug}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            cat.isActive 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {cat.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors mr-2"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => toggleStatus(cat._id, cat.isActive)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              cat.isActive 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                          >
                            {cat.isActive ? (
                              <><ToggleRight className="w-4 h-4" /> Disable</>
                            ) : (
                              <><ToggleLeft className="w-4 h-4" /> Enable</>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
