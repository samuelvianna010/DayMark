import { getTodayDate } from "./dates";

export type DateString = `${number}-${number}-${number}`; // YYYY-MM-DD
export type TaskStatus = "pending" | "done" | "expired";

export interface Task {
	id: number;
	name: string;
	description?: string;
	date: DateString;
	createdAt: number;
	completedAt?: number;
	status: TaskStatus;
}

export function convertToTask(name: string, description: string): Task {
	const now = Date.now();
	return {
		id: now,
		name,
		description,
		date: getTodayDate(),
		createdAt: now,
		status: "pending",
	} as Task;
}
