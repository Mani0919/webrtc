import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
export default function chat() {
  const params = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userid, setUserid] = useState("");

  const checkGroupAccess = async () => {
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    const groupData = groupDoc.data();

    if (!groupData.members.includes(currentUserId)) {
      alert("You are not a member of this group!");
      router.back();
    }
  };
  useEffect(() => {
    checkGroupAccess();
  }, []);

  useEffect(() => {
    async function fun() {
      try {
        const res = await AsyncStorage.getItem("userid");
        setUserid(res);
      } catch (error) {
        console.log(error);
      }
    }
    fun();
  }, []);
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "messages", params.groupid, "chat"), // Fetch messages for the group
      (snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    );
    return () => unsubscribe(); // Cleanup on unmount
  }, [params.groupid]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return; // Prevent sending empty messages

    try {
      await addDoc(collection(db, "messages", params.groupid, "chat"), {
        senderId: await AsyncStorage.getItem("userid"), // Replace with your logged-in user's ID
        content: newMessage,
        timestamp: serverTimestamp(),
      });
      console.log("added");
      setNewMessage(""); // Clear input field after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={
              msg.senderId === userid ? styles.myMessage : styles.theirMessage
            }
          >
            <Text>{msg.content}</Text>
            <Text style={styles.timestamp}>
              {new Date(msg.timestamp?.seconds * 1000).toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View className="flex flex-row justify-between mx-3 items-center mb-2" >
        <TextInput
          placeholder="enter"
          value={newMessage}
          onChangeText={setNewMessage}
          className="border-gray-400 border-[0.8px] p-2 flex-1 rounded-lg"
        />
        <TouchableOpacity onPress={sendMessage}>
          <MaterialCommunityIcons
            name="send-circle-outline"
            size={44}
            color="black"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ECECEC",
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 10,
    color: "gray",
    alignSelf: "flex-end",
  },
});
