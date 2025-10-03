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

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
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

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};

export const roomsAPI = {
  getRooms: async (): Promise<{ success: boolean; rooms: Room[] }> => {
    const response = await api.get("/rooms");
    return response.data;
  },

  createRoom: async (
    roomData: CreateRoomRequest
  ): Promise<{ success: boolean; room: Room }> => {
    const response = await api.post("/rooms", roomData);
    return response.data;
  },

  joinRoom: async (roomName: string): Promise<RoomJoinResponse> => {
    const response = await api.get(`/rooms/${roomName}/join`);
    return response.data;
  },

  leaveRoom: async (roomName: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/rooms/${roomName}/leave`);
    return response.data;
  },

  getParticipants: async (
    roomName: string
  ): Promise<{ success: boolean; participants: any[] }> => {
    const response = await api.get(`/rooms/${roomName}/participants`);
    return response.data;
  },

  updateParticipantAudio: async (
    roomName: string,
    audioEnabled: boolean
  ): Promise<{ success: boolean }> => {
    const response = await api.patch(`/rooms/${roomName}/audio`, {
      audioEnabled,
    });
    return response.data;
  },

  updateParticipantVideo: async (
    roomName: string,
    videoEnabled: boolean
  ): Promise<{ success: boolean }> => {
    const response = await api.patch(`/rooms/${roomName}/video`, {
      videoEnabled,
    });
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
