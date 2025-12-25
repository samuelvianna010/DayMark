import {
	createStaticNavigation,
	StaticParamList,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TasksScreen from "@/screens/TasksScreen";
import { FontAwesome6 } from "@expo/vector-icons";
import FocusModeScreen from "@/screens/FocusModeScreen";

const TasksStack = createStackNavigator({
	screens: {
		Tasks: {
			screen: TasksScreen,
			options: {
				headerShown: false,
			},
		},
	},
});

const FocusModeStack = createStackNavigator({
	screens: {
		FocusMode: {
			screen: FocusModeScreen,
			options: {
				headerShown: false,
			},
		},
	},
});

const Tabs = createBottomTabNavigator({
	screens: {
		FocusModeTab: {
			screen: FocusModeStack,
			options: {
				title: "Modo Foco",
				freezeOnBlur: false,
				tabBarIcon: ({ color, size }) => (
					<FontAwesome6 name="clock" size={size} color={color} />
				),
			},
		},
		TasksTab: {
			screen: TasksStack,
			options: {
				title: "Tarefas",
				freezeOnBlur: false,
				tabBarIcon: ({ color, size }) => (
					<FontAwesome6 name="list-check" size={size} color={color} />
				),
			},
		},
	},
	screenOptions: {
		headerShown: false,
	},
});

type RootNavigatorParamList = StaticParamList<typeof TasksStack>;

declare global {
	namespace ReactNavigation {
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		interface RootParamList extends RootNavigatorParamList {}
	}
}

const Navigation = createStaticNavigation(Tabs);
export default Navigation;
