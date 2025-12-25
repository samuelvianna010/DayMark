import "./global.css";

import { DefaultTheme, DarkTheme } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { useMemo } from "react";
import "react-native-gesture-handler";

import Navigation from "./navigation";
import { initDatabase } from "@/domain/database";

export default function App() {
	initDatabase();
	const colorScheme = useColorScheme();
	const theme = useMemo(
		() => (colorScheme === "dark" ? DarkTheme : DefaultTheme),
		[colorScheme]
	);

	return <Navigation theme={theme} />;
}
