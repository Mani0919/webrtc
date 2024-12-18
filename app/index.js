import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { Redirect, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function index() {
  useEffect(() => {
    async function fun() {
      try {
        const res = await AsyncStorage.getItem("token");
        if (res) {
          router.push("/landingscreen");
        } else {
          router.push("/auth");
        }
      } catch (error) {
        console.log(error);
      }
    }
    fun();
  }, []);
  return <Redirect href={"/landingscreen"} />;
}
