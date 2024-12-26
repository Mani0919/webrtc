// NotificationContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { database } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null); // Current notification state
  const [phoneid, setPhone] = useState(null);
  useEffect(() => {
    async function getPhone() {
      const phone = await AsyncStorage.getItem("phone");
      setPhone(phone);
    }
    getPhone();
  }, []);
  useEffect(() => {
    const phone = phoneid; // Replace with the actual user phone identifier
    const notificationRef = ref(database, `notifications/${phone}`);

    const unsubscribe = onValue(notificationRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.callRequested && data.status === "ringing") {
          setNotification({ caller: data.caller, status: data.status });
        } else {
          setNotification(null); // Clear notification when no call is active
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const declineCall = (phone) => {
    set(ref(database, `notifications/${phone}`), { status: "declined" });
    setNotification(null);
  };

  const acceptCall = (phone) => {
    set(ref(database, `notifications/${phone}`), { status: "accepted" });
    setNotification(null);
  };

  return (
    <NotificationContext.Provider
      value={{ notification, declineCall, acceptCall }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
