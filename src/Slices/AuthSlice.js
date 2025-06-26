import { createSlice } from "@reduxjs/toolkit";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";

const initialState = {
  user: null,
  loading: false,
  error: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.error = null;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setInitialized(state, action) {
      state.isInitialized = action.payload;
    },
    logout(state) {
      state.user = null;
      state.error = null;
      state.isInitialized = true;

      delete api.defaults.headers.common["Authorization"];

      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  setUser,
  setLoading,
  setError,
  setInitialized,
  logout,
  clearError,
} = authSlice.actions;

export const initializeAuth = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const decoded = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp < currentTime) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          delete api.defaults.headers.common["Authorization"];
          dispatch(setError("Session expired. Please login again."));
        } else {
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;
          const user = JSON.parse(storedUser);
          dispatch(setUser(user));
        }
      } catch (tokenError) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        delete api.defaults.headers.common["Authorization"];
        dispatch(setError("Invalid session data. Please login again."));
      }
    } else {
      console.error("ℹ️ No stored auth data found");
    }
  } catch (error) {
    console.error("❌ Auth initialization error:", error);
    dispatch(setError("Failed to initialize authentication"));
  } finally {
    dispatch(setLoading(false));
    dispatch(setInitialized(true));
  }
};

export const login = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearError());

    const response = await api.post("/auth/login", userData);

    if (!response.data || !response.data.token) {
      throw new Error("Invalid response from server");
    }

    const token = response.data.token;
    console.log("Login successful");

    localStorage.setItem("authToken", token);

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const decoded = jwtDecode(token);
    const { jti, email, name, sub } = decoded;

    const user = {
      userId: jti,
      email,
      name,
      role: sub,
    };

    localStorage.setItem("user", JSON.stringify(user));
    dispatch(setUser(user));

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    const errorMessage =
      error.response?.data?.message || error.message || "Login failed";
    dispatch(setError(errorMessage));
    return { success: false, error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};

export default authSlice.reducer;
