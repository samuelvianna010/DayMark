import "./global.css";

import { useColorScheme, View } from "react-native";

import "react-native-gesture-handler";

import Navigation from "./navigation";
import { initDatabase } from "@/domain/database";

export default function App() {
	initDatabase();
	const scheme = useColorScheme();

	return (
		<View className={scheme === "dark" ? "dark flex-1" : "flex-1"}>
			<Navigation />
		</View>
	);
}
