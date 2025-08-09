// User types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

// Personel types
export interface Personel {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

// Auth types
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  AddPersonel: undefined;
  PersonelDetail: { personel: Personel };
  EditPersonel: { personel: Personel };
};

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface PersonelFormData {
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
}
