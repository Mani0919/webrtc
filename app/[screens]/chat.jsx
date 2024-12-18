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
import { mediaDevices, RTCPeerConnection, RTCView } from "react-native-webrtc";
import firebase from "firebase/compat/app";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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

  //useeffect for webrtc
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [callStarted, setCallStarted] = useState(false);
  // Get user media (audio/video) from the device
  const getUserMedia = async () => {
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: "user" },
      });
      return stream;
    } catch (error) {
      console.error("Error getting media:", error);
    }
  };

  // Start Call Method
  
  const startCall = async () => {
    const localStream = await getUserMedia();
    setLocalStream(localStream);

    const configuration = {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302", // Google's STUN server
        },
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);
    setPeerConnection(peerConnection);

    // Add tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    // Set up event listener for receiving remote tracks
    peerConnection.ontrack = (event) => {
      setRemoteStream(event.streams[0]); // Set remote stream
    };

    // Create an offer and send it to the remote peer via Firebase
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // You need to send the offer to the other peer via your signaling method (e.g., Firebase)
    firebase.firestore().collection("calls").doc(params.groupid).update({
      offer: offer,
    });

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        firebase
          .firestore()
          .collection("calls")
          .doc(params.groupid)
          .update({
            iceCandidates: firebase.firestore.FieldValue.arrayUnion(
              event.candidate
            ),
          });
      }
    };

    setCallStarted(true); // Update call state
  };

  // End Call Method
  const endCall = () => {
    // Close the peer connection and stop the local media tracks
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop()); // Stop local tracks
      setLocalStream(null);
    }

    setCallStarted(false); // Reset call state
    setRemoteStream(null); // Clear remote stream
  }; // Empty dependency array to run once when the component mounts

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
    <SafeAreaView className="flex-1 relative">
      <ScrollView className="flex-1">
        <View className="mx-2">
          {Object.keys(groupedMessages).map((date) => (
            <View key={date}>
              <Text
                style={{ fontWeight: "bold", marginVertical: 10 }}
                className="self-center"
              >
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
      <View className="">
        {localStream && (
          <RTCView
            style={{ width: "100%", height: 600 }}
            streamURL={localStream.toURL()}
          />
        )}
        {callStarted && (
          <TouchableOpacity onPress={endCall} className="-mt-10 self-center">
            <MaterialIcons name="call-end" size={44} color="red" />
          </TouchableOpacity>
        )}
      </View>
      <View>
        {remoteStream && (
          <RTCView
            style={{ width: "100%", height: 200 }}
            streamURL={remoteStream.toURL()}
          />
        )}
      </View>
      {/* <View>
        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          {callStarted && (
            <TouchableOpacity onPress={endCall}>
              <Text>End Call</Text>
            </TouchableOpacity>
          )}
        </View>
      </View> */}
      <View className="flex flex-row justify-between mx-3 items-center mb-2">
        <TextInput
          placeholder="Message"
          value={newMessage}
          onChangeText={setNewMessage}
          className="border-gray-400 border-[0.8px] p-2 flex-1 rounded-lg mr-3"
        />
        <TouchableOpacity
          onPress={() => {
            setCallStarted(true);
            startCall();
          }}
          className="mr-2"
        >
          <FontAwesome name="video-camera" size={34} color="black" />
        </TouchableOpacity>
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
