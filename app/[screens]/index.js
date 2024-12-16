import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Button,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Link, router, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { collection, addDoc, getDocs, deleteDoc } from "@firebase/firestore";
import { db } from "../../firebaseConfig";
import { images } from "../../constants/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Entypo from "@expo/vector-icons/Entypo";
export default function index() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [groupdetails, setGroupDetails] = useState({
    id: "",
    name: "",
  });
  useEffect(() => {
    fetchGroups();
    async function fun() {
      const user = await AsyncStorage.getItem("userid");
      console.log("user", user);
    }
    fun();
  }, []);
  const fetchGroups = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "groups"));
      const res = await AsyncStorage.getItem("user");
      console.log(res);
      const groups = [];
      querySnapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() }); // Add ID and document data
      });
      console.log(groups);
      setGroups(groups); // Return fetched groups
    } catch (error) {
      console.error("Error fetching groups:", error);
      return [];
    }
  };

  const handleOpenModal = (id, name) => {
    console.log("rrr", id, name);
    setGroupDetails((prev) => ({
      ...prev,
      id: id,
      name: name,
    }));
    setShowModal(true); // Open modal
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false); // Close modal
  };

  return (
    <SafeAreaView className="flex-1">
      <TouchableOpacity className="px-5 p-2 " onPress={() => router.back()}>
        <AntDesign name="enter" size={24} color="black" />
      </TouchableOpacity>
      <View>
        <TouchableOpacity>
          <Text>Create group</Text>
        </TouchableOpacity>
      </View>
      <View className="flex flex-row items-center px-4 mt-7 justify-start gap-x-3">
        <MaterialIcons name="groups" size={27} color="black" />
        <Text className="text-[19px] font-bold">Groups</Text>
      </View>
      {groups.length === 0 ? (
        <Text>No groups found</Text>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          className="p-3 mt-7"
          renderItem={({ item }) => (
            <TouchableOpacity
              className=" h-10"
              onPress={() => {
                handleOpenModal(item.id, item.name);
              }}
            >
              <View className="flex flex-row items-center gap-x-3 w-32 h-full ">
                {item.name == "family" && (
                  <Image source={images.family} className="w-7 h-7" />
                )}
                <Text className="text-[20px]">{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={handleCloseModal} // Close modal on hardware back press
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              width: "80%",
            }}
          >
            <Text className="self-center text-[18px] mb-3">
              This is the modal content
            </Text>
            <View className="flex flex-row flex-wrap justify-around items-center py-3">
              <TouchableOpacity
                className="flex flex-col items-center"
                // onPress={() => router.push("/[screens]/chat")}
                onPress={() =>
                  router.push({
                    pathname: "/[screens]/chat",
                    params: { groupid: groupdetails.id },
                  })
                }
              >
                <Entypo name="chat" size={24} color="black" />
                <Text>Chat</Text>
              </TouchableOpacity>
              <Link
                href={{
                  pathname: "/screens/addcandiates",
                  params: { id: groupdetails.id, name: groupdetails.name },
                }}
              >
                <View className="flex flex-col items-center">
                  <AntDesign name="addusergroup" size={32} color="black" />
                  <Text>Add Candiates</Text>
                </View>
              </Link>
              <TouchableOpacity className="flex flex-col items-center">
                <AntDesign name="deleteusergroup" size={32} color="black" />
                <Text>Delete group</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleCloseModal}
              className="self-center border-[0.9px] border-red-400 p-2 px-5 rounded-lg "
            >
              <Text>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
