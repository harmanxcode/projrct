import React, { createContext, useContext, useState, useEffect } from 'react';
import { Rental, Customer, Item, RentalItem } from '../models/types';
import { rentals as initialRentals, customers as initialCustomers, items as initialItems } from '../data/mockData';

interface RentalContextType {
  rentals: Rental[];
  customers: Customer[];
  items: Item[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  deleteCustomer: (id: string) => void;
  addRental: (rental: Omit<Rental, 'id'>) => Rental;
  updateRental: (rental: Rental) => void;
  processReturn: (
    rentalId: string, 
    returnedItems: { itemId: string; returnDate: Date; quantity: number }[]
  ) => void;
  getCustomer: (id: string) => Customer | undefined;
  getItem: (id: string) => Item | undefined;
  getRental: (id: string) => Rental | undefined;
  calculateRent: (rental: Rental) => number;
  getPendingReturns: () => Rental[];
  getIssuedRentals: () => Rental[];
  reissueItems: (
    customerId: string, 
    items: Omit<RentalItem, 'id' | 'returnDate' | 'isReturned' | 'daysRented' | 'totalAmount'>[]
  ) => Rental;
}

const RentalContext = createContext<RentalContextType | undefined>(undefined);

// Load data from localStorage or use initial data
const loadFromStorage = <T,>(key: string, initialData: T): T => {
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      const parsedData = JSON.parse(stored);
      // Convert date strings back to Date objects
      if (key === 'rentals') {
        return parsedData.map((rental: any) => ({
          ...rental,
          issueDate: new Date(rental.issueDate),
          returnDate: rental.returnDate ? new Date(rental.returnDate) : null,
          items: rental.items.map((item: any) => ({
            ...item,
            issueDate: new Date(item.issueDate),
            returnDate: item.returnDate ? new Date(item.returnDate) : null
          }))
        }));
      }
      if (key === 'customers') {
        return parsedData.map((customer: any) => ({
          ...customer,
          createdAt: new Date(customer.createdAt)
        }));
      }
      return parsedData;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialData;
    }
  }
  return initialData;
};

