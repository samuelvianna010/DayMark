import { View, Text, TouchableOpacity } from "react-native";
import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
	BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { convertToTask } from "@/domain/types";
import { createTask } from "@/domain/database";

export interface CreateTaskBottomSheetRef {
	modalUp: () => void;
	modalDown: () => void;
}

type Props = {
	onTaskCreated?: () => void;
};

const CreateTaskBottomSheet = forwardRef<CreateTaskBottomSheetRef, Props>(
	(props, ref) => {
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
			>
				<BottomSheetView style={{ padding: 20 }}>
					<Text className="text-black text-2xl font-bold ">Nova Tarefa</Text>

					<BottomSheetTextInput
						className="mt-4 w-full h-30 bg-gray-100 rounded-lg text-black"
						placeholder="Nome da tarefa"
						placeholderTextColor="black"
						onChangeText={setTaskName}
					/>

					<BottomSheetTextInput
						className="mt-3 w-full h-40 align-top bg-gray-100 rounded-lg text-black"
						placeholder="Descrição da tarefa"
						placeholderTextColor="black"
						multiline
						onChangeText={setTaskDescription}
					/>

					<View className="flex-row items-center justify-center my-4 gap-4">
						<TouchableOpacity
							className="bg-gray-300 rounded-3xl p-3 w-40 items-center"
							onPress={() => bottomSheetRef.current?.close()}
						>
							<Text className="text-black text-xl">Cancel</Text>
						</TouchableOpacity>

						<TouchableOpacity
							className="bg-gray-300 rounded-3xl p-3 w-40 items-center"
							onPress={handleOK}
						>
							<Text className="text-black text-xl">OK</Text>
						</TouchableOpacity>
					</View>
				</BottomSheetView>
			</BottomSheet>
		);
	}
);

export default CreateTaskBottomSheet;
