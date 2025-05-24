import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { useRental } from '../contexts/RentalContext';
import { RentalItem } from '../models/types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  User, 
  Calendar, 
  Phone, 
  ArrowLeft,
  Printer,
  Check,
  Edit2,
  Download
} from 'lucide-react';

const RentalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRental, processReturn, calculateRent } = useRental();
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const rental = getRental(id || '');
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedItems, setSelectedItems] = useState<{
    id: string;
    quantity: number;
    maxQuantity: number;
  }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const businessInfo = {
    name: "Harmanpreet Singh",
    phone: "harmanpreets0017@oksbi",
    address: "Shuttering Rental Services"
  };

  if (!rental) {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold">Rental not found</h2>
          <Button 
            variant="primary" 
            onClick={() => navigate('/rentals')}
            className="mt-4"
          >
            Back to Rentals
          </Button>
        </div>
      </MainLayout>
    );
  }

  const formatDate = (date: Date | null): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const handleSelectItem = (itemId: string, maxQuantity: number) => {
    if (selectedItems.some(item => item.id === itemId)) {
      setSelectedItems(selectedItems.filter(item => item.id !== itemId));
    } else {
      setSelectedItems([...selectedItems, { 
        id: itemId, 
        quantity: maxQuantity,
        maxQuantity 
      }]);
    }
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setSelectedItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.min(quantity, item.maxQuantity) };
      }
      return item;
    }));
  };

  const handleSelectAll = () => {
    if (selectedItems.length === rental.items.filter(item => !item.isReturned).length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        rental.items
          .filter(item => !item.isReturned)
          .map(item => ({
            id: item.id,
            quantity: item.quantity,
            maxQuantity: item.quantity
          }))
      );
    }
  };

  const handleProcessReturn = () => {
    if (selectedItems.length === 0) return;

    // Validate quantities
    const newErrors: Record<string, string> = {};
    selectedItems.forEach(item => {
      if (item.quantity <= 0) {
        newErrors[item.id] = 'Quantity must be greater than 0';
      }
      if (item.quantity > item.maxQuantity) {
        newErrors[item.id] = `Maximum quantity is ${item.maxQuantity}`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const returnInfo = selectedItems.map(item => ({
      itemId: item.id,
      returnDate: new Date(returnDate),
      quantity: item.quantity
    }));

    processReturn(rental.id, returnInfo);
    setSelectedItems([]);
    setErrors({});
    setIsReturnModalOpen(false);

    // If all items returned, show print invoice modal
    if (selectedItems.length === rental.items.filter(item => !item.isReturned).length) {
      setTimeout(() => {
        setIsPrintModalOpen(true);
      }, 500);
    }
  };

  const handlePrint = () => {
    if (invoiceRef.current) {
      window.print();
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`invoice-${rental.id.substring(0, 8)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const totalRent = calculateRent(rental);
  const pendingItems = rental.items.filter(item => !item.isReturned);
  const returnedItems = rental.items.filter(item => item.isReturned);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'issued':
        return <Badge variant="info">Issued</Badge>;
      case 'partially_returned':
        return <Badge variant="warning">Partially Returned</Badge>;
      case 'returned':
        return <Badge variant="success">Returned</Badge>;
      default:
        return null;
    }
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Rental Details
              <span className="ml-3">{getStatusBadge(rental.status)}</span>
            </h1>
            <p className="text-gray-600">Rental ID: {rental.id}</p>
          </div>
          <div className="flex space-x-3">
            {rental.status !== 'returned' && (
              <Button 
                onClick={() => setIsReturnModalOpen(true)}
                icon={<Check className="h-4 w-4" />}
                variant="success"
              >
                Process Return
              </Button>
            )}
            <Button 
              onClick={() => setIsPrintModalOpen(true)}
              icon={<Printer className="h-4 w-4" />}
              variant="outline"
            >
              Print Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1">
          <div className="flex flex-col space-y-4">
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer Name</h3>
                <p className="text-base text-gray-900">{rental.customerName}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                <p className="text-base text-gray-900">{rental.customerPhone}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Issue Date</h3>
                <p className="text-base text-gray-900">{formatDate(rental.issueDate)}</p>
              </div>
            </div>
            {rental.returnDate && (
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Return Date</h3>
                  <p className="text-base text-gray-900">{formatDate(rental.returnDate)}</p>
                </div>
              </div>
            )}
            <div className="border-t pt-4 mt-2">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Total Amount:</span>
                <span className="font-medium">₹{totalRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Amount Paid:</span>
                <span>₹{rental.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-blue-600">
                <span>Balance:</span>
                <span>₹{(totalRent - rental.paidAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Rental Items</h2>
          
          {pendingItems.length > 0 && (
            <>
              <h3 className="text-md font-medium mb-2 text-blue-800">Pending Items</h3>
              <div className="bg-blue-50 rounded-md p-4 mb-6">
                <table className="min-w-full divide-y divide-blue-200">
                  <thead>
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-medium text-blue-800 uppercase">Item</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-blue-800 uppercase">Qty</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-blue-800 uppercase">Rate</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-blue-800 uppercase">Issue Date</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-blue-800 uppercase">Current Rent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {pendingItems.map((item) => {
                      const today = new Date();
                      const issueDate = new Date(item.issueDate);
                      const daysRented = Math.ceil((today.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
                      const currentAmount = daysRented * item.dailyRate * item.quantity;
                      
                      return (
                        <tr key={item.id}>
                          <td className="px-2 py-3 text-sm font-medium text-gray-900">{item.itemName}</td>
                          <td className="px-2 py-3 text-sm text-gray-700">{item.quantity}</td>
                          <td className="px-2 py-3 text-sm text-gray-700">₹{item.dailyRate}/day</td>
                          <td className="px-2 py-3 text-sm text-gray-700">{formatDate(item.issueDate)}</td>
                          <td className="px-2 py-3 text-sm font-medium text-blue-600">
                            ₹{currentAmount.toLocaleString()}
                            <span className="ml-1 text-gray-500">({daysRented} days)</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
          
          {returnedItems.length > 0 && (
            <>
              <h3 className="text-md font-medium mb-2 text-green-800">Returned Items</h3>
              <div className="bg-green-50 rounded-md p-4">
                <table className="min-w-full divide-y divide-green-200">
                  <thead>
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-medium text-green-800 uppercase">Item</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-green-800 uppercase">Qty</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-green-800 uppercase">Rate</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-green-800 uppercase">Issue Date</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-green-800 uppercase">Return Date</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-green-800 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100">
                    {returnedItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-2 py-3 text-sm font-medium text-gray-900">{item.itemName}</td>
                        <td className="px-2 py-3 text-sm text-gray-700">{item.quantity}</td>
                        <td className="px-2 py-3 text-sm text-gray-700">₹{item.dailyRate}/day</td>
                        <td className="px-2 py-3 text-sm text-gray-700">{formatDate(item.issueDate)}</td>
                        <td className="px-2 py-3 text-sm text-gray-700">{formatDate(item.returnDate)}</td>
                        <td className="px-2 py-3 text-sm font-medium text-green-600">
                          ₹{item.totalAmount.toLocaleString()}
                          <span className="ml-1 text-gray-500">({item.daysRented} days)</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Return Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setSelectedItems([]);
          setErrors({});
        }}
        title="Process Return"
        size="lg"
        footer={
          <>
            <Button 
              onClick={handleProcessReturn} 
              disabled={selectedItems.length === 0}
              className="ml-3"
              variant="success"
            >
              Confirm Return
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsReturnModalOpen(false);
                setSelectedItems([]);
                setErrors({});
              }}
            >
              Cancel
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Return Date
            </label>
            <input
              type="date"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </div>

          {pendingItems.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Select Items to Return</h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleSelectAll}
                >
                  {selectedItems.length === pendingItems.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="bg-gray-50 rounded-md p-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available Qty</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Qty</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingItems.map((item) => {
                      const returnDateObj = new Date(returnDate);
                      const issueDateObj = new Date(item.issueDate);
                      const daysRented = Math.ceil((returnDateObj.getTime() - issueDateObj.getTime()) / (1000 * 60 * 60 * 24));
                      const selectedItem = selectedItems.find(si => si.id === item.id);
                      const amount = daysRented * item.dailyRate * (selectedItem?.quantity || 0);
                      
                      return (
                        <tr key={item.id} className="border-b">
                          <td className="px-2 py-3 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedItems.some(si => si.id === item.id)}
                              onChange={() => handleSelectItem(item.id, item.quantity)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-2 py-3 text-sm text-gray-900">{item.itemName}</td>
                          <td className="px-2 py-3 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-2 py-3 text-sm">
                            {selectedItems.some(si => si.id === item.id) && (
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  value={selectedItem?.quantity.toString()}
                                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                                  min={1}
                                  max={item.quantity}
                                  error={errors[item.id]}
                                  className="w-20"
                                />
                                <Edit2 className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-3 text-sm text-gray-900">{daysRented}</td>
                          <td className="px-2 py-3 text-sm text-blue-600 font-medium">
                            {selectedItems.some(si => si.id === item.id) 
                              ? `₹${amount.toLocaleString()}`
                              : '-'
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No items pending return.
            </div>
          )}
        </div>
      </Modal>

      {/* Print Invoice Modal */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Invoice"
        size="lg"
        footer={
          <>
            <Button 
              onClick={handleDownloadPDF}
              className="ml-3"
              icon={<Download className="h-4 w-4" />}
            >
              Download PDF
            </Button>
            <Button 
              onClick={handlePrint} 
              className="ml-3"
              icon={<Printer className="h-4 w-4" />}
            >
              Print Invoice
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setIsPrintModalOpen(false)}
            >
              Close
            </Button>
          </>
        }
      >
        <div ref={invoiceRef} className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">INVOICE</h2>
              <p className="text-gray-500">Invoice #: {rental.id.substring(0, 8)}</p>
              <p className="text-gray-500">Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-bold">{businessInfo.name}</h3>
              <p>{businessInfo.address}</p>
              <p>UPI: {businessInfo.phone}</p>
            </div>
          </div>

          <div className="border-t border-b py-4 mt-4">
            <h3 className="font-medium mb-2">Customer Information:</h3>
            <p><strong>Name:</strong> {rental.customerName}</p>
            <p><strong>Phone:</strong> {rental.customerPhone}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Rental Details:</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate/Day</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rental.items.map((item: RentalItem) => {
                  const days = item.isReturned 
                    ? item.daysRented 
                    : Math.ceil((new Date().getTime() - new Date(item.issueDate).getTime()) / (1000 * 60 * 60 * 24));
                  
                  const amount = item.isReturned 
                    ? item.totalAmount 
                    : days * item.dailyRate * item.quantity;
                  
                  return (
                    <tr key={item.id}>
                      <td className="px-3 py-2">{item.itemName}</td>
                      <td className="px-3 py-2">{item.quantity}</td>
                      <td className="px-3 py-2">₹{item.dailyRate}</td>
                      <td className="px-3 py-2">{formatDate(item.issueDate)}</td>
                      <td className="px-3 py-2">{formatDate(item.returnDate)}</td>
                      <td className="px-3 py-2">{days}</td>
                      <td className="px-3 py-2">₹{amount.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-start">
              <div className="w-1/2">
                <div className="flex justify-end space-x-20 pt-4">
                  <div className="text-right">
                    <p className="text-sm">Subtotal:</p>
                    <p className="text-sm">Tax (0%):</p>
                    <p className="text-lg font-bold mt-2">Total:</p>
                    <p className="text-sm mt-2">Amount Paid:</p>
                    <p className="text-lg font-bold text-blue-600 mt-2">Balance Due:</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">₹{totalRent.toLocaleString()}</p>
                    <p className="text-sm">₹0.00</p>
                    <p className="text-lg font-bold mt-2">₹{totalRent.toLocaleString()}</p>
                    <p className="text-sm mt-2">₹{rental.paidAmount.toLocaleString()}</p>
                    <p className="text-lg font-bold text-blue-600 mt-2">₹{(totalRent - rental.paidAmount).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t">
            <p className="text-sm text-gray-500 text-center">Thank you for your business!</p>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default RentalDetails;