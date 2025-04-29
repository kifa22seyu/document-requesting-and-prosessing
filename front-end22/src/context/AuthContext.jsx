// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("chat-user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Verify token freshness if needed (add your own logic)
          // const isValid = await verifyToken(parsedUser.token);
          // if (isValid) {
            setAuthUser(parsedUser);
          // } else {
          //   localStorage.removeItem("chat-user");
          // }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("chat-user");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (userData) => {
    try {
      localStorage.setItem("chat-user", JSON.stringify(userData));
      setAuthUser(userData);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Optional: Add API call to invalidate token on server
      // await fetch('/api/auth/logout', { method: 'POST' });
      
      localStorage.removeItem("chat-user");
      setAuthUser(null);
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  };

  // Add method to update user data
  const updateUser = (updatedData) => {
    const newUserData = { ...authUser, ...updatedData };
    localStorage.setItem("chat-user", JSON.stringify(newUserData));
    setAuthUser(newUserData);
  };

  // Add method to check roles
  const hasRole = (role) => {
    return authUser?.role === role;
  };

  // Add method to check if user has any of specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(authUser?.role);
  };

  const value = {
    authUser,
    loading,
    login,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!authUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};