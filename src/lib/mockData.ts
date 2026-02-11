
export type UserRole = 'admin' | 'farmer' | 'employee';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  village?: string;
  address?: string;
  profilePhoto?: string;
  ledgerLink?: string;
  username?: string;
  password?: string; // In real app, this would be hashed
  adminNotes?: string;
  status: 'active' | 'blocked' | 'deleted';
  createdAt: string;
  loyaltyPoints?: number;
}

export interface LocationData {
  userId: string;
  lat: number;
  lng: number;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

// Initial Mock Data
const ADMIN_USER: User = {
  id: 'admin_001',
  name: 'Nilesh Seeds',
  username: 'Nilesh Seeds',
  password: '1008',
  phone: '9999999999',
  role: 'admin',
  address: 'Shop No 1, Main Market',
  village: 'City Center',
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  loyaltyPoints: 0
};

// Storage Keys
const USERS_KEY = 'ns_users';
const CHATS_KEY = 'ns_chats';
const LOCATIONS_KEY = 'ns_locations';
const ALERTS_KEY = 'ns_alerts';

export interface ProximityAlert {
  id: string;
  userId: string;
  userName: string;
  village: string;
  distance: number;
  timestamp: string;
  acknowledged: boolean;
}


// Helper to initialize storage if empty
const initStorage = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([ADMIN_USER]));
  }
  if (!localStorage.getItem(CHATS_KEY)) {
    localStorage.setItem(CHATS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(LOCATIONS_KEY)) {
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify([]));
  }
};

export const MockBackend = {
  init: initStorage,

  getUsers: (): User[] => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  },

  addUser: (user: User) => {
    const users = MockBackend.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  updateUser: (updatedUser: User) => {
    const users = MockBackend.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  login: (credential: string, password: string): User | null => {
    const users = MockBackend.getUsers();
    // First check regular users (admin/farmer)
    const regularUser = users.find(u =>
      (u.phone === credential || u.username === credential || u.name === credential) &&
      u.password === password
    );

    if (regularUser) return regularUser;

    // Check employees
    if (typeof window !== 'undefined') {
      try {
        const { EmployeeService } = require('@/services/employeeService');
        const employees = EmployeeService.getAllEmployees();
        const employee = employees.find((e: any) =>
          (e.phone === credential || e.name === credential) &&
          e.password === password &&
          e.status === 'active'
        );

        if (employee) {
          // Convert employee to User format for authentication
          return {
            id: employee.id,
            name: employee.name,
            phone: employee.phone,
            role: 'employee' as UserRole,
            status: 'active',
            createdAt: employee.createdAt,
            password: employee.password
          };
        }
      } catch (e) {
        // EmployeeService not available yet
      }
    }

    return null;
  },

  // Chat
  getMessages: (userId1: string, userId2: string): Message[] => {
    if (typeof window === 'undefined') return [];
    const allMessages: Message[] = JSON.parse(localStorage.getItem(CHATS_KEY) || '[]');
    return allMessages.filter(m =>
      (m.senderId === userId1 && m.receiverId === userId2) ||
      (m.senderId === userId2 && m.receiverId === userId1)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  sendMessage: (msg: Message) => {
    const msgs: Message[] = JSON.parse(localStorage.getItem(CHATS_KEY) || '[]');
    msgs.push(msg);
    localStorage.setItem(CHATS_KEY, JSON.stringify(msgs));
  },

  getUnreadCount: (userId: string): number => {
    if (typeof window === 'undefined') return 0;
    const allMessages: Message[] = JSON.parse(localStorage.getItem(CHATS_KEY) || '[]');
    return allMessages.filter(m => m.receiverId === userId && !m.read).length;
  },

  markMessagesAsRead: (userId: string, partnerId: string) => {
    if (typeof window === 'undefined') return;
    const allMessages: Message[] = JSON.parse(localStorage.getItem(CHATS_KEY) || '[]');
    let updated = false;

    allMessages.forEach(msg => {
      // Only mark messages sent TO me FROM partner that are currently unread
      if (msg.receiverId === userId && msg.senderId === partnerId && !msg.read) {
        msg.read = true;
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem(CHATS_KEY, JSON.stringify(allMessages));
    }
  },

  // Location
  updateLocation: (loc: LocationData) => {
    const locs: LocationData[] = JSON.parse(localStorage.getItem(LOCATIONS_KEY) || '[]');
    const index = locs.findIndex(l => l.userId === loc.userId);
    if (index !== -1) {
      locs[index] = loc;
    } else {
      locs.push(loc);
    }
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locs));
  },

  getAllLocations: (): LocationData[] => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(LOCATIONS_KEY) || '[]');
  },

  // Alerts
  addAlert: (alert: ProximityAlert) => {
    const alerts: ProximityAlert[] = JSON.parse(localStorage.getItem(ALERTS_KEY) || '[]');
    // Avoid spamming stats
    const existing = alerts.find(a => a.userId === alert.userId && !a.acknowledged);
    if (!existing) {
      alerts.push(alert);
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    }
  },

  getAlerts: (): ProximityAlert[] => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(ALERTS_KEY) || '[]');
  },

  acknowledgeAlert: (alertId: string) => {
    const alerts: ProximityAlert[] = JSON.parse(localStorage.getItem(ALERTS_KEY) || '[]');
    const index = alerts.findIndex(a => a.id === alertId);
    if (index !== -1) {
      alerts[index].acknowledged = true;
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    }
  }
};
