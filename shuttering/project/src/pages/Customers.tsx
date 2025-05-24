import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useRental } from '../contexts/RentalContext';
import { Customer } from '../models/types';
import { UserPlus, Search, Trash2 } from 'lucide-react';

const Customers: React.FC = () => {
  const { customers, addCustomer, deleteCustomer, rentals } = useRental();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddCustomer = () => {
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!newCustomer.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!newCustomer.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Add customer
    addCustomer(newCustomer);
    
    // Reset form and close modal
    setNewCustomer({
      name: '',
      phone: '',
      address: ''
    });
    setErrors({});
    setIsModalOpen(false);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!customerToDelete) return;

    try {
      deleteCustomer(customerToDelete.id);
      setIsDeleteModalOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ delete: error.message });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const customerColumns = [
    { 
      header: 'Name', 
      accessor: (customer: Customer) => customer.name,
      className: 'font-medium text-gray-900'
    },
    { 
      header: 'Phone', 
      accessor: (customer: Customer) => customer.phone 
    },
    { 
      header: 'Address', 
      accessor: (customer: Customer) => customer.address 
    },
    { 
      header: 'Created', 
      accessor: (customer: Customer) => new Date(customer.createdAt).toLocaleDateString() 
    },
    {
      header: 'Actions',
      accessor: (customer: Customer) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteCustomer(customer);
          }}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )
    }
  ];

  return (
    <MainLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer accounts</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          icon={<UserPlus className="h-4 w-4" />}
        >
          Add Customer
        </Button>
      </div>

      <div className="mb-6 flex">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={customerColumns}
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        onRowClick={(customer) => {
          navigate(`/customers/${customer.id}`);
        }}
        emptyMessage="No customers found"
      />

      {/* Add Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Customer"
        footer={
          <>
            <Button 
              onClick={handleAddCustomer} 
              className="ml-3"
            >
              Save Customer
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Customer Name"
            name="name"
            value={newCustomer.name}
            onChange={handleInputChange}
            error={errors.name}
            placeholder="Enter customer name"
          />
          <Input
            label="Phone Number"
            name="phone"
            value={newCustomer.phone}
            onChange={handleInputChange}
            error={errors.phone}
            placeholder="Enter phone number"
          />
          <Input
            label="Address"
            name="address"
            value={newCustomer.address}
            onChange={handleInputChange}
            error={errors.address}
            placeholder="Enter address"
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCustomerToDelete(null);
          setErrors({});
        }}
        title="Delete Customer"
        footer={
          <>
            <Button 
              onClick={confirmDelete}
              variant="danger"
              className="ml-3"
            >
              Delete
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsDeleteModalOpen(false);
                setCustomerToDelete(null);
                setErrors({});
              }}
            >
              Cancel
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {errors.delete ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Trash2 className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errors.delete}</p>
                </div>
              </div>
            </div>
          ) : (
            <p>
              Are you sure you want to delete customer "{customerToDelete?.name}"? 
              This action cannot be undone.
            </p>
          )}
        </div>
      </Modal>
    </MainLayout>
  );
};

export default Customers