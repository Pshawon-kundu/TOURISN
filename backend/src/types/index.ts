export interface UserData {
  uid: string;
  email: string;
  role: "admin" | "traveler" | "guide";
  name?: string;
  createdAt: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  role: "admin" | "traveler" | "guide";
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserData;
}
