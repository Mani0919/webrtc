import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useEffect } from "react";
import auth from "@react-native-firebase/auth";
import AntDesign from '@expo/vector-icons/AntDesign';

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
      const userCredential =await auth().signInWithCredential(googleCredential);
      console.log(userCredential.user)

      // return user;
    } catch (error) {
      console.log(error);
    }
  }

  const handleout = async () => {
    try {
      const res = await GoogleSignin.signOut();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <View style={styles.container}>
      <Button
        title="Google Sign-In"
        onPress={() =>
          onGoogleButtonPress().then(() =>
            console.log("Signed in with Google!")
          )
        }
      />
      
      <Button title="sign out" onPress={handleout} />
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
