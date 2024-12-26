import { StatusBar } from "expo-status-bar";
import {
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useEffect, useState } from "react";
import auth from "@react-native-firebase/auth";
import AntDesign from "@expo/vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { images } from "../../constants/images";
import { router } from "expo-router";
import Spinner from "react-native-loading-spinner-overlay";

export default function App() {
  const [spin,setSpin]=useState(false)
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "834495022514-o5l8l838a65l4d3laf7af76gv68fl064.apps.googleusercontent.com",
    });
  }, []);

  async function onGoogleButtonPress() {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      // Get the users ID token
      setSpin(true)
      const signInResult = await GoogleSignin.signIn();

      // Try the new style of google-sign in result, from v13+ of that module
      idToken = signInResult.data?.idToken;
      AsyncStorage.setItem("token", idToken);
      console.log(idToken);
      if (!idToken) {
        // if you are using older versions of google-signin, try old style result
        idToken = signInResult.idToken;
      }
      if (!idToken) {
        throw new Error("No ID token found");
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(
        signInResult.data.idToken
      );
      // console.log(googleCredential.us)
      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(
        googleCredential
      );
      console.log(userCredential.user);
      await AsyncStorage.setItem("userid", userCredential.user.uid);
      await AsyncStorage.setItem("userName", userCredential.user.displayName);
      await AsyncStorage.setItem("userEmail", userCredential.user.email);
      // await AsyncStorage.setItem("user", JSON.stringify(userCredential.user));
      // return user;
    } catch (error) {
      console.log(error);
    }
    finally{
      setSpin(false)
    }
  }


  return (
    <View style={styles.container}>
      <Spinner visible={spin}/>
      <TouchableOpacity
        className="flex flex-row items-center justify-between border-gray-400 border-[0.8px] p-2 rounded-3xl"
        onPress={() =>
          onGoogleButtonPress().then(() => router.push("/auth/details"))
        }
      >
        <Image source={images.google} className="w-10 h-10 rounded-full" />
        <Text className="text-[17px]">Sign in with Google</Text>
      </TouchableOpacity>
      <Button title="sign out"  />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
