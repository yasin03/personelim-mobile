import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import useAuthStore from "../store/authStore";
import { getUser, getToken } from "../services/storage";

// Screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import LoadingScreen from "../screens/LoadingScreen";

// Tab Navigator
import MainTabNavigator from "./MainTabNavigator";
import EmployeeStackNavigator from "./EmployeeStackNavigator";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading, user, setUser, setToken, setLoading } =
    useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const [storedUser, storedToken] = await Promise.all([
          getUser(),
          getToken(),
        ]);

        if (storedUser && storedToken) {
          setUser(storedUser);
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Kullanıcı rolüne göre farklı navigator seç
  const getAuthenticatedNavigator = () => {
    if (user?.role === "employee") {
      return (
        <Stack.Screen name="EmployeeTabs" component={EmployeeStackNavigator} />
      );
    }
    // owner, admin, manager için ana tab navigator
    return <Stack.Screen name="MainTabs" component={MainTabNavigator} />;
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          // Authenticated Screens - Kullanıcı rolüne göre navigator
          getAuthenticatedNavigator()
        ) : (
          // Auth Screens
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
