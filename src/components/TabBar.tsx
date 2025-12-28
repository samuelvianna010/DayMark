import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	interpolateColor,
	interpolate,
	Layout,
} from "react-native-reanimated";
import { useEffect } from "react";
import { LayoutAnimation, TouchableOpacity, View } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

export default function TabBar({
	state,
	descriptors,
	navigation,
}: BottomTabBarProps) {
	const sharedValues = state.routes.map(() => useSharedValue(0));

	useEffect(() => {
		sharedValues.forEach((v, i) => {
			// spring padrão
			v.value = withSpring(state.index === i ? 1 : 0);
		});
	}, [state.index]);

	return (
		<View className="flex-row gap-3 align-center justify-center p-4 pb-6 bg-white">
			{state.routes.map((route, index) => {
				const { options } = descriptors[route.key];
				const isFocused = state.index === index;

				const onPress = () => navigation.navigate(route.name);

				const animatedStyle = useAnimatedStyle(() => ({
					backgroundColor: interpolateColor(
						sharedValues[index].value,
						[0, 1],
						["#dbeafe", "#2563eb"]
					),
				}));

				const textStyle = useAnimatedStyle(() => ({
					opacity: sharedValues[index].value,
					transform: [
						{
							translateX: interpolate(
								sharedValues[index].value,
								[0, 1],
								[-10, 0]
							),
						},
					],
					color: "white",
					fontWeight: "900",
				}));

				const icon = options.tabBarIcon?.({
					focused: isFocused,
					color: isFocused ? "#fff" : "#2563eb",
					size: 24,
				});

				return (
					<TouchableOpacity
						key={route.key}
						onPress={onPress}
						activeOpacity={0.8}
						style={{
							overflow: "hidden",
							width: isFocused ? 200 : 60,
						}} /* protege overlap */
					>
						<Animated.View
							style={[
								{
									borderRadius: 30,
									paddingVertical: 8,
									flexDirection: "row",

									alignItems: "center",
									justifyContent: "center",
									gap: 10 /* um espacinho para não grudar */,
								},
								animatedStyle,
							]}
						>
							{icon}
							{isFocused && (
								<Animated.Text style={[textStyle]}>
									{options.title}
								</Animated.Text>
							)}
						</Animated.View>
					</TouchableOpacity>
				);
			})}
		</View>
	);
}
