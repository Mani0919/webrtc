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
  export default function index() {
    const [contacts, setContact] = useState([]);
    const [search, setSearch] = useState("");
    const [groups, setGroups] = useState([]);
    const [spin, setSpin] = useState(false);
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
            console.log(data[300]);
            setContact(data);
            return data;
          } else {
            console.log("Permission not granted");
            return [];
          }
        };
        fetchContacts();
      } catch (error) {
        console.log(error)
      }
      finally{
        setSpin(false)
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
    return (
      <SafeAreaView className="flex-1">
        <Spinner visible={spin} />
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
        <View className="bg-gray-400 mx-3 rounded-md p-2">
          <TextInput
            placeholder="search"
            value={search}
            onChangeText={(e) => setSearch(e)}
          />
        </View>
  
        {/* <View className="self-end w-32 my-3 rounded-lg">
            <Button
              title="group"
              onPress={() => {
                fetchGroups();
              }}
            />
          </View>
         
        {/* <View className="self-end w-32 my-3 rounded-lg">
            <Button
              title="Create group"
              onPress={() => {
                createGroup("family");
              }}
            />
          </View> */}
        <View className="flex-1 mx-4 p-2">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="my-2 py-3 bg-gray-300 flex flex-row justify-between items-center px-6 rounded-md"
                  onPress={() => handleCall(item.phoneNumbers?.[0]?.number)}
                >
                  <View className=" flex flex-row items-center gap-x-4">
                    <FontAwesome6 name="user-circle" size={27} color="black" />
                    <View className="flex flex-col gap-y-2">
                      <Text className="text-[17px] font-semibold">
                        {item.name}
                      </Text>
                      <Text>{item.phoneNumbers?.[0]?.number}</Text>
                    </View>
                  </View>
                  <MaterialIcons name="call" size={24} color="#3cb05b" />
                </TouchableOpacity>
              ))
            ) : (
              <Text>No contacts found</Text>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
  