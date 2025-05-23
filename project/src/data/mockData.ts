import { Customer, Item, Rental, User } from '../models/types';

// Mock users for authentication
export const users: User[] = [
  {
    id: '1',
    username: 'admin',
    name: 'Admin User',
    role: 'admin'
  }
];

// Mock items with updated rates
export const items: Item[] = [
  {
    id: '1',
    name: 'Chali',
    description: 'Construction support item',
    dailyRate: 10,
    totalQuantity: 100,
    availableQuantity: 65
  },
  {
    id: '2',
    name: 'Balli',
    description: 'Construction support beam',
    dailyRate: 2,
    totalQuantity: 150,
    availableQuantity: 100
  },
  {
    id: '3',
    name: 'Drum',
    description: 'Storage drum',
    dailyRate: 5,
    totalQuantity: 50,
    availableQuantity: 30
  },
  {
    id: '4',
    name: 'Batte',
    description: 'Construction support item',
    dailyRate: 1,
    totalQuantity: 200,
    availableQuantity: 150
  },
  {
    id: '5',
    name: 'Fatti',
    description: 'Construction material',
    dailyRate: 0.5,
    totalQuantity: 300,
    availableQuantity: 200
  },
  {
    id: '6',
    name: 'Rope',
    description: 'Construction rope',
    dailyRate: 0.5,
    totalQuantity: 100,
    availableQuantity: 80
  },
  {
    id: '7',
    name: 'Gaddar',
    description: 'Construction support item',
    dailyRate: 1,
    totalQuantity: 150,
    availableQuantity: 100
  },
  {
    id: '8',
    name: 'Gohdi',
    description: 'Construction support item',
    dailyRate: 10,
    totalQuantity: 80,
    availableQuantity: 50
  }
];

// Mock customers
export const customers: Customer[] = [
  {
    id: '1',
    name: 'Raj Construction',
    phone: '9876543210',
    address: '123 Main Street, New Delhi',
    createdAt: new Date('2023-01-15')
  },
  {
    id: '2',
    name: 'Singh Builders',
    phone: '8765432109',
    address: '456 Park Avenue, Mumbai',
    createdAt: new Date('2023-02-20')
  }
];

// Mock rentals
export const rentals: Rental[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'Raj Construction',
    customerPhone: '9876543210',
    issueDate: new Date('2023-05-10'),
    returnDate: null,
    status: 'issued',
    items: [
      {
        id: '1-1',
        itemId: '1',
        itemName: 'Chali',
        quantity: 20,
        dailyRate: 10,
        issueDate: new Date('2023-05-10'),
        returnDate: null,
        isReturned: false,
        daysRented: 0,
        totalAmount: 0
      },
      {
        id: '1-2',
        itemId: '2',
        itemName: 'Balli',
        quantity: 30,
        dailyRate: 2,
        issueDate: new Date('2023-05-10'),
        returnDate: null,
        isReturned: false,
        daysRented: 0,
        totalAmount: 0
      }
    ],
    totalAmount: 0,
    paidAmount: 0,
    balance: 0
  }
];