import axios, { AxiosResponse } from "axios";
import {
  LoginRequest,
  LoginResponse,
  Room,
  CreateRoomRequest,
  RoomJoinResponse,
  User,
} from "../types";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response: AxiosResponse<LoginResponse> = await api.post(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  getCurrentUser: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

export const roomsAPI = {
  getRooms: async (): Promise<{ success: boolean; rooms: Room[] }> => {
    const response = await api.get("/rooms");
    return response.data;
  },

  getRoom: async (roomName: string): Promise<RoomJoinResponse> => {
    const response = await api.get(`/rooms/${roomName}`);
    return response.data;
  },

  createRoom: async (
    roomData: CreateRoomRequest
  ): Promise<{ success: boolean; room: Room }> => {
    const response = await api.post("/rooms", roomData);
    return response.data;
  },

  deleteRoom: async (
    roomName: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/rooms/${roomName}`);
    return response.data;
  },
};

export default api;
