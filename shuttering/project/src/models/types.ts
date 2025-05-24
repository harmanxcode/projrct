export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: Date;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  dailyRate: number;
  totalQuantity: number;
  availableQuantity: number;
}

export interface RentalItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  dailyRate: number;
  issueDate: Date;
  returnDate: Date | null;
  isReturned: boolean;
  daysRented: number;
  totalAmount: number;
}

export interface Rental {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  issueDate: Date;
  returnDate: Date | null;
  items: RentalItem[];
  status: 'issued' | 'partially_returned' | 'returned';
  totalAmount: number;
  paidAmount: number;
  balance: number;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}