import { useEffect, useState, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import moment from "moment";

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
	const [h, setH] = useState(0);
	const [m, setM] = useState(25);
	const [s, setS] = useState(0);
	const [running, setRunning] = useState(false);

	const [hLeft, setHLeft] = useState(0);
	const [mLeft, setMLeft] = useState(0);
	const [sLeft, setSLeft] = useState(0);

	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const msLeftRef = useRef(0);

	const pickerOpacity = useSharedValue(1);
	const pickerScale = useSharedValue(1);

	const displayOpacity = useSharedValue(0);
	const displayScale = useSharedValue(1.15);

	let msLeft: number;

	useEffect(() => {
		msLeftRef.current = h * 3600000 + m * 60000 + s * 1000;
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
				resetTimer();
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

		pickerOpacity.value = withTiming(1, { duration: 200 });
		pickerScale.value = withTiming(1, { duration: 200 });

		displayOpacity.value = withTiming(0, { duration: 150 });
		displayScale.value = withTiming(1.15, { duration: 150 });

		clearInterval(timerRef.current as NodeJS.Timeout);
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
		<View className="flex-1 bg-white pt-16">
			<Text className="text-4xl font-black text-center text-blue-900">
				Modo de Foco
			</Text>

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
								backgroundColor="#ffffff"
								onChange={({ index }) => setH(index)}
								renderItem={(props) => (
									<Text className="text-blue-800 text-7xl font-black">
										{props.label}
									</Text>
								)}
							/>

							<Text className="text-4xl font-black">:</Text>

							<WheelPickerExpo
								height={360}
								width={80}
								items={minutes}
								initialSelectedIndex={m}
								backgroundColor="#ffffff"
								onChange={({ index }) => setM(index)}
								renderItem={(props) => (
									<Text className="text-blue-800 text-7xl font-black">
										{props.label}
									</Text>
								)}
							/>

							<Text className="text-4xl font-black">:</Text>

							<WheelPickerExpo
								height={360}
								width={80}
								items={seconds}
								initialSelectedIndex={s}
								backgroundColor="#ffffff"
								onChange={({ index }) => setS(index)}
								renderItem={(props) => (
									<Text className="text-blue-800 text-7xl font-black">
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
						<Text className="text-6xl font-black text-blue-800 tracking-tight">
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
						className="bg-blue-800 px-8 py-4 rounded-full"
					>
						<Text className="text-white font-bold text-lg">Iniciar</Text>
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						onPress={resetTimer}
						className="bg-gray-300 px-8 py-4 rounded-full"
					>
						<Text className="text-black font-bold text-lg">Resetar</Text>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
}
