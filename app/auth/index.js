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
import { useEffect } from "react";
import auth from "@react-native-firebase/auth";
import AntDesign from "@expo/vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { images } from "../../constants/images";
import { router } from "expo-router";

export default function App() {
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
      const signInResult = await GoogleSignin.signIn();

      // Try the new style of google-sign in result, from v13+ of that module
      idToken = signInResult.data?.idToken;
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
      // await AsyncStorage.setItem("user", JSON.stringify(userCredential.user));
      // return user;
    } catch (error) {
      console.log(error);
    }
  }

  // const handleout = async () => {
  //   try {
  //     const res = await GoogleSignin.signOut();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        className="flex flex-row items-center justify-between border-gray-400 border-[0.8px] p-2 rounded-3xl"
        onPress={() =>
          onGoogleButtonPress().then(() => router.push("/landingscreen"))
        }
      >
        <Image source={images.google} className="w-10 h-10 rounded-full" />
        <Text className="text-[17px]">Sign in with Google</Text>
      </TouchableOpacity>
      {/* <Button title="sign out" onPress={handleout} /> */}
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
