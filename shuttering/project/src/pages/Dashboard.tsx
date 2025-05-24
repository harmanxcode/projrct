import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { useRental } from '../contexts/RentalContext';
import { Rental } from '../models/types';
import { Users, Package, ShoppingCart, AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { rentals, customers, items, getPendingReturns } = useRental();
  
  const pendingReturns = getPendingReturns();
  
  const formatDate = (date: Date | null): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const rentalColumns = [
    { 
      header: 'Customer', 
      accessor: (rental: Rental) => rental.customerName 
    },
    { 
      header: 'Issue Date', 
      accessor: (rental: Rental) => formatDate(rental.issueDate) 
    },
    {
      header: 'Status',
      accessor: (rental: Rental) => {
        switch (rental.status) {
          case 'issued':
            return <Badge variant="info">Issued</Badge>;
          case 'partially_returned':
            return <Badge variant="warning">Partially Returned</Badge>;
          case 'returned':
            return <Badge variant="success">Returned</Badge>;
          default:
            return null;
        }
      }
    },
    {
      header: 'Total Items',
      accessor: (rental: Rental) => rental.items.length
    },
    {
      header: 'Amount',
      accessor: (rental: Rental) => `₹${rental.totalAmount.toLocaleString()}`
    }
  ];

  const statsCards = [
    {
      title: 'Total Customers',
      value: customers.length,
      icon: <Users className="h-8 w-8 text-blue-500" />,
      color: 'bg-blue-50 text-blue-500',
      link: '/customers'
    },
    {
      title: 'Total Items',
      value: items.length,
      icon: <Package className="h-8 w-8 text-green-500" />,
      color: 'bg-green-50 text-green-500',
      link: '/items'
    },
    {
      title: 'Active Rentals',
      value: pendingReturns.length,
      icon: <ShoppingCart className="h-8 w-8 text-orange-500" />,
      color: 'bg-orange-50 text-orange-500',
      link: '/rentals'
    },
    {
      title: 'Pending Returns',
      value: pendingReturns.filter(r => r.status !== 'returned').length,
      icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
      color: 'bg-red-50 text-red-500',
      link: '/rentals?filter=pending'
    }
  ];

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to Shuttering Rental Management System</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <Card key={index} className="transition-all duration-300 hover:shadow-lg">
            <Link to={card.link} className="block">
              <div className="flex items-center">
                <div className={`p-3 rounded-full mr-4 ${card.color}`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Rentals</h2>
            <Link to="/rentals">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <Table
            columns={rentalColumns}
            data={rentals.slice(0, 5)}
            keyExtractor={(item) => item.id}
            onRowClick={(rental) => {
              window.location.href = `/rentals/${rental.id}`;
            }}
            emptyMessage="No rental records found"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Pending Returns</h2>
            <Link to="/rentals?filter=pending">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <Table
            columns={rentalColumns}
            data={pendingReturns.slice(0, 5)}
            keyExtractor={(item) => item.id}
            onRowClick={(rental) => {
              window.location.href = `/rentals/${rental.id}`;
            }}
            emptyMessage="No pending returns"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;