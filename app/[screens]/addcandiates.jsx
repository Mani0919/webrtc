import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import * as Contacts from "expo-contacts";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function Addcandiates() {
  const router = useRouter();
  const { id, name}=useLocalSearchParams()
  console.log("ttt", id, name);
  const [search, setSearch] = useState("");
  const [contacts, setContact] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [addcontacts, setAddcontacts] = useState([]);
  useEffect(() => {
    try {
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
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const filterContacts = () => {
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
    };

    filterContacts(); // Trigger the filter when search changes
  }, [search, contacts, addcontacts]);

  const handleSelectContact = (candidateId) => {
    console.log(candidateId, addcontacts);
    setAddcontacts((prevContacts) => {
      // Check if the contact is already in the array
      if (prevContacts.includes(candidateId)) {
        // If it is, remove it (deselect)
        return prevContacts.filter((id) => id !== candidateId);
      } else {
        // If it isn't, add it (select)
        return [...prevContacts, candidateId];
      }
    });
  };

  const pushCandidates=async()=>
  {
    try {
      const res=await updateDoc(doc(db,"groups",id),{
        members:arrayUnion(...addcontacts)
      })
      Alert.alert("Added")
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <SafeAreaView className="flex-1">
      <TouchableOpacity className="px-10 p-3 " onPress={() => router.back()}>
        <AntDesign name="enter" size={24} color="black" />
      </TouchableOpacity>
      <View className="flex flex-row justify-between items-center px-4">
        <Text className="text-[20px]  my-3">Add candiates to the {name} group</Text>
        {addcontacts.length > 0 && (
          <TouchableOpacity onPress={pushCandidates}>
            <AntDesign name="adduser" size={24} color="blue" />
          </TouchableOpacity>
        )}
      </View>
      <View className="bg-gray-400 mx-3 rounded-md p-2 mt-2">
        <TextInput
          placeholder="search"
          value={search}
          onChangeText={(e) => setSearch(e)}
        />
      </View>
      <View className="flex-1 mx-4 p-2">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {filteredContacts.length > 0 ? (
            filteredContacts.map((item, index) => (
              <TouchableOpacity
                key={index}
                className={`${
                  addcontacts.includes(item.id) ? "bg-blue-300" : "bg-gray-300"
                } my-2 py-3 flex flex-row justify-between items-center px-6 rounded-md`}
                onPress={() => handleSelectContact(item.id)}
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
