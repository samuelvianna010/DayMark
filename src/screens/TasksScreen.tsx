import { getTodayDate } from "@/domain/dates";
import { useEffect, useRef, useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6 } from "@expo/vector-icons";
import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetTextInput,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import CreateTaskBottomSheet, {
	CreateTaskBottomSheetRef,
} from "@/components/CreateTaskBottomSheet";
import { getTodayTasks } from "@/domain/database";
import { Task } from "@/domain/types";
import TaskComponent from "@/components/TaskComponent";
import SelectedTaskBottomSheet, {
	SelectedTaskBottomSheetRef,
} from "@/components/SelectedTaskBottomSheet";

export default function TasksScreen(props: any) {
	const [todayTasks, setTodayTasks] = useState<Task[]>([]);
	const createTaskBSRef = useRef<CreateTaskBottomSheetRef>(null);

	const loadTasks = async () => {
		const tasks = await getTodayTasks();
		setTodayTasks(tasks);
	};

	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const selectTaskBSRef = useRef<SelectedTaskBottomSheetRef>(null);

	function openSelectedTaskBottomSheet(task: Task) {
		console.log("selecting task");
		setSelectedTask(task);

		selectTaskBSRef.current?.modalUp();
	}

	useEffect(() => {
		loadTasks();
	}, []);

	return (
		<>
			<View className="flex-1 bg-white">
				<View className="bg-gray-100 w-full px-6 pt-10 py-6">
					<Text className="text-4xl font-black">Daymark</Text>
				</View>

				<View className="flex-1 bg-white">
					{!todayTasks.length ? (
						<View className="flex-1 px-5 items-center justify-center bg-white">
							<Text className="text-3xl font-bold text-center text-black">
								Comece criando uma nova tarefa
							</Text>
						</View>
					) : (
						<ScrollView
							contentContainerStyle={{
								flexGrow: 1,
								padding: 20,
							}}
						>
							<Text className="text-3xl font-extrabold ">Tasks</Text>
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
					className="bg-gray-300 h-20 w-20 rounded-full items-center justify-center absolute bottom-5 right-4"
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
		</>
	);
}
