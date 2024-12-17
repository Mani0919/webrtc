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
  doc,
  getDoc,
  query,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
export default function chat() {
  const params = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userid, setUserid] = useState("");

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
    const messagesRef = collection(db, "messages", params.groupid, "chat");
    const q = query(messagesRef, orderBy("createdAt", "asc")); // Order by timestamp

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderedMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate(); // Convert Firebase timestamp to JS Date
        const readableDate = createdAt
          ? `${createdAt.getFullYear()}-${String(
              createdAt.getMonth() + 1
            ).padStart(2, "0")}-${String(createdAt.getDate()).padStart(2, "0")}`
          : "No Date"; // Fallback if no timestamp exists

        return {
          id: doc.id,
          ...data,
          readableDate, // Add readable date
        };
      });
      setMessages(orderedMessages);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [params.groupid]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return; // Prevent sending empty messages
    const now = new Date(); // Current Date and Time

    const formattedDate = `${String(now.getDate()).padStart(2, "0")}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${now.getFullYear()}`; // DD-MM-YYYY

    try {
      await addDoc(collection(db, "messages", params.groupid, "chat"), {
        senderId: await AsyncStorage.getItem("userid"), // Replace with your logged-in user's ID
        content: newMessage,
        createdAt: serverTimestamp(),
        date: formattedDate,
      });
      console.log("added");
      setNewMessage(""); // Clear input field after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // const checkGroupAccess = async () => {
  //   const groupDoc = await getDoc(doc(db, "groups", params.groupid));
  //   const groupData = groupDoc.data();

  //   if (!groupData.members.includes(userid)) {
  //     alert("You are not a member of this group!");
  //     // router.back();
  //   }
  // };
  // useEffect(() => {
  //   checkGroupAccess();

  // }, []);
  const groupedMessages = messages.reduce((acc, msg) => {
    const messageDate = new Date(msg.createdAt?.seconds * 1000);
    const formattedDate = `${String(messageDate.getDate()).padStart(
      2,
      "0"
    )}-${String(messageDate.getMonth() + 1).padStart(
      2,
      "0"
    )}-${messageDate.getFullYear()}`;

    if (!acc[formattedDate]) {
      acc[formattedDate] = [];
    }
    acc[formattedDate].push(msg);
    return acc;
  }, {});
  return (
    <SafeAreaView className="flex-1">
      <ScrollView>
        <View className="mx-2">
          {Object.keys(groupedMessages).map((date) => (
            <View key={date}>
              <Text style={{ fontWeight: "bold", marginVertical: 10 }} className="self-center">
                {date}
              </Text>

              {groupedMessages[date].map((msg) => (
                <View
                  key={msg.id}
                  style={
                    msg.senderId === userid
                      ? styles.myMessage
                      : styles.theirMessage
                  }
                >
                  <Text>{msg.content}</Text>
                  <Text style={styles.timestamp}>
                    {new Date(
                      msg.createdAt?.seconds * 1000
                    ).toLocaleTimeString()}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <View className="flex flex-row justify-between mx-3 items-center mb-2">
        <TextInput
          placeholder="Message"
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
