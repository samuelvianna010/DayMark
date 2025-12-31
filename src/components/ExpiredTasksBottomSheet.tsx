import { deleteTask, updateTaskStatus } from "@/domain/database";
import { Task } from "@/domain/types";
import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useColorScheme } from "nativewind";
import { ForwardedRef, forwardRef, useImperativeHandle, useRef } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
type Props = {
	tasks: Task[] | null;
};

export interface ExpiredTasksBottomSheetRef {
	modalUp: () => void;
	modalDown: () => void;
}
const ExpiredTasksBottomSheet = forwardRef<ExpiredTasksBottomSheetRef, Props>(
	(props, ref) => {
		if (!props.tasks) return;
		const bottomSheetRef = useRef<BottomSheet>(null);
		const scheme = useColorScheme();

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
				backgroundStyle={{
					backgroundColor: scheme.colorScheme == "dark" ? "#0a0a0a" : "white",
				}}
			>
				<BottomSheetView className="p-6">
					<View className="bg-white dark:bg-neutral-950  flex-1">
						<Text className="text-4xl font-extrabold text-orange-700 dark:text-orange-500">
							As tarefas seguintes expiraram:
						</Text>
						<View className="p-4">
							<FlatList
								data={props.tasks}
								keyExtractor={(item) => item.id.toString()}
								renderItem={({ item }) => (
									<View className="flex-row items-center mb-2">
										<Text className="text-3xl mr-2 text-black dark:text-neutral-200">
											•
										</Text>
										<Text className="text-2xl font-bold text-black dark:text-neutral-200">
											{item.name}
										</Text>
									</View>
								)}
							/>
						</View>
						<TouchableOpacity
							className="w-full p-3 bg-blue-100 dark:bg-blue-950 rounded-full items-center justify-center"
							onPress={() => bottomSheetRef.current?.close()}
						>
							<Text className="text-2xl text-blue-900 dark:text-blue-500">
								OK
							</Text>
						</TouchableOpacity>
					</View>
				</BottomSheetView>
			</BottomSheet>
		);
	}
);

export default ExpiredTasksBottomSheet;
