// Import necessary libraries
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import {
  RTCView,
  mediaDevices,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from "react-native-webrtc";
import { ref, onValue, push, remove, set } from "firebase/database";
import { useLocalSearchParams } from "expo-router";
import {  database } from "../firebaseConfig";

export default function Videocall({ route }) {
  const { phone } = useLocalSearchParams(); // Get phone number from route params
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallInitiated, setIsCallInitiated] = useState(false);
  const [notificationReceived, setNotificationReceived] = useState(false);

  const peerConnection = useRef(
    new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    })
  ).current;

  // const database = database();

  useEffect(() => {
    // Start local stream
    const startLocalStream = async () => {
      const stream = await mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
    };

    startLocalStream();

    // Set up event listeners for peer connection
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingData({ ice: event.candidate });
      }
    };

    peerConnection.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    // Listen for notifications
    const notificationRef = ref(database, `notifications/${phone}`);
    onValue(notificationRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.callRequested && !notificationReceived) {
          setNotificationReceived(true);
          Alert.alert(
            "Incoming Call",
            `You have an incoming call from ${data.caller}.`,
            [
              { text: "Decline", onPress: declineCall },
              { text: "Join Call", onPress: joinCall },
            ]
          );
        }
      }
    });

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      peerConnection.close();
    };
  }, []);

  const sendSignalingData = (data) => {
    const signalingRef = ref(database, `calls/${phone}`);
    push(signalingRef, data);
  };

  const startCall = async () => {
    setIsCallInitiated(true);
    const notificationRef = ref(database, `notifications/${phone}`);
    set(notificationRef, { callRequested: true, caller: phone });
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    sendSignalingData({ offer });
  };

  const joinCall = async () => {
    const signalingRef = ref(database, `calls/${phone}`);
    onValue(signalingRef, async (snapshot) => {
      const data = snapshot.val();
      if (data.offer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        sendSignalingData({ answer });
      }
    });

    setNotificationReceived(false);
  };

  const declineCall = () => {
    const notificationRef = ref(database, `notifications/${phone}`);
    remove(notificationRef);
    setNotificationReceived(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Call with {phone}</Text>
      <View style={styles.videoContainer}>
        {localStream && (
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            mirror
          />
        )}
        {remoteStream && (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.remoteVideo}
          />
        )}
      </View>
      <View style={styles.buttons}>
        {!isCallInitiated && <Button title="Start Call" onPress={startCall} />}
        {isCallInitiated && <Text>Waiting for user to join...</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 10,
  },
  videoContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  localVideo: {
    width: "100%",
    height: "40%",
    backgroundColor: "black",
  },
  remoteVideo: {
    width: "100%",
    height: "40%",
    backgroundColor: "gray",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
});
