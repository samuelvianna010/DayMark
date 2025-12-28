import {
	createStaticNavigation,
	StaticParamList,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import {
	BottomTabBarProps,
	createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import TasksScreen from "@/screens/TasksScreen";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import FocusModeScreen from "@/screens/FocusModeScreen";
import { Text, TouchableOpacity, View } from "react-native";
import TabBar from "@/components/TabBar";
import MyProfileScreen from "@/screens/MyProfileScreen";

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

const MyProfileStack = createStackNavigator({
	screens: {
		MyProfile: {
			screen: MyProfileScreen,
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
					<FontAwesome name="clock-o" size={size} color={color} />
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
		MeTab: {
			screen: MyProfileScreen,
			options: {
				title: "Meu Perfil",
				freezeOnBlur: true,
				tabBarIcon: ({ color, size }) => (
					<FontAwesome name="user" size={size} color={color} />
				),
			},
		},
	},
	screenOptions: {
		headerShown: false,
	},
	tabBar: (props: BottomTabBarProps) => <TabBar {...props} />,
	initialRouteName: "TasksTab",
});

type RootNavigatorParamList = StaticParamList<typeof Tabs>;

declare global {
	namespace ReactNavigation {
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		interface RootParamList extends RootNavigatorParamList {}
	}
}

const Navigation = createStaticNavigation(Tabs);
export default Navigation;
