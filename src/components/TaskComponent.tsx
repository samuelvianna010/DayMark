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
};
export default function TaskComponent({ task, onSelectTask }: Props) {
	return (
		<>
			<TouchableOpacity
				className="bg-gray-200 mt-5 rounded-3xl p-4 flex-row gap-2 items-center"
				activeOpacity={0.85}
				onLongPress={() => onSelectTask(task)}
			>
				<CheckBox
					tintColors={{
						true: "#0000FF",
						false: "#111111",
					}}
					animationDuration={200}
					disabled={task?.status === "expired"}
					value={task?.status === "done"}
					onValueChange={(newValue) => {
						updateTaskStatus(task as Task, newValue ? "done" : "pending");
					}}
				/>
				<Text
					className={`text-black ${task?.status === "expired" ? "line-through text-gray-400" : ""}`}
				>
					{task?.name}
				</Text>
			</TouchableOpacity>
		</>
	);
}
