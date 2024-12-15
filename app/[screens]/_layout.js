import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

export default function Root() {
  return (
    <>
      <Stack >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="addcandiates"
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </>
  );
}
