import { getTodayDate } from "@/domain/dates";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	Keyboard,
	Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6 } from "@expo/vector-icons";
import CreateTaskBottomSheet, {
	CreateTaskBottomSheetRef,
} from "@/components/CreateTaskBottomSheet";
import {
	expireTasks,
	forceExpireAllPendingTasks,
	getRecentlyExpiredTasks,
	getTodayTasks,
} from "@/domain/database";
import { Task } from "@/domain/types";
import TaskComponent from "@/components/TaskComponent";
import SelectedTaskBottomSheet, {
	SelectedTaskBottomSheetRef,
} from "@/components/SelectedTaskBottomSheet";
import { useFocusEffect } from "@react-navigation/native";
import ExpiredTasksBottomSheet, {
	ExpiredTasksBottomSheetRef,
} from "@/components/ExpiredTasksBottomSheet";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";

export default function TasksScreen(props: any) {
	const scheme = useColorScheme();
	const [todayTasks, setTodayTasks] = useState<Task[]>([]);
	const createTaskBSRef = useRef<CreateTaskBottomSheetRef>(null);
	const lastExpireCheckRef = useRef<number>(Date.now());
	const [recentlyExpiredTasks, setRecentlyExpiredTasks] = useState<Task[]>([]);

	const loadTasks = async () => {
		const tasks = await getTodayTasks();
		setTodayTasks(tasks);
	};

	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const selectTaskBSRef = useRef<SelectedTaskBottomSheetRef>(null);
	const expiredTasksBottomSheetRef = useRef<ExpiredTasksBottomSheetRef>(null);

	function openSelectedTaskBottomSheet(task: Task) {
		console.log("selecting task");
		setSelectedTask(task);

		selectTaskBSRef.current?.modalUp();
	}

	useEffect(() => {
		loadTasks();
	}, []);
	useFocusEffect(
		useCallback(() => {
			checkForExpiredTasks();
		}, [])
	);
	useEffect(() => {
		if (!recentlyExpiredTasks.length) return;

		expiredTasksBottomSheetRef.current?.modalUp();
	}, [recentlyExpiredTasks]);

	const checkForExpiredTasks = async () => {
		const since = lastExpireCheckRef.current;

		if (__DEV__) {
			await forceExpireAllPendingTasks();
		} else {
			await expireTasks();
		}

		const expired = await getRecentlyExpiredTasks(since);

		lastExpireCheckRef.current = Date.now();

		if (expired.length) {
			setRecentlyExpiredTasks(expired);
		}
	};

	return (
		<>
			<SafeAreaView className="bg-gray-200 dark:bg-neutral-950 p-1 h-28 items-center justify-center">
				<Image
					source={require(`src/assets/images/daymark-full.png`)}
					fadeDuration={0}
					style={{
						height: 40,
						aspectRatio: 1038 / 218,
					}}
				/>
			</SafeAreaView>
			<LinearGradient
				colors={
					scheme.colorScheme === "dark"
						? ["#0a0a0a", "#000"]
						: ["#e5e7eb", "#FFF"]
				}
				locations={[0, 1]}
				className="h-[30]"
			/>
			<View className="flex-1 ">
				<View className="flex-1 bg-white dark:bg-neutral-950 ">
					{!todayTasks.length ? (
						<View className="flex-1 px-5 items-center justify-center bg-white dark:bg-black ">
							<Text className="text-3xl font-bold text-center text-black dark:text-orange-50 mb-[-5]">
								Nenhuma tarefa para hoje
							</Text>
							<Text className="mt-2 text-base text-center text-neutral-600 dark:text-neutral-400">
								As tarefas expiram automaticamente no fim do dia
							</Text>
						</View>
					) : (
						<ScrollView
							contentContainerStyle={{
								flexGrow: 1,
								padding: 20,
							}}
							fadingEdgeLength={80}
						>
							<Text className="text-3xl font-extrabold text-black  dark:text-orange-100">
								Tasks
							</Text>
							{todayTasks.map((t, i) => (
								<TaskComponent
									task={t}
									key={i}
									onSelectTask={() => openSelectedTaskBottomSheet(t)}
									loadTasks={loadTasks}
								/>
							))}
						</ScrollView>
					)}
				</View>

				<TouchableOpacity
					onPress={() => createTaskBSRef.current?.modalUp()}
					className="bg-orange-300 dark:bg-orange-600 h-20 w-20 rounded-full items-center justify-center absolute bottom-5 right-4"
					activeOpacity={0.85}
				>
					<FontAwesome6 name="plus" color="black" size={36} />
				</TouchableOpacity>
			</View>
			<CreateTaskBottomSheet ref={createTaskBSRef} onTaskCreated={loadTasks} />
			<SelectedTaskBottomSheet
				ref={selectTaskBSRef}
				onTaskUpdated={loadTasks}
				task={selectedTask}
			/>
			<ExpiredTasksBottomSheet
				ref={expiredTasksBottomSheetRef}
				tasks={recentlyExpiredTasks}
			/>
		</>
	);
}
