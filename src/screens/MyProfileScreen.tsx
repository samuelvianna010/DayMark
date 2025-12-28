import { changeUserName, getAllTasks, getUserData } from "@/domain/database";
import { Task, UserData } from "@/domain/types";
import { FontAwesome } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";

import { rem } from "nativewind";
import {
	ScrollView,
	Text,
	TextInput,
	View,
	Dimensions,
	FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect } from "@react-navigation/native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import moment from "moment";

export default function MyProfileScreen() {
	const [userData, setUserData] = useState<UserData>();
	const [userNameInput, setUserNameInput] = useState<string>(
		userData?.name || "User"
	);
	const [taskData, setTaskData] = useState<Task[]>();

	useFocusEffect(
		useCallback(() => {
			const loadData = async () => {
				const user = (await getUserData()) as UserData;
				setUserData(user);
				setUserNameInput(user.name);
				const tasks = await getAllTasks();
				setTaskData(tasks);
			};
			loadData();
		}, [])
	);
	useEffect(() => {
		console.log(userData);
	}, [userData]);

	const reloadData = async () => {
		setUserData((await getUserData()) as UserData);
	};

	const gridData = [
		<View className="bg-gray-100 rounded-xl flex-1 m-2 p-3 h-40 justify-between">
			<Text className="text-black text-xl">Tarefas Criadas</Text>
			<View className="w-full">
				<Text className="w-full text-right text-8xl  font-extrabold">
					{taskData?.length}
				</Text>
			</View>
		</View>,
		<View className="bg-gray-100 rounded-xl flex-1 m-2 p-3 h-60 justify-between">
			<Text className="text-black text-xl">Tarefas Concluídas</Text>
			<View className="w-full">
				<Text className="w-full text-right text-8xl  font-extrabold">
					{taskData?.filter((t) => t.status === "done").length}
				</Text>
			</View>
		</View>,
		<View className="bg-gray-100 rounded-xl flex-1 m-2 p-3 h-60 justify-between">
			<Text className="text-black text-xl">% de tarefas concluídas</Text>
			<View className="w-full justify-end items-end">
				<AnimatedCircularProgress
					size={rem.get() * 8}
					width={15}
					fill={
						(taskData?.filter((t) => t.status === "done").length ?? 0) *
						(100 / (taskData?.length ?? 1))
					}
					rotation={0}
					tintColor={"#2563EB" as string}
					backgroundColor="#172554"
				>
					{(fill: number) => (
						<Text className="text-2xl font-bold">{Math.round(fill)}%</Text>
					)}
				</AnimatedCircularProgress>
			</View>
		</View>,
		<View className="bg-gray-100 rounded-xl flex-1 m-2 p-3 h-80 justify-between">
			<Text className="text-black text-xl">Tempo no Modo de Foco</Text>
			<View className="w-full">
				<Text
					className="w-full text-right text-8xl font-extrabold mb-[-10]"
					adjustsFontSizeToFit
				>
					{moment.duration(userData?.sumDurFMTimers).minutes()}
				</Text>
				<Text className="w-full text-right text-2xl  font-extrabold">
					minutos
				</Text>
			</View>
		</View>,
		<View className="bg-gray-100 rounded-xl flex-1 m-2 p-3 h-80 justify-between">
			<Text className="text-black text-xl">Timers Criados no Modo de Foco</Text>
			<View className="w-full">
				<Text
					className="w-full text-right text-8xl font-extrabold mb-[-10]"
					adjustsFontSizeToFit
				>
					{userData?.numFMTimers}
				</Text>
				<Text className="w-full text-right text-2xl  font-extrabold">
					timer{(userData?.numFMTimers as number) > 1 ? "s" : ""}
				</Text>
			</View>
		</View>,
	];

	if (!userData) return;
	return (
		<SafeAreaView className="bg-white flex-1">
			<ScrollView className="bg-white flex-1 pt-5" fadingEdgeLength={80}>
				<View className="items-center justify-center">
					<View className="w-40 h-40 items-center justify-center bg-blue-100 rounded-full">
						{!userData.name || userData.name === "User" ? (
							<FontAwesome name="user" size={80} color={"#172554"} />
						) : (
							<Text className="text-8xl text-blue-95 font-black">
								{userData.name[0].toUpperCase()}
							</Text>
						)}
					</View>
					<TextInput
						className="bg-gray-50 mt-3 w-52 rounded-lg text-black text-xl"
						value={userNameInput}
						onChangeText={(text) => {
							setUserNameInput(text);
						}}
						onChange={() => {
							changeUserName(userNameInput);
							reloadData();
						}}
					></TextInput>
				</View>
				<View className="p-4">
					<FlashList
						masonry
						data={gridData}
						keyExtractor={(_, i) => i.toString()}
						renderItem={(item) => item.item}
						numColumns={2}
					/>
				</View>
				{/* GRID LAYOUT */}
			</ScrollView>
		</SafeAreaView>
	);
}
