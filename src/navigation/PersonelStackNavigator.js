import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import PersonelListScreen from "../screens/PersonelListScreen";
import AddPersonelScreen from "../screens/AddPersonelScreen";
import PersonelDetailScreen from "../screens/PersonelDetailScreen";

const Stack = createNativeStackNavigator();

const PersonelStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="PersonelList" component={PersonelListScreen} />
      <Stack.Screen name="AddPersonel" component={AddPersonelScreen} />
      <Stack.Screen name="PersonelDetail" component={PersonelDetailScreen} />
    </Stack.Navigator>
  );
};

export default PersonelStackNavigator;
