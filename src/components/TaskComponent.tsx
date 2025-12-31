import { Task } from "@/domain/types";
import { Text, TouchableOpacity, View } from "react-native";
import CheckBox from "@react-native-community/checkbox";
import { useRef, useState } from "react";
import { updateTaskStatus } from "@/domain/database";
import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
} from "@gorhom/bottom-sheet";

type Props = {
	task: Task | null;
	onSelectTask: any;
	loadTasks: any;
};
export default function TaskComponent({
	task,
	onSelectTask,
	loadTasks,
}: Props) {
	return (
		<>
			<TouchableOpacity
				className="bg-gray-200 dark:bg-neutral-900 mt-5 rounded-3xl p-4 flex-row gap-2 items-center"
				activeOpacity={0.85}
				onLongPress={() => onSelectTask(task)}
			>
				<CheckBox
					tintColors={{
						true: "#1d4ed8",
						false: "#111111",
					}}
					animationDuration={200}
					disabled={task?.status === "expired"}
					value={task?.status === "done"}
					onValueChange={(newValue) => {
						updateTaskStatus(task as Task, newValue ? "done" : "pending");
						loadTasks();
					}}
				/>
				<Text
					className={`text-black dark:text-neutral-200 ${task?.status === "expired" ? "line-through text-gray-400 dark:text-neutral-600" : ""}`}
				>
					{task?.name}
				</Text>
			</TouchableOpacity>
		</>
	);
}
