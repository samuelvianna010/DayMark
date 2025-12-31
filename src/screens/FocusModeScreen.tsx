import { useEffect, useState, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

import { useNavigation } from "@react-navigation/native";
import TimeoutBottomSheet, {
	TimeoutBottomSheetRef,
} from "@/components/TimeoutBottomSheet";
import { addFMTimer } from "@/domain/database";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";

// ---------- DATA ----------
const hours = Array.from({ length: 24 }, (_, i) => ({
	label: i.toString().padStart(2, "0"),
	value: i,
}));

const minutes = Array.from({ length: 60 }, (_, i) => ({
	label: i.toString().padStart(2, "0"),
	value: i,
}));

const seconds = minutes;

export default function FocusModeScreen() {
	const navigation = useNavigation();
	const scheme = useColorScheme();

	const [h, setH] = useState(0);
	const [m, setM] = useState(25);
	const [s, setS] = useState(0);
	const [running, setRunning] = useState(false);
	const msTotalRef = useRef(0);

	const [hLeft, setHLeft] = useState(0);
	const [mLeft, setMLeft] = useState(0);
	const [sLeft, setSLeft] = useState(0);
	const msLeftRef = useRef(0);

	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const timeoutModalRef = useRef<TimeoutBottomSheetRef>(null);

	const pickerOpacity = useSharedValue(1);
	const pickerScale = useSharedValue(1);

	const displayOpacity = useSharedValue(0);
	const displayScale = useSharedValue(1.15);

	useEffect(() => {
		msTotalRef.current = h * 3600000 + m * 60000 + s * 1000;
		msLeftRef.current = msTotalRef.current;
	}, [h, m, s]);

	function startTimer() {
		setRunning(true);
		// 🔹 Inicializa o display imediatamente
		const totalSeconds = Math.floor(msLeftRef.current / 1000);

		setHLeft(Math.floor(totalSeconds / 3600));
		setMLeft(Math.floor((totalSeconds % 3600) / 60));
		setSLeft(totalSeconds % 60);
		pickerOpacity.value = withTiming(0, {
			duration: 220,
			easing: Easing.out(Easing.quad),
		});
		pickerScale.value = withTiming(0.95, { duration: 220 });

		displayOpacity.value = withTiming(1, {
			duration: 300,
			easing: Easing.out(Easing.quad),
		});
		displayScale.value = withTiming(1, {
			duration: 300,
			easing: Easing.out(Easing.quad),
		});

		timerRef.current = setInterval(() => {
			msLeftRef.current -= 1000;

			if (msLeftRef.current <= 0) {
				navigation.navigate("FocusModeTab");
				resetTimer();
				timeoutModalRef.current?.modalUp();
				return;
			}

			const totalSeconds = Math.floor(msLeftRef.current / 1000);

			const h = Math.floor(totalSeconds / 3600);
			const m = Math.floor((totalSeconds % 3600) / 60);
			const s = totalSeconds % 60;

			setHLeft(h);
			setMLeft(m);
			setSLeft(s);
		}, 1000);
	}

	function resetTimer() {
		setRunning(false);
		addFMTimer(msTotalRef.current - msLeftRef.current);

		pickerOpacity.value = withTiming(1, { duration: 200 });
		pickerScale.value = withTiming(1, { duration: 200 });

		displayOpacity.value = withTiming(0, { duration: 150 });
		displayScale.value = withTiming(1.15, { duration: 150 });

		clearInterval(timerRef.current as NodeJS.Timeout);
		msLeftRef.current = 0;
	}

	const pickerStyle = useAnimatedStyle(() => ({
		opacity: pickerOpacity.value,
		transform: [{ scale: pickerScale.value }],
	}));

	const displayStyle = useAnimatedStyle(() => ({
		opacity: displayOpacity.value,
		transform: [{ scale: displayScale.value }],
	}));

	return (
		<>
			<SafeAreaView className="bg-gray-200 dark:bg-neutral-950 p-1 h-28 items-center justify-center">
				<Text className="text-blue-950 dark:text-blue-600 font-medium text-4xl">
					modo de foco
				</Text>
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
			<View className="flex-1 bg-white dark:bg-black ">
				<View className="flex-1 justify-center items-center">
					{/* PICKER */}
					{!running && (
						<Animated.View style={pickerStyle}>
							<View className="flex-row items-center gap-5">
								<WheelPickerExpo
									height={360}
									width={80}
									items={hours}
									initialSelectedIndex={h}
									backgroundColor={
										scheme.colorScheme == "dark" ? "#000000" : "white"
									}
									haptics={true}
									onChange={({ index }) => setH(index)}
									renderItem={(props) => (
										<Text className="text-blue-800 dark:text-blue-300 text-6xl font-black">
											{props.label}
										</Text>
									)}
								/>

								<Text className="text-4xl font-black text-black dark:text-blue-200">
									:
								</Text>

								<WheelPickerExpo
									height={360}
									width={80}
									items={minutes}
									initialSelectedIndex={m}
									backgroundColor={
										scheme.colorScheme == "dark" ? "#000000" : "#ffffff"
									}
									haptics={true}
									onChange={({ index }) => setM(index)}
									renderItem={(props) => (
										<Text className="text-blue-800 dark:text-blue-300 text-6xl font-black">
											{props.label}
										</Text>
									)}
								/>

								<Text className="text-4xl font-black text-black dark:text-blue-200">
									:
								</Text>

								<WheelPickerExpo
									height={360}
									width={80}
									items={seconds}
									initialSelectedIndex={s}
									backgroundColor={
										scheme.colorScheme == "dark" ? "#000000" : "white"
									}
									haptics={true}
									onChange={({ index }) => setS(index)}
									renderItem={(props) => (
										<Text className="text-blue-800 dark:text-blue-300 text-6xl font-black">
											{props.label}
										</Text>
									)}
								/>
							</View>
						</Animated.View>
					)}

					{/* DISPLAY FINAL */}
					{running && (
						<Animated.View style={displayStyle}>
							<Text className="text-6xl font-black text-blue-800 dark:text-blue-300 tracking-tight">
								{`${String(hLeft).padStart(2, "0")}:${String(mLeft).padStart(
									2,
									"0"
								)}:${String(sLeft).padStart(2, "0")}`}
							</Text>
						</Animated.View>
					)}
				</View>

				{/* CONTROLS */}
				<View className="pb-10 items-center">
					{!running ? (
						<TouchableOpacity
							onPress={startTimer}
							className="bg-orange-900 px-8 py-4 rounded-full"
						>
							<Text className="text-white font-bold text-lg">Iniciar</Text>
						</TouchableOpacity>
					) : (
						<TouchableOpacity
							onPress={resetTimer}
							className="bg-gray-300 dark:bg-neutral-900 px-8 py-4 rounded-full"
						>
							<Text className="text-black dark:text-neutral-200 font-bold text-lg">
								Resetar
							</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>
			<TimeoutBottomSheet ref={timeoutModalRef} timeValues={{ h, m, s }} />
		</>
	);
}
