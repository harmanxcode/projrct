import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { RentalProvider } from './contexts/RentalContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Rentals from './pages/Rentals';
import RentalDetails from './pages/RentalDetails';
import NewRental from './pages/NewRental';
import Items from './pages/Items';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <RentalProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetails />} />
            <Route path="/rentals" element={<Rentals />} />
            <Route path="/rentals/:id" element={<RentalDetails />} />
            <Route path="/new-rental" element={<NewRental />} />
            <Route path="/items" element={<Items />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </RentalProvider>
    </AuthProvider>
  );
}

export default App;