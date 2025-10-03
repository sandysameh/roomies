export enum AccountType {
  USER = "User",
  ADMIN = "Admin",
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface LoginRequest {
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
}

export interface Room {
  id: string;
  name: string;
  url: string;
  participantCount: number;
  createdAt: string;
}

export interface CreateRoomRequest {
  name: string;
}

export interface RoomJoinResponse {
  success: boolean;
  room: Room;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Participant {
  session_id: string;
  user_name: string;
  audio: boolean;
  video: boolean;
  screen: boolean;
  joined_at: string;
}
