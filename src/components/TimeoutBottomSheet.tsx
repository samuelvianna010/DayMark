import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { Text, TouchableOpacity, View, Vibration } from "react-native";
import moment from "moment";

export interface TimeoutBottomSheetRef {
	modalUp: () => void;
	modalDown: () => void;
}
import * as Haptics from "expo-haptics";

type Props = {
	timeValues: {
		h: number;
		m: number;
		s: number;
	};
};

const TimeoutBottomSheet = forwardRef(({ timeValues }: Props, ref) => {
	useImperativeHandle(ref, () => ({
		modalUp: () => bottomSheetRef.current?.expand(),
		modalDown: () => bottomSheetRef.current?.close(),
	}));

	const bottomSheetRef = useRef<BottomSheet>(null);
	const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);

	return (
		<BottomSheet
			index={-1}
			enablePanDownToClose
			ref={bottomSheetRef}
			backdropComponent={(props) => (
				<BottomSheetBackdrop
					{...props}
					opacity={0.5}
					pressBehavior={"none"}
					appearsOnIndex={0}
					disappearsOnIndex={-1}
					enableTouchThrough={false}
				/>
			)}
			onChange={(index) => {
				if (index >= 0) {
					Vibration.vibrate([0, 800, 50, 800], true);
				} else {
					Vibration.cancel();
				}
			}}
		>
			<BottomSheetView className="bg-white w-screen p-6">
				<View className="items-center w-full">
					<Text className="text-black font-bold text-3xl">Seu timer de</Text>
					<Text className="text-blue-950 font-black text-6xl ">
						{`${timeValues.h.toString().padStart(2, "0")}:${timeValues.m.toString().padStart(2, "0")}:${timeValues.s.toString().padStart(2, "0")}`}
					</Text>
					<Text className="text-black font-bold text-3xl">acabou</Text>
				</View>
				<TouchableOpacity
					className="w-full rounded-3xl bg-blue-200 items-center justify-center p-3 mt-4"
					onPress={() => bottomSheetRef.current?.close()}
				>
					<Text className="text-blue-900 text-3xl">OK</Text>
				</TouchableOpacity>
			</BottomSheetView>
		</BottomSheet>
	);
});

export default TimeoutBottomSheet;
