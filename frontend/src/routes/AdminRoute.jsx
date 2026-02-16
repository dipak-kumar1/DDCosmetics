import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const token = localStorage.getItem('dd_admin_token');
  const userStr = localStorage.getItem('dd_admin_user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
