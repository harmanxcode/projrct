import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useRental } from '../contexts/RentalContext';
import { Item } from '../models/types';
import { Package, Search } from 'lucide-react';

const Items: React.FC = () => {
  const { items } = useRental();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    dailyRate: 0,
    totalQuantity: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddItem = () => {
    // In a real app, you would add the item to the database
    // For now, we'll just close the modal
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: name === 'dailyRate' || name === 'totalQuantity' 
        ? parseFloat(value) || 0 
        : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemColumns = [
    { 
      header: 'Name', 
      accessor: (item: Item) => item.name,
      className: 'font-medium text-gray-900'
    },
    { 
      header: 'Description', 
      accessor: (item: Item) => item.description 
    },
    { 
      header: 'Daily Rate', 
      accessor: (item: Item) => `₹${item.dailyRate}` 
    },
    { 
      header: 'Total Quantity', 
      accessor: (item: Item) => item.totalQuantity 
    },
    { 
      header: 'Available', 
      accessor: (item: Item) => (
        <span className={item.availableQuantity < 10 ? 'text-red-600 font-medium' : ''}>
          {item.availableQuantity}
        </span>
      )
    }
  ];

  return (
    <MainLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Items</h1>
          <p className="text-gray-600">Manage your rental inventory</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          icon={<Package className="h-4 w-4" />}
        >
          Add Item
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
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={itemColumns}
        data={filteredItems}
        keyExtractor={(item) => item.id}
        emptyMessage="No items found"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Item"
        footer={
          <>
            <Button 
              onClick={handleAddItem} 
              className="ml-3"
            >
              Save Item
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
            label="Item Name"
            name="name"
            value={newItem.name}
            onChange={handleInputChange}
            error={errors.name}
            placeholder="Enter item name"
          />
          <Input
            label="Description"
            name="description"
            value={newItem.description}
            onChange={handleInputChange}
            error={errors.description}
            placeholder="Enter description"
          />
          <Input
            label="Daily Rate (₹)"
            name="dailyRate"
            type="number"
            value={newItem.dailyRate.toString()}
            onChange={handleInputChange}
            error={errors.dailyRate}
            placeholder="Enter daily rental rate"
            min={0}
            step={0.01}
          />
          <Input
            label="Quantity"
            name="totalQuantity"
            type="number"
            value={newItem.totalQuantity.toString()}
            onChange={handleInputChange}
            error={errors.totalQuantity}
            placeholder="Enter total quantity"
            min={0}
          />
        </div>
      </Modal>
    </MainLayout>
  );
};

export default Items;