import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import EmployeeTabNavigator from "./EmployeeTabNavigator";
import CreateLeaveScreen from "../screens/CreateLeaveScreen";
import CreateAdvanceScreen from "../screens/CreateAdvanceScreen";

const Stack = createStackNavigator();

const EmployeeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#3366FF",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="EmployeeTabs"
        component={EmployeeTabNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CreateLeave"
        component={CreateLeaveScreen}
        options={{
          title: "İzin Talebi Oluştur",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="CreateAdvance"
        component={CreateAdvanceScreen}
        options={{
          title: "Avans Talebi Oluştur",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
};

export default EmployeeStackNavigator;
