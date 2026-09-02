import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Order Management
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-gray-900 text-white">
      <nav className="p-6 space-y-2">
        <Link
          to="/"
          className={`block px-4 py-2 rounded ${
            isActive('/') ? 'bg-blue-600' : 'hover:bg-gray-800'
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/orders"
          className={`block px-4 py-2 rounded ${
            isActive('/orders') ? 'bg-blue-600' : 'hover:bg-gray-800'
          }`}
        >
          Orders
        </Link>
        <Link
          to="/customers"
          className={`block px-4 py-2 rounded ${
            isActive('/customers') ? 'bg-blue-600' : 'hover:bg-gray-800'
          }`}
        >
          Customers
        </Link>
      </nav>
    </aside>
  );
};

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
