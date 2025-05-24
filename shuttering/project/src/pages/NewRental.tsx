import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useRental } from '../contexts/RentalContext';
import { Customer, RentalItem } from '../models/types';
import { 
  ArrowLeft,
  Plus,
  Trash2,
  ArrowRight
} from 'lucide-react';

const NewRental: React.FC = () => {
  const navigate = useNavigate();
  const { customers, items, addRental, addCustomer } = useRental();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: ''
  });
  
  const [selectedItems, setSelectedItems] = useState<
    {
      itemId: string;
      itemName: string;
      quantity: number;
      dailyRate: number;
      issueDate: string;
    }[]
  >([]);
  
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleCreateNewCustomer = () => {
    // Validate customer form
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
    const customer = addCustomer(newCustomer);
    setSelectedCustomerId(customer.id);
    setIsNewCustomer(false);
    
    // Reset form
    setNewCustomer({
      name: '',
      phone: '',
      address: ''
    });
    setErrors({});
  };

  const handleCustomerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const addItem = () => {
    if (!selectedItemId || selectedQuantity <= 0) return;
    
    const item = items.find(item => item.id === selectedItemId);
    if (!item) return;

    // Check if quantity is available
    if (selectedQuantity > item.availableQuantity) {
      setErrors({ quantity: `Only ${item.availableQuantity} available` });
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        itemId: item.id,
        itemName: item.name,
        quantity: selectedQuantity,
        dailyRate: item.dailyRate,
        issueDate: issueDate
      }
    ]);

    // Reset form
    setSelectedItemId('');
    setSelectedQuantity(1);
    setErrors({});
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleCreateRental = () => {
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!selectedCustomerId) {
      newErrors.customer = 'Please select a customer';
    }
    if (selectedItems.length === 0) {
      newErrors.items = 'Please add at least one item';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Get customer
    const customer = customers.find(c => c.id === selectedCustomerId) as Customer;

    // Create rental
    const newRental = {
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      issueDate: new Date(),
      returnDate: null,
      status: 'issued' as const,
      items: selectedItems.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        dailyRate: item.dailyRate,
        issueDate: new Date(item.issueDate)
      })),
      totalAmount: 0,
      paidAmount: 0,
      balance: 0
    };

    const rental = addRental(newRental);
    navigate(`/rentals/${rental.id}`);
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <Link 
          to="/rentals" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Rentals
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Rental</h1>
        <p className="text-gray-600">Issue items to a customer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          
          {!isNewCustomer ? (
            <div className="space-y-4">
              <Select
                label="Select Customer"
                value={selectedCustomerId}
                onChange={setSelectedCustomerId}
                options={[
                  { value: '', label: 'Select a customer...' },
                  ...customers.map(customer => ({
                    value: customer.id,
                    label: `${customer.name} (${customer.phone})`
                  }))
                ]}
                error={errors.customer}
              />
              
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsNewCustomer(true)}
                >
                  + Add New Customer
                </Button>
              </div>

              {selectedCustomerId && (
                <div className="mt-4 bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium text-blue-800 mb-2">Selected Customer</h3>
                  {(() => {
                    const customer = customers.find(c => c.id === selectedCustomerId);
                    if (!customer) return null;
                    
                    return (
                      <div className="space-y-2">
                        <p><span className="font-medium">Name:</span> {customer.name}</p>
                        <p><span className="font-medium">Phone:</span> {customer.phone}</p>
                        <p><span className="font-medium">Address:</span> {customer.address || 'Not provided'}</p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                label="Customer Name"
                name="name"
                value={newCustomer.name}
                onChange={handleCustomerInputChange}
                error={errors.name}
                placeholder="Enter customer name"
              />
              <Input
                label="Phone Number"
                name="phone"
                value={newCustomer.phone}
                onChange={handleCustomerInputChange}
                error={errors.phone}
                placeholder="Enter phone number"
              />
              <Input
                label="Address"
                name="address"
                value={newCustomer.address}
                onChange={handleCustomerInputChange}
                error={errors.address}
                placeholder="Enter address"
              />
              
              <div className="flex space-x-3">
                <Button 
                  onClick={handleCreateNewCustomer}
                  className="flex-grow"
                >
                  Save Customer
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setIsNewCustomer(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Rental Items</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <Select
                label="Select Item"
                value={selectedItemId}
                onChange={setSelectedItemId}
                options={[
                  { value: '', label: 'Select an item...' },
                  ...items
                    .filter(item => item.availableQuantity > 0)
                    .map(item => ({
                      value: item.id,
                      label: `${item.name} (${item.availableQuantity} available)`
                    }))
                ]}
              />
              <Input
                type="number"
                label="Quantity"
                value={selectedQuantity.toString()}
                onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 0)}
                min={1}
                max={selectedItemId ? 
                  items.find(item => item.id === selectedItemId)?.availableQuantity || 1 
                  : 1
                }
                error={errors.quantity}
              />
              <Input
                type="date"
                label="Issue Date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
              <Button 
                onClick={addItem}
                disabled={!selectedItemId || selectedQuantity <= 0}
                className="md:col-span-3"
                icon={<Plus className="h-4 w-4" />}
              >
                Add Item
              </Button>
            </div>

            {errors.items && (
              <div className="text-red-600 text-sm">{errors.items}</div>
            )}

            {selectedItems.length > 0 ? (
              <div className="bg-white border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-3 py-3 text-sm text-gray-900">{item.itemName}</td>
                        <td className="px-3 py-3 text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-3 py-3 text-sm text-gray-500">₹{item.dailyRate}/day</td>
                        <td className="px-3 py-3 text-sm text-gray-500">{new Date(item.issueDate).toLocaleDateString()}</td>
                        <td className="px-3 py-3 text-sm">
                          <button 
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-md p-8 text-center text-gray-500">
                No items added yet. Use the form above to add rental items.
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={handleCreateRental}
                disabled={!selectedCustomerId || selectedItems.length === 0}
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Create Rental
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NewRental;