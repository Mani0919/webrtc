import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Button,
  FlatList,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Redirect, router } from "expo-router";
import * as Contacts from "expo-contacts";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import firebase from "firebase/app";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs } from "@firebase/firestore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Spinner from "react-native-loading-spinner-overlay";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
export default function index() {
  const [contacts, setContact] = useState([]);
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState([]);
  const [spin, setSpin] = useState(true);
  const [filteredContacts, setFilteredContacts] = useState([]);
  useEffect(() => {
    try {
      setSpin(true);
      const fetchContacts = async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === "granted") {
          const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers],
          });
          setContact(data);
        } else {
          console.log("Permission not granted");
        }
      };
      fetchContacts();
    } catch (error) {
      console.log(error);
    } finally {
      setSpin(false);
    }
  }, []);

  useEffect(() => {
    const filterContacts = () => {
      setSpin(true); // Start spinner

      // Perform filtering logic
      const result = contacts
        .filter((contact) => contact.contactType === "person") // Filter by 'person' contactType
        .filter((contact) => {
          return (
            !/^[+9876]/.test(contact.name) &&
            contact.name.toLowerCase().includes(search.toLowerCase())
          );
        });

      // Update filtered contacts and stop the spinner
      setFilteredContacts(result);
      setSpin(false);
    };

    filterContacts(); // Trigger the filter when search changes
  }, [search, contacts]);

  const fetchGroups = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "groups"));
      const groups = [];
      querySnapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() }); // Add ID and document data
      });
      setGroups(groups); // Return fetched groups
    } catch (error) {
      console.error("Error fetching groups:", error);
      return [];
    }
  };
  const handleCall = (phoneNumber) => {
    // Check if the phone number is valid
    if (phoneNumber) {
      const url = `tel:${phoneNumber}`;
      Linking.openURL(url).catch((err) =>
        Alert.alert("Error", "Unable to place call")
      );
    } else {
      Alert.alert(
        "No phone number",
        "This contact does not have a valid phone number."
      );
    }
  };
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "834495022514-o5l8l838a65l4d3laf7af76gv68fl064.apps.googleusercontent.com",
    });
  }, []);
  const handelOut = async () => {
    try {
      const res = await GoogleSignin.signOut();
      router.push("/auth");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <SafeAreaView className="flex-1">
      <Spinner visible={spin} />
      <View className="flex flex-row justify-between items-center ">
        <TouchableOpacity onPress={handelOut}>
          <Text>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex flex-row items-center justify-end px-7 p-2 mt-5"
          onPress={() => {
            console.log("push");
            router.push("/screens");
          }}
        >
          <Text className="text-[15px]">Groups</Text>
          <AntDesign
            name="enter"
            size={24}
            color="black"
            style={{ transform: [{ rotate: "-180deg" }] }}
          />
        </TouchableOpacity>
      </View>

      <View className="bg-gray-400 mx-3 rounded-md p-2">
        <TextInput
          placeholder="search"
          value={search}
          onChangeText={(e) => setSearch(e)}
        />
      </View>

      <View className="mx-4">
        <FlatList
          data={filteredContacts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View className="my-2 py-3 bg-gray-300 flex flex-row justify-between items-center px-6 rounded-md">
              <View className="flex flex-row items-center gap-x-4">
                <FontAwesome6 name="user-circle" size={27} color="black" />
                <View className="flex flex-col gap-y-2">
                  <Text className="text-[17px] font-semibold">{item.name}</Text>
                  <Text>{item.phoneNumbers?.[0]?.number}</Text>
                </View>
              </View>
              <View className="flex flex-row gap-x-2 items-center">
                <MaterialIcons
                  name="call"
                  size={24}
                  color="#3cb05b"
                  onPress={() => handleCall(item.phoneNumbers?.[0]?.number)}
                />
                <TouchableOpacity
                  onPress={() => {
                    AsyncStorage.setItem(
                      "phone",
                      item.phoneNumbers?.[0]?.number
                    );
                    router.push({
                      pathname: "/videocall",
                      params: { phone: item.phoneNumbers?.[0]?.number },
                    });
                  }}
                >
                  <FontAwesome name="video-camera" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text>No contacts found</Text>}
        />
      </View>
    </SafeAreaView>
  );
}
