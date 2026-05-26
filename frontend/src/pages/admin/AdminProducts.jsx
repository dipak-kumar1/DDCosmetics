import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import { Plus, Search, Filter, Edit2, EyeOff, Eye, Package, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await adminApi.put(`/products/${id}/toggle`);
      // Update state locally first to feel super snappy, or re-fetch
      setProducts(prev => 
        prev.map(prod => 
          prod._id === id ? { ...prod, isActive: !prod.isActive } : prod
        )
      );
    } catch (err) {
      alert('Error updating product status');
    }
  };

  const filteredProducts = products.filter(product => 
    (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dynamic Statistics Calculations
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const inactiveProducts = totalProducts - activeProducts;
  const lowStockProducts = products.filter(p => (p.stock || 0) <= 5).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Products Inventory</h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Manage your product catalog, toggle visibility, and monitor stock levels.</p>
        </div>
        <Link 
          to="/admin/add-product" 
          className="flex items-center gap-2 bg-[#fc2779] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#d61f66] hover:shadow-lg hover:shadow-pink-100 transition-all duration-200 active:scale-98 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </Link>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Products</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{loading ? '...' : totalProducts}</h3>
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Catalog</p>
            <h3 className="text-2xl font-extrabold text-emerald-650 mt-1">{loading ? '...' : activeProducts}</h3>
          </div>
        </div>

        {/* Inactive Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-slate-150/40 text-slate-500 rounded-xl flex items-center justify-center font-bold">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Inactive Catalog</p>
            <h3 className="text-2xl font-extrabold text-slate-700 mt-1">{loading ? '...' : inactiveProducts}</h3>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${lowStockProducts > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-amber-50 text-amber-600'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Low/Out of Stock</p>
            <h3 className={`text-2xl font-extrabold mt-1 ${lowStockProducts > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{loading ? '...' : lowStockProducts}</h3>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products by name or category..."
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-[#fc2779] transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-semibold text-sm cursor-pointer w-full sm:w-auto justify-center">
          <Filter className="w-4 h-4 text-slate-450" />
          Filter Options
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-150 table-auto">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product details</th>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Stock levels</th>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Visibility</th>
                <th className="px-6 py-4.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-pink-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm mt-3 font-semibold">Loading your catalog...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-450 font-medium text-sm">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const hasImage = product.images && product.images.length > 0;
                  const firstImage = hasImage ? product.images[0] : 'https://via.placeholder.com/150?text=Product';

                  return (
                    <tr key={product._id} className="hover:bg-slate-50/40 transition-colors duration-150 group">
                      {/* Product details column */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 h-16 w-16 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center relative">
                            <img 
                              src={firstImage} 
                              alt={product.name || 'Product'} 
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-250" 
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Product' }}
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-slate-800 truncate max-w-[280px] leading-snug group-hover:text-[#fc2779] transition-colors">
                              {product.name || 'Unnamed Product'}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className="inline-flex px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-pink-50 text-pink-600 border border-pink-100/60 tracking-wider">
                                {product.category || 'Uncategorized'}
                              </span>
                              {product.isWholesale && (
                                <span className="inline-flex px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-amber-50 text-amber-700 border border-amber-100/60 tracking-wider">
                                  Wholesale
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: {product._id.slice(-6).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price Column */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className="text-sm font-extrabold text-slate-800">
                          ₹{Number(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Stock Column */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        {product.stock === 0 ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                            Out of stock
                          </span>
                        ) : product.stock <= 5 ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                            Low stock: {product.stock} units
                          </span>
                        ) : (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                            {product.stock} units
                          </span>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        {product.isActive ? (
                          <span className="px-3 py-1 inline-flex items-center gap-1.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 inline-flex items-center gap-1.5 text-xs font-bold rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4.5 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2.5">
                          <Link 
                            to={`/admin/edit-product/${product._id}`}
                            className="p-2 bg-slate-50 text-slate-500 border border-slate-200 rounded-xl hover:text-[#fc2779] hover:bg-pink-50 hover:border-pink-200 transition-all duration-150 hover:-translate-y-0.5 shadow-sm"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button 
                            type="button"
                            onClick={() => toggleStatus(product._id)}
                            className={`p-2 rounded-xl border transition-all duration-150 hover:-translate-y-0.5 shadow-sm ${
                              product.isActive 
                                ? 'bg-slate-50 text-slate-500 border border-slate-200 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200' 
                                : 'bg-slate-50 text-slate-500 border border-slate-200 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200'
                            }`}
                            title={product.isActive ? "Deactivate Product" : "Activate Product"}
                          >
                            {product.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info showing items count */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">
            {loading ? 'Counting products...' : `Showing ${filteredProducts.length} of ${products.length} products`}
          </span>
          <div className="flex gap-2">
            <button className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed" disabled>Previous</button>
            <button className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
