import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

export default function Root() {
  return (
    <>
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
          name="screens"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="landingscreen" options={{
          headerShown:false
        }}/>
      </Stack>
    </>
  );
}
