import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { useRental } from '../contexts/RentalContext';
import { Rental, RentalItem } from '../models/types';
import { 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  ArrowLeft,
  Plus
} from 'lucide-react';

const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getCustomer, 
    rentals, 
    items, 
    reissueItems 
  } = useRental();

  const customer = getCustomer(id || '');
  const customerRentals = rentals.filter(rental => rental.customerId === id);

  const [isNewRentalModalOpen, setIsNewRentalModalOpen] = useState(false);
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

  if (!customer) {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold">Customer not found</h2>
          <Button 
            variant="primary" 
            onClick={() => navigate('/customers')}
            className="mt-4"
          >
            Back to Customers
          </Button>
        </div>
      </MainLayout>
    );
  }

  const formatDate = (date: Date | null): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const rentalColumns = [
    { 
      header: 'Rental ID', 
      accessor: (rental: Rental) => rental.id.substring(0, 8) + '...',
      className: 'font-medium text-gray-900'
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

  const addItem = () => {
    if (!selectedItemId || selectedQuantity <= 0) return;
    
    const item = items.find(item => item.id === selectedItemId);
    if (!item) return;

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
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleIssueItems = () => {
    if (selectedItems.length === 0) return;

    // Create new rental items
    const rentalItems: Omit<RentalItem, 'id' | 'returnDate' | 'isReturned' | 'daysRented' | 'totalAmount'>[] = 
      selectedItems.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        dailyRate: item.dailyRate,
        issueDate: new Date(item.issueDate)
      }));

    // Issue items to customer
    reissueItems(customer.id, rentalItems);
    
    // Reset and close modal
    setSelectedItems([]);
    setIsNewRentalModalOpen(false);
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <Link 
          to="/customers" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Customers
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <Button 
            onClick={() => setIsNewRentalModalOpen(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            Issue Items
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1">
          <div className="flex flex-col space-y-4">
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer Name</h3>
                <p className="text-base text-gray-900">{customer.name}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                <p className="text-base text-gray-900">{customer.phone}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="text-base text-gray-900">{customer.address || 'No address provided'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer Since</h3>
                <p className="text-base text-gray-900">{formatDate(customer.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-start">
              <ShoppingBag className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Rentals</h3>
                <p className="text-base text-gray-900">{customerRentals.length}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Rental History</h2>
          <Table
            columns={rentalColumns}
            data={customerRentals}
            keyExtractor={(item) => item.id}
            onRowClick={(rental) => {
              navigate(`/rentals/${rental.id}`);
            }}
            emptyMessage="No rental records found"
          />
        </Card>
      </div>

      <Modal
        isOpen={isNewRentalModalOpen}
        onClose={() => setIsNewRentalModalOpen(false)}
        title={`Issue Items to ${customer.name}`}
        size="lg"
        footer={
          <>
            <Button 
              onClick={handleIssueItems} 
              disabled={selectedItems.length === 0}
              className="ml-3"
            >
              Issue Items
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setIsNewRentalModalOpen(false)}
            >
              Cancel
            </Button>
          </>
        }
      >
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
            >
              Add Item
            </Button>
          </div>

          {selectedItems.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Selected Items</h3>
              <div className="bg-gray-50 rounded-md p-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-2 py-3 text-sm text-gray-900">{item.itemName}</td>
                        <td className="px-2 py-3 text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-2 py-3 text-sm text-gray-900">₹{item.dailyRate}/day</td>
                        <td className="px-2 py-3 text-sm text-gray-900">{new Date(item.issueDate).toLocaleDateString()}</td>
                        <td className="px-2 py-3 text-sm">
                          <button 
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </MainLayout>
  );
};

export default CustomerDetails;