import * as SQLite from "expo-sqlite";
import { Task, TaskStatus } from "./types";
import { getTodayDate } from "./dates";

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase() {
	if (db) return db;

	db = await SQLite.openDatabaseAsync("daymark.db");

	try {
		await db.runAsync(`
      CREATE TABLE IF NOT EXISTS Task (
        id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        completedAt INTEGER,
        status TEXT NOT NULL
      );
    `);

		console.log("Database initialized.");
	} catch (err) {
		console.error("Database init error:", err);
	}

	return db;
}

export async function createTask(task: Task) {
	const database = await initDatabase();
	try {
		await database.runAsync(
			`INSERT INTO Task (id, name, description, date, createdAt, completedAt, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[
				task.id,
				task.name,
				task.description ?? null,
				task.date,
				task.createdAt,
				task.completedAt ?? null,
				task.status,
			]
		);
		console.log("Task created successfully");
	} catch (err) {
		console.error("Error creating task:", err);
	}
}

export async function updateTaskStatus(task: Task, status: TaskStatus) {
	const todayDate = getTodayDate();
	if (task.date === todayDate) {
		const database = await initDatabase();
		const now = Date.now();
		try {
			await database.runAsync(
				`UPDATE Task SET status = ?, completedAt = ? WHERE id = ?`,
				[status, now, task.id]
			);
			console.log("Task updated successfully");
		} catch (err) {
			console.log("Error updating task state:", err);
		}
	} else {
		console.log("Task expired");
	}
}

export async function deleteTask(task: Task) {
	const database = await initDatabase();

	try {
		const query = database.runAsync(`DELETE FROM Task WHERE id = ?`, [task.id]);
		console.log("Task deleted successfully.");
	} catch (err) {
		console.log("Error deleting task:", err);
	}
}

export async function expireTasks() {
	const database = await initDatabase();
	const todayDate = getTodayDate();
	try {
		await database.runAsync(
			`UPDATE Task 
             SET status = 'expired' 
             WHERE status = 'pending' AND date < ?`,
			[todayDate]
		);
		console.log("Expired tasks updated successfully");
	} catch (err) {
		console.error("Error expiring tasks:", err);
	}
}

export async function getAllTasks(): Promise<Task[]> {
	const database = await initDatabase();
	await expireTasks();
	try {
		const rows: any[] = await database.getAllAsync(
			"SELECT * FROM Task ORDER BY createdAt DESC"
		);
		console.log("Fetched tasks:", rows);
		return rows as Task[];
	} catch (err) {
		console.error("Error querying tasks:", err);
		return [];
	}
}

export async function getTodayTasks(): Promise<Task[]> {
	const database = await initDatabase();
	const today = getTodayDate();
	await expireTasks();
	try {
		const rows: any[] = await database.getAllAsync(
			"SELECT * FROM Task WHERE date = ? ORDER BY createdAt DESC",
			[today]
		);
		console.log("Fetched tasks:", rows);
		return rows as Task[];
	} catch (err) {
		console.error("Error querying tasks:", err);
		return [];
	}
}
