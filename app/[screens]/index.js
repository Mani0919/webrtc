import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Button,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Link, router, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "@firebase/firestore";
import { db } from "../../firebaseConfig";
import { images } from "../../constants/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
export default function index() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [addnewgroup, setAddnewgroup] = useState(false);
  const [newgroupname, setNewgroupname] = useState("");
  const [groupdetails, setGroupDetails] = useState({
    id: "",
    name: "",
  });
  const [user, setUser] = useState("");
  useEffect(() => {
    fetchGroups();
    async function fun() {
      const user = await AsyncStorage.getItem("userid");
      setUser(user);
      console.log("user", user);
    }
    fun();
  }, []);
  const fetchGroups = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "groups"));
      const res = await AsyncStorage.getItem("user");
      const groups = [];
      querySnapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() }); // Add ID and document data
      });
      console.log("groups", groups);
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

  const createGroup = async () => {
    try {
      const groupRef = await addDoc(collection(db, "groups"), {
        name: newgroupname,
      });
      console.log("Group created with ID:", groupRef.id);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };
  const deleteGroup = async (groupId) => {
    try {
      const groupDocRef = doc(db, "groups", groupId);
      await deleteDoc(groupDocRef);
      console.log("Group deleted with ID:", groupId);
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };
  const getMembersByGroupId = (groupId) => {
    const group = groups.find((group) => group.id === groupId);
    return group ? group.members : null; // Return the members if group is found, else return null
  };
  return (
    <SafeAreaView className="flex-1">
      <View className="flex flex-row justify-between items-center mx-3 mt-4">
        <TouchableOpacity className="px-5 p-2 " onPress={() => router.back()}>
          <AntDesign name="enter" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex flex-col justify-center items-center gap-y-1"
          onPress={() => setAddnewgroup(true)}
        >
          <AntDesign name="pluscircle" size={24} color="black" />
          <Text>Add group</Text>
        </TouchableOpacity>
      </View>
      <View className="flex flex-row items-center px-4 mt-7 justify-start gap-x-3">
        <MaterialIcons name="groups" size={27} color="black" />
        <Text className="text-[19px] font-bold">Groups</Text>
      </View>
      {groups.length === 0 ? (
        <Text>No groups found</Text>
      ) : (
        <View className="flex flex-row flex-wrap items-center">
          {groups.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="h-14 bg-blue-400 m-2 p-2 rounded-lg" // Added margin for spacing
              onPress={() => {
                handleOpenModal(item.id, item.name);
              }}
            >
              <View className="flex flex-row items-center gap-x-3 w-32 h-full">
                {item.name === "family" ? (
                  <Image source={images.family} className="w-7 h-7" />
                ) : (
                  <FontAwesome6 name="user-group" size={24} color="black" />
                )}
                <Text className="text-[20px]">{item.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
              {groupdetails.name} group
            </Text>
            <View className="flex flex-row flex-wrap justify-around items-center py-3">
              {getMembersByGroupId(groupdetails.id) && (
                <TouchableOpacity
                  className="flex flex-col items-center"
                  onPress={() =>
                    router.push({
                      pathname: "/[screens]/chat",
                      params: { groupid: groupdetails.id },
                    })
                  }
                >
                  <Entypo name="chat" size={32} color="black" />
                  <Text>Chat</Text>
                </TouchableOpacity>
              )}
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
              <TouchableOpacity
                className="flex flex-col items-center"
                onPress={() => deleteGroup(groupdetails.id)}
              >
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={addnewgroup}
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
            <Text className="self-center text-[18px] mb-3">Add new group</Text>
            <View className="border-gray-400 border-[0.8px] p-2 rounded-md my-2">
              <TextInput
                placeholder="new group name"
                value={newgroupname}
                onChangeText={setNewgroupname}
              />
            </View>
            <View className="flex flex-row justify-center items-center gap-x-5 my-3">
              <TouchableOpacity
                onPress={createGroup}
                className="self-center border-[0.9px] border-red-400 p-2 px-5 rounded-lg "
              >
                <Text>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAddnewgroup(false)}
                className="self-center border-[0.9px] border-red-400 p-2 px-5 rounded-lg "
              >
                <Text>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
