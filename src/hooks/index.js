import { useState, useEffect } from "react";
import { onAuthStateChange } from "../services/auth";
import useAuthStore from "../store/authStore";

// Auth state hook
export const useAuth = () => {
  const authStore = useAuthStore();

  return {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout,
  };
};

// Firebase auth listener hook
export const useAuthListener = () => {
  const { setUser, setLoading } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      setInitialized(true);
    });

    return unsubscribe;
  }, [setUser, setLoading]);

  return { initialized };
};

// Debounce hook
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Form validation hook
export const useFormValidation = (schema) => {
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  const validate = (data) => {
    try {
      schema.parse(data);
      setErrors({});
      setIsValid(true);
      return true;
    } catch (error) {
      const fieldErrors = {};
      error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      setIsValid(false);
      return false;
    }
  };

  return {
    errors,
    isValid,
    validate,
    setErrors,
  };
};
