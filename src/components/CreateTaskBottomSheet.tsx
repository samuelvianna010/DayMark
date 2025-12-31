import { View, Text, TouchableOpacity } from "react-native";
import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
	BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { convertToTask } from "@/domain/types";
import { createTask } from "@/domain/database";
import { useColorScheme } from "nativewind";

export interface CreateTaskBottomSheetRef {
	modalUp: () => void;
	modalDown: () => void;
}

type Props = {
	onTaskCreated?: () => void;
};

const CreateTaskBottomSheet = forwardRef<CreateTaskBottomSheetRef, Props>(
	(props, ref) => {
		const scheme = useColorScheme();
		const bottomSheetRef = useRef<BottomSheet>(null);

		const [taskName, setTaskName] = useState<string>("");
		const [taskDescription, setTaskDescription] = useState<string>("");

		// Expondo métodos ao pai
		useImperativeHandle(ref, () => ({
			modalUp: () => {
				bottomSheetRef.current?.expand();
			},
			modalDown: () => {
				bottomSheetRef.current?.close();
			},
		}));

		const handleOK = async () => {
			if (taskName && taskDescription) {
				const task = convertToTask(taskName, taskDescription);

				await createTask(task);

				props.onTaskCreated?.();

				// Fecha o bottom sheet via bottomSheetRef
				bottomSheetRef.current?.close();
				setTaskName("");
				setTaskDescription("");
			}
		};

		return (
			<BottomSheet
				ref={bottomSheetRef}
				index={-1}
				enablePanDownToClose
				backdropComponent={(backdropProps) => (
					<BottomSheetBackdrop
						{...backdropProps}
						pressBehavior="close"
						appearsOnIndex={0}
						disappearsOnIndex={-1}
					/>
				)}
				enableDynamicSizing
				keyboardBlurBehavior="restore"
				backgroundStyle={{
					backgroundColor: scheme.colorScheme == "dark" ? "#0a0a0a" : "white",
				}}
			>
				<BottomSheetView
					style={{ padding: 20 }}
					className="bg-white dark:bg-neutral-950"
				>
					<Text className="text-black dark:text-neutral-200  text-2xl font-bold ">
						Nova Tarefa
					</Text>

					<BottomSheetTextInput
						className="mt-4 w-full h-30 bg-gray-100 dark:bg-neutral-900  rounded-lg text-black dark:text-neutral-200"
						placeholder="Nome da tarefa"
						placeholderTextColor={
							scheme.colorScheme == "light" ? "black" : "gray"
						}
						onChangeText={setTaskName}
					/>

					<BottomSheetTextInput
						className="mt-3 w-full h-40 align-top bg-gray-100 dark:bg-neutral-900 rounded-lg text-black dark:text-neutral-200"
						placeholder="Descrição da tarefa"
						placeholderTextColor={
							scheme.colorScheme == "light" ? "black" : "gray"
						}
						multiline
						onChangeText={setTaskDescription}
					/>

					<View className="flex-row items-center justify-center my-4 gap-4">
						<TouchableOpacity
							className="bg-gray-300 dark:bg-neutral-900 rounded-3xl p-3 w-40 items-center"
							onPress={() => bottomSheetRef.current?.close()}
						>
							<Text className="text-black dark:text-neutral-200 text-xl">
								Cancel
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							className="bg-gray-300 dark:bg-neutral-900 rounded-3xl p-3 w-40 items-center"
							onPress={handleOK}
						>
							<Text className="text-black dark:text-neutral-200 text-xl">
								OK
							</Text>
						</TouchableOpacity>
					</View>
				</BottomSheetView>
			</BottomSheet>
		);
	}
);

export default CreateTaskBottomSheet;
