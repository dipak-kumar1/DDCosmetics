import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Trash2, Plus, Edit, ArrowUp, ArrowDown, ToggleLeft, ToggleRight, Check, X } from 'lucide-react';
import * as Icons from 'lucide-react';

const DynamicIcon = ({ name, className }) => {
  const IconComponent = Icons[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
};

const AVAILABLE_ICONS = [
  'Smartphone',
  'MapPin',
  'HelpCircle',
  'Percent',
  'Gift',
  'Tag',
  'Flame',
  'Sparkles',
  'Bell',
  'Info',
  'Phone',
  'Mail',
  'User',
  'ShoppingBag',
  'Star',
  'Heart'
];

const AdminUtilityBar = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    label: '',
    icon: 'Smartphone',
    link: '',
    badge: '',
    isActive: true,
    order: 0
  });

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('dd_admin_token')}`
    }
  });

  const fetchItems = async () => {
    try {
      const res = await api.get('/utility-bar/admin', getAuthHeaders());
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching utility bar items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEditClick = (item) => {
    setEditingId(item._id);
    setFormData({
      label: item.label,
      icon: item.icon || 'Smartphone',
      link: item.link,
      badge: item.badge || '',
      isActive: item.isActive,
      order: item.order
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      label: '',
      icon: 'Smartphone',
      link: '',
      badge: '',
      isActive: true,
      order: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.label || !formData.link) {
      return alert('Label and Link are required.');
    }

    setSaving(true);
    try {
      if (editingId) {
        // Edit Item
        await api.put(`/utility-bar/${editingId}`, formData, getAuthHeaders());
        alert('Utility item updated successfully');
      } else {
        // Create Item
        // Auto-assign order based on length to append to end
        const nextOrder = items.length > 0 ? Math.max(...items.map(i => i.order || 0)) + 1 : 0;
        await api.post('/utility-bar', { ...formData, order: nextOrder }, getAuthHeaders());
        alert('Utility item added successfully');
      }
      setEditingId(null);
      setFormData({
        label: '',
        icon: 'Smartphone',
        link: '',
        badge: '',
        isActive: true,
        order: 0
      });
      fetchItems();
    } catch (err) {
      console.error('Error saving utility bar item:', err);
      alert('Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/utility-bar/${id}`, getAuthHeaders());
      setItems(items.filter(item => item._id !== id));
    } catch (err) {
      console.error('Error deleting utility bar item:', err);
      alert('Failed to delete item');
    }
  };

  const toggleStatus = async (item) => {
    try {
      const updatedItem = { ...item, isActive: !item.isActive };
      await api.put(`/utility-bar/${item._id}`, { isActive: updatedItem.isActive }, getAuthHeaders());
      setItems(items.map(i => i._id === item._id ? updatedItem : i));
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleMove = async (index, direction) => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    // Swap order values in DB
    const tempOrder = newItems[index].order;
    newItems[index].order = newItems[targetIndex].order;
    newItems[targetIndex].order = tempOrder;

    // Reorder local state temporarily
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    
    setItems(newItems);

    try {
      // Bulk update DB ordering
      const payload = newItems.map((item, idx) => ({
        id: item._id,
        order: idx
      }));
      const res = await api.put('/utility-bar/reorder', { items: payload }, getAuthHeaders());
      setItems(res.data);
    } catch (err) {
      console.error('Error saving reordered items:', err);
      fetchItems(); // Restore original items
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 font-sans">Top Utility Bar Management</h1>
      </div>

      {/* Form Section */}
      <div className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-200/80 font-sans">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {editingId ? <Edit className="w-5 h-5 text-indigo-600" /> : <Plus className="w-5 h-5 text-indigo-600" />}
          {editingId ? 'Edit Utility Item' : 'Add New Utility Item'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Label *</label>
              <input
                type="text"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Get App"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link URL *</label>
              <input
                type="text"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. /wholesale or https://google.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lucide Icon</label>
              <select
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                {AVAILABLE_ICONS.map((iconName) => (
                  <option key={iconName} value={iconName}>
                    {iconName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge Tag (Optional)</label>
              <input
                type="text"
                name="badge"
                value={formData.badge}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. HOT, NEW"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Active (Visible to users)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#fc2779] text-white px-6 py-2.5 rounded-lg hover:bg-[#e01a6b] disabled:bg-[#fca5c5] font-bold transition-all shadow-sm flex items-center gap-2"
              style={{ backgroundColor: '#fc2779', color: '#ffffff' }}
            >
              {saving ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-sans">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Existing Utility Items</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No items configured yet. Add your first item above!</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Sort</th>
                  <th className="p-4">Icon</th>
                  <th className="p-4">Label</th>
                  <th className="p-4">Link URL</th>
                  <th className="p-4">Badge</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Sort buttons */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-150 rounded text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === items.length - 1}
                          className="p-1 hover:bg-gray-150 rounded text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    {/* Icon preview */}
                    <td className="p-4">
                      {item.icon ? (
                        <div className="w-8 h-8 rounded-lg bg-pink-50 text-[#fc2779] flex items-center justify-center border border-pink-100/45 shadow-inner">
                          <DynamicIcon name={item.icon} className="w-4 h-4" />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No Icon</span>
                      )}
                    </td>

                    {/* Label */}
                    <td className="p-4 font-bold text-gray-900 text-sm">{item.label}</td>

                    {/* Link */}
                    <td className="p-4 text-gray-600 text-sm font-mono truncate max-w-[200px]" title={item.link}>{item.link}</td>

                    {/* Badge */}
                    <td className="p-4">
                      {item.badge ? (
                        <span className="px-2 py-0.5 text-[9px] font-black bg-gradient-to-r from-pink-500 to-[#fc2779] text-white rounded-full uppercase tracking-widest shadow-xs">
                          {item.badge}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>

                    {/* Status toggler */}
                    <td className="p-4 text-center">
                      <button onClick={() => toggleStatus(item)} className="focus:outline-none transition-colors">
                        {item.isActive ? (
                          <ToggleRight className="w-7 h-7 text-indigo-600" />
                        ) : (
                          <ToggleLeft className="w-7 h-7 text-gray-350" />
                        )}
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Item"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUtilityBar;
