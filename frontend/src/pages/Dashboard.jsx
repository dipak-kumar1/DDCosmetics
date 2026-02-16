import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { LayoutDashboard, ShoppingBag, User, MapPin, LogOut, Edit2, Loader } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    gender: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me'); // Or a dedicated profile endpoint if available
        // If /auth/me returns the user object directly or nested
        const userData = res.data.user || res.data; 
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          mobile: userData.mobile || '',
          gender: userData.gender || ''
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/profile', formData);
      setIsEditing(false);
      // Optionally show success message
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'addresses', label: 'Manage Addresses', icon: MapPin },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Welcome Header */}
        <div className="mb-8">
           {/* Can add a welcome banner here if needed */}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* User Info Header */}
              <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-xl">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hello,</p>
                  <h3 className="font-bold text-gray-900 truncate max-w-[150px]">{formData.name}</h3>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === item.id
                          ? 'bg-pink-50 text-pink-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${activeTab === item.id ? 'text-pink-600' : 'text-gray-400'}`} />
                      {item.label}
                    </button>
                  );
                })}
                
                <div className="my-2 border-t border-gray-100"></div>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 text-pink-600 font-medium hover:text-pink-700"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all outline-none"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing} // Usually email is not editable or requires verification
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all outline-none"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter mobile number"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all outline-none"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Gender</label>
                    <div className="flex gap-6 py-2.5">
                      {['Male', 'Female', 'Other'].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value={option.toLowerCase()}
                            checked={formData.gender === option.toLowerCase()}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                          />
                          <span className={`text-sm ${!isEditing ? 'text-gray-500' : 'text-gray-700'}`}>
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Save/Cancel Buttons */}
                {isEditing && (
                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2.5 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                      className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'dashboard' && (
               <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                 <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                    <LayoutDashboard className="w-8 h-8 text-pink-500" />
                 </div>
                 <h3 className="text-lg font-bold text-gray-900 mb-2">Welcome to your Dashboard</h3>
                 <p className="text-gray-500 max-w-sm">
                   From here you can manage your orders, check your profile details, and manage your addresses.
                 </p>
               </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                   <ShoppingBag className="w-8 h-8 text-pink-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-500 max-w-sm">
                  You haven't placed any orders yet. Start shopping to see your orders here!
                </p>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                   <MapPin className="w-8 h-8 text-pink-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Addresses Found</h3>
                <p className="text-gray-500 max-w-sm mb-6">
                  Add a delivery address to checkout faster.
                </p>
                <button className="px-6 py-2.5 border-2 border-pink-500 text-pink-600 font-bold rounded-lg hover:bg-pink-50 transition-colors">
                  Add New Address
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}