import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PanelRight, LogOut, PenTool as Tool } from 'lucide-react';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center">
            <Tool className="h-8 w-8 mr-2" />
            <Link to="/" className="text-xl font-bold">
              Shuttering Rental
            </Link>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center">
              <nav className="hidden md:flex space-x-1 mr-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive('/')}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/customers"
                  className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive('/customers')}`}
                >
                  Customers
                </Link>
                <Link
                  to="/rentals"
                  className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive('/rentals')}`}
                >
                  Rentals
                </Link>
                <Link
                  to="/items"
                  className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive('/items')}`}
                >
                  Items
                </Link>
              </nav>
              
              <div className="flex items-center">
                <span className="mr-3 text-sm hidden md:inline">
                  {user?.name}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={logout}
                  className="text-white border-white hover:bg-blue-700"
                  icon={<LogOut className="h-4 w-4" />}
                >
                  <span className="hidden md:inline">Logout</span>
                </Button>
                
                <div className="md:hidden ml-2">
                  <button className="p-1 focus:outline-none">
                    <PanelRight className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-blue-700">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;