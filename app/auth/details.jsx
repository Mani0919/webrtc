import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Details() {
  const [phone, setPhone] = useState("");
  const handleContinue = async () => {
    if(phone)
    {
       await AsyncStorage.setItem("phonenumber",phone)
        router.push("/landingscreen")
    }
    else{
        alert("Please enter a valid phone number")
    }
  };
  return (
    <SafeAreaView>
      <View className="px-4 mt-10">
        <Text className="text-[20px]">Enter Phone Number</Text>
      </View>
      <View className="px-4 p-2 bg-gray-200 mx-5 my-3 rounded-lg">
        <TextInput
          placeholder="Enter Phone Number"
          keyboardType="numeric"
          maxLength={10}
          value={phone}
          onChangeText={(e) => setPhone(e)}
        />
      </View>
      <TouchableOpacity className="self-end mr-5 bg-blue-500 p-2 rounded-lg px-3 py-3" onPress={handleContinue}>
        <Text className="text-white text-[15px]">Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