export const RentalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rentals, setRentals] = useState<Rental[]>(() => 
    loadFromStorage('rentals', initialRentals)
  );
  const [customers, setCustomers] = useState<Customer[]>(() => 
    loadFromStorage('customers', initialCustomers)
  );
  const [items, setItems] = useState<Item[]>(() => 
    loadFromStorage('items', initialItems)
  );

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('rentals', JSON.stringify(rentals));
  }, [rentals]);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('items', JSON.stringify(items));
  }, [items]);

  // Generate a simple unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Add a new customer
  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
      createdAt: new Date(),
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  // Delete a customer
  const deleteCustomer = (id: string): void => {
    // Check if customer has any active rentals
    const hasActiveRentals = rentals.some(
      rental => rental.customerId === id && rental.status !== 'returned'
    );

    if (hasActiveRentals) {
      throw new Error('Cannot delete customer with active rentals');
    }

    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  // Add a new rental
  const addRental = (rental: Omit<Rental, 'id'>): Rental => {
    // Update items available quantity
    const updatedItems = [...items];
    rental.items.forEach(item => {
      const itemIndex = updatedItems.findIndex(i => i.id === item.itemId);
      if (itemIndex !== -1) {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          availableQuantity: updatedItems[itemIndex].availableQuantity - item.quantity
        };
      }
    });
    setItems(updatedItems);

    // Create new rental with ID
    const newRental: Rental = {
      ...rental,
      id: generateId(),
      items: rental.items.map(item => ({
        ...item,
        id: generateId(),
        returnDate: null,
        isReturned: false,
        daysRented: 0,
        totalAmount: 0
      }))
    };

    setRentals(prev => [...prev, newRental]);
    return newRental;
  };

  // Update a rental
  const updateRental = (rental: Rental): void => {
    setRentals(prev => prev.map(r => r.id === rental.id ? rental : r));
  };

  // Process item returns
  const processReturn = (
    rentalId: string, 
    returnedItems: { itemId: string; returnDate: Date; quantity: number }[]
  ): void => {
    setRentals(prev => {
      return prev.map(rental => {
        if (rental.id !== rentalId) return rental;

        // Update each item in the rental
        const updatedItems = rental.items.map(item => {
          const returnInfo = returnedItems.find(ri => ri.itemId === item.id);
          if (!returnInfo) return item;

          // Handle partial returns
          const remainingQuantity = item.quantity - returnInfo.quantity;
          
          if (remainingQuantity > 0) {
            // Split the item into returned and remaining portions
            const returnedPortion = {
              ...item,
              quantity: returnInfo.quantity,
              returnDate: returnInfo.returnDate,
              isReturned: true,
              daysRented: Math.ceil((returnInfo.returnDate.getTime() - item.issueDate.getTime()) / (1000 * 60 * 60 * 24)),
            };
            
            const remainingPortion = {
              ...item,
              id: generateId(),
              quantity: remainingQuantity,
              isReturned: false,
              returnDate: null,
              daysRented: 0,
              totalAmount: 0
            };

            // Calculate rent only for the returned portion
            returnedPortion.totalAmount = returnedPortion.daysRented * item.dailyRate * returnInfo.quantity;

            return [returnedPortion, remainingPortion];
          }

          // Full return
          const daysRented = Math.ceil((returnInfo.returnDate.getTime() - item.issueDate.getTime()) / (1000 * 60 * 60 * 24));
          return {
            ...item,
            returnDate: returnInfo.returnDate,
            isReturned: true,
            daysRented,
            totalAmount: daysRented * item.dailyRate * item.quantity
          };
        });

        // Flatten the array since some items might have been split into two
        const flattenedItems = updatedItems.flat();

        // Calculate total amount only for returned items
        const totalAmount = flattenedItems
          .filter(item => item.isReturned)
          .reduce((sum, item) => sum + item.totalAmount, 0);
        
        // Determine status
        const allReturned = flattenedItems.every(item => item.isReturned);
        const someReturned = flattenedItems.some(item => item.isReturned);
        
        let status: 'issued' | 'partially_returned' | 'returned' = 'issued';
        if (allReturned) status = 'returned';
        else if (someReturned) status = 'partially_returned';

        // Update available quantity for returned items
        const updatedStockItems = [...items];
        returnedItems.forEach(returnItem => {
          const rentalItem = rental.items.find(ri => ri.id === returnItem.itemId);
          if (rentalItem) {
            const stockItem = updatedStockItems.find(i => i.id === rentalItem.itemId);
            if (stockItem) {
              stockItem.availableQuantity += returnItem.quantity;
            }
          }
        });
        setItems(updatedStockItems);

        return {
          ...rental,
          items: flattenedItems,
          status,
          totalAmount,
          balance: totalAmount - rental.paidAmount,
          returnDate: allReturned ? new Date() : null
        };
      });
    });
  };

  // Get a customer by ID
  const getCustomer = (id: string): Customer | undefined => {
    return customers.find(customer => customer.id === id);
  };

  // Get an item by ID
  const getItem = (id: string): Item | undefined => {
    return items.find(item => item.id === id);
  };

  // Get a rental by ID
  const getRental = (id: string): Rental | undefined => {
    return rentals.find(rental => rental.id === id);
  };

  // Calculate rent for a rental
  const calculateRent = (rental: Rental): number => {
    return rental.items
      .filter(item => item.isReturned)
      .reduce((total, item) => total + item.totalAmount, 0);
  };

  // Get all pending returns
  const getPendingReturns = (): Rental[] => {
    return rentals.filter(rental => rental.status !== 'returned');
  };

  // Get all issued rentals
  const getIssuedRentals = (): Rental[] => {
    return rentals.filter(rental => rental.status === 'issued');
  };

  // Re-issue items to an existing customer
  const reissueItems = (
    customerId: string, 
    newItems: Omit<RentalItem, 'id' | 'returnDate' | 'isReturned' | 'daysRented' | 'totalAmount'>[]
  ): Rental => {
    // Find the customer
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Create a new rental
    const newRental: Omit<Rental, 'id'> = {
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      issueDate: new Date(),
      returnDate: null,
      status: 'issued',
      items: newItems.map(item => ({
        ...item,
        id: generateId(),
        returnDate: null,
        isReturned: false,
        daysRented: 0,
        totalAmount: 0
      })),
      totalAmount: 0,
      paidAmount: 0,
      balance: 0
    };

    return addRental(newRental);
  };

  return (
    <RentalContext.Provider value={{
      rentals,
      customers,
      items,
      addCustomer,
      deleteCustomer,
      addRental,
      updateRental,
      processReturn,
      getCustomer,
      getItem,
      getRental,
      calculateRent,
      getPendingReturns,
      getIssuedRentals,
      reissueItems
    }}>
      {children}
    </RentalContext.Provider>
  );
};

export const useRental = (): RentalContextType => {
  const context = useContext(RentalContext);
  if (context === undefined) {
    throw new Error('useRental must be used within a RentalProvider');
  }
  return context;
};