import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { NotificationProvider } from "../context/notificationcontext";

export default function Root() {
  return (
    <>
    <NotificationProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="auth"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="[screens]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="landingscreen" options={{
          headerShown:false
        }}/>
        <Stack.Screen name="videocall" options={{
          headerShown:false
        }}/>
      </Stack>
      </NotificationProvider> 
    </>
  );
}
