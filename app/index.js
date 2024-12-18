import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { Redirect, router } from "expo-router";

export default function index() {
  useEffect(() => {
    async function fun() {
      try {
        const res = await AsyncStorage.getItem("token");
        if (res) {
          router.push("/home");
        } else {
          router.push("/signin");
        }
      } catch (error) {
        console.log(error);
      }
    }
    fun();
  }, []);
  return <Redirect href={"/landingscreen"} />;
}
