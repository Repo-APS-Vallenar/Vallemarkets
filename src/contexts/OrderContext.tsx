import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    sellerId: string;
    sellerName: string;
  }>;
  total: number;
  status: 'pending' | 'accepted' | 'shipped' | 'delivered' | 'rejected';
  createdAt: string;
  updatedAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface OrderState {
  orders: Order[];
  isLoading: boolean;
}

interface OrderContextType extends OrderState {
  createOrder: (orderData: Partial<Order>) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrdersByUser: (userId: string) => Order[];
  getOrdersBySeller: (sellerId: string) => Order[];
}

const initialState: OrderState = {
  orders: [],
  isLoading: false,
};

type OrderAction = 
  | { type: 'CREATE_ORDER_START' }
  | { type: 'CREATE_ORDER_SUCCESS'; payload: Order }
  | { type: 'CREATE_ORDER_FAILURE' }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status'] } }
  | { type: 'LOAD_ORDERS'; payload: Order[] };

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'CREATE_ORDER_START':
      return { ...state, isLoading: true };
    case 'CREATE_ORDER_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        orders: [...state.orders, action.payload] 
      };
    case 'CREATE_ORDER_FAILURE':
      return { ...state, isLoading: false };
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.orderId
            ? { ...order, status: action.payload.status, updatedAt: new Date().toISOString() }
            : order
        )
      };
    case 'LOAD_ORDERS':
      return { ...state, orders: action.payload };
    default:
      return state;
  }
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  const createOrder = async (orderData: Partial<Order>): Promise<Order | null> => {
    dispatch({ type: 'CREATE_ORDER_START' });
    try {
      const newOrder: Order = {
        id: Date.now().toString(),
        userId: orderData.userId || '',
        items: orderData.items || [],
        total: orderData.total || 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        shippingAddress: orderData.shippingAddress || {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        }
      };
      
      dispatch({ type: 'CREATE_ORDER_SUCCESS', payload: newOrder });
      
      // Guardar en localStorage
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      savedOrders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(savedOrders));
      
      return newOrder;
      
    } catch (error) {
      dispatch({ type: 'CREATE_ORDER_FAILURE' });
      throw error;
    }
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status } });
    
    // Actualizar en localStorage
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = savedOrders.map((order: Order) =>
      order.id === orderId
        ? { ...order, status, updatedAt: new Date().toISOString() }
        : order
    );
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const getOrdersByUser = (userId: string) => {
    return state.orders.filter(order => order.userId === userId);
  };

  const getOrdersBySeller = (sellerId: string) => {
    return state.orders.filter(order => 
      order.items.some(item => item.sellerId === sellerId)
    );
  };

  return (
    <OrderContext.Provider value={{ 
      ...state, 
      createOrder, 
      updateOrderStatus, 
      getOrdersByUser, 
      getOrdersBySeller 
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};