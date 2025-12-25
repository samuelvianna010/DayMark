import { deleteTask, updateTaskStatus } from "@/domain/database";
import { Task } from "@/domain/types";
import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { ForwardedRef, forwardRef, useImperativeHandle, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
type Props = {
	task: Task | null;
	onTaskUpdated: any;
};

export interface SelectedTaskBottomSheetRef {
	modalUp: () => void;
	modalDown: () => void;
}
const SelectedTaskBottomSheet = forwardRef<SelectedTaskBottomSheetRef, Props>(
	(props, ref) => {
		if (!props.task) return;
		const bottomSheetRef = useRef<BottomSheet>(null);

		useImperativeHandle(ref, () => ({
			modalUp: () => {
				bottomSheetRef.current?.expand();
			},
			modalDown: () => {
				bottomSheetRef.current?.close();
			},
		}));
		return (
			<BottomSheet
				enableDynamicSizing={true}
				enablePanDownToClose={true}
				backdropComponent={(props) => (
					<BottomSheetBackdrop
						{...props}
						pressBehavior={"close"}
						opacity={0.5}
						appearsOnIndex={1}
						disappearsOnIndex={0}
					/>
				)}
				index={-1}
				snapPoints={["1%"]}
				ref={bottomSheetRef}
			>
				<BottomSheetView className="p-6">
					<Text className="text-3xl font-black">Tarefa</Text>
					<Text className="mt-3 text-2xl ">{props?.task?.name}</Text>
					<Text className="font-light mb-5">
						Descrição: {props.task?.description}
					</Text>

					<View className="gap-3">
						<TouchableOpacity
							className="w-full p-4 rounded-3xl bg-blue-200"
							activeOpacity={0.85}
							onPress={() => {
								updateTaskStatus(
									props.task as Task,
									props.task?.status == "done" ? "pending" : "done"
								);

								bottomSheetRef.current?.close();
								props.onTaskUpdated();
							}}
						>
							<Text className="text-blue-800 text-center text-xl">
								{props.task?.status === "done"
									? "Marcar como incompleta"
									: "Marcar como completa"}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							className="w-full p-4 rounded-3xl bg-red-200"
							activeOpacity={0.85}
							onPress={() => {
								deleteTask(props.task as Task);
								bottomSheetRef.current?.close();
								props.onTaskUpdated();
							}}
						>
							<Text className="text-red-800 text-center text-xl">
								Excluir Tarefa
							</Text>
						</TouchableOpacity>
					</View>
				</BottomSheetView>
			</BottomSheet>
		);
	}
);

export default SelectedTaskBottomSheet;
