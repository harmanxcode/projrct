import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { useRental } from '../contexts/RentalContext';
import { Rental } from '../models/types';
import { 
  ShoppingBag, 
  Search, 
  Filter 
} from 'lucide-react';

const Rentals: React.FC = () => {
  const { rentals } = useRental();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultFilter = searchParams.get('filter') || 'all';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(defaultFilter);

  const filteredRentals = useMemo(() => {
    return rentals.filter(rental => {
      // Filter by status
      if (statusFilter === 'pending') {
        if (rental.status === 'returned') return false;
      } else if (statusFilter === 'issued') {
        if (rental.status !== 'issued') return false;
      } else if (statusFilter === 'partially') {
        if (rental.status !== 'partially_returned') return false;
      } else if (statusFilter === 'returned') {
        if (rental.status !== 'returned') return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          rental.customerName.toLowerCase().includes(searchLower) ||
          rental.id.toLowerCase().includes(searchLower) ||
          rental.items.some(item => 
            item.itemName.toLowerCase().includes(searchLower)
          )
        );
      }
      
      return true;
    });
  }, [rentals, statusFilter, searchTerm]);

  const formatDate = (date: Date | null): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const rentalColumns = [
    { 
      header: 'Customer', 
      accessor: (rental: Rental) => rental.customerName,
      className: 'font-medium text-gray-900'
    },
    { 
      header: 'Phone', 
      accessor: (rental: Rental) => rental.customerPhone 
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
      header: 'Items',
      accessor: (rental: Rental) => rental.items.length
    },
    {
      header: 'Amount',
      accessor: (rental: Rental) => `₹${rental.totalAmount.toLocaleString()}`
    }
  ];

  return (
    <MainLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rentals</h1>
          <p className="text-gray-600">Manage all rental transactions</p>
        </div>
        <Button 
          onClick={() => navigate('/new-rental')}
          icon={<ShoppingBag className="h-4 w-4" />}
        >
          New Rental
        </Button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search rentals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Rentals</option>
            <option value="pending">Pending Returns</option>
            <option value="issued">Issued</option>
            <option value="partially">Partially Returned</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      <Table
        columns={rentalColumns}
        data={filteredRentals}
        keyExtractor={(item) => item.id}
        onRowClick={(rental) => {
          navigate(`/rentals/${rental.id}`);
        }}
        emptyMessage="No rental records found"
      />
    </MainLayout>
  );
};

export default Rentals;