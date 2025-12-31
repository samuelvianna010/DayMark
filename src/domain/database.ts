import * as SQLite from "expo-sqlite";
import { Task, TaskStatus, UserData } from "./types";
import { getTodayDate } from "./dates";

let db: SQLite.SQLiteDatabase | null = null;
let dbInitPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
	if (db) return db;
	if (dbInitPromise) return dbInitPromise;

	dbInitPromise = (async () => {
		const database = await SQLite.openDatabaseAsync("daymark.db");

		await database.execAsync(`
			CREATE TABLE IF NOT EXISTS Task (
				id INTEGER NOT NULL,
				name TEXT NOT NULL,
				description TEXT,
				date TEXT NOT NULL,
				createdAt INTEGER NOT NULL,
				completedAt INTEGER,
				status TEXT NOT NULL
			);
			CREATE TABLE IF NOT EXISTS UserData (
	id INTEGER PRIMARY KEY NOT NULL,
	name TEXT NOT NULL,
	numFMTimers INTEGER NOT NULL,
	sumDurFMTimers INTEGER NOT NULL
);

			INSERT OR IGNORE INTO UserData (id, name, numFMTimers, sumDurFMTimers)
			VALUES (0, 'User', 0, 0);
		`);

		db = database;
		return database;
	})();

	return dbInitPromise;
}

export async function createTask(task: Task) {
	const database = await initDatabase();
	await database.runAsync(
		`INSERT INTO Task (id, name, description, date, createdAt, completedAt, status)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
}

export async function deleteTask(task: Task) {
	const database = await initDatabase();
	await database.runAsync(`DELETE FROM Task WHERE id = ?`, [task.id]);
}

export async function updateTaskStatus(task: Task, status: TaskStatus) {
	const todayDate = getTodayDate();
	if (task.date !== todayDate) return;

	const database = await initDatabase();
	const now = Date.now();

	await database.runAsync(
		`UPDATE Task SET status = ?, completedAt = ? WHERE id = ?`,
		[status, now, task.id]
	);
}

export async function expireTasks() {
	const database = await initDatabase();
	const todayDate = getTodayDate();

	await database.runAsync(
		`UPDATE Task
		 SET status = 'expired'
		 WHERE status = 'pending' AND date < ?`,
		[todayDate]
	);
}

export async function getAllTasks(): Promise<Task[]> {
	const database = await initDatabase();
	const rows = await database.getAllAsync(
		`SELECT * FROM Task ORDER BY createdAt DESC`
	);
	return rows as Task[];
}

export async function getTodayTasks(): Promise<Task[]> {
	const database = await initDatabase();
	const today = getTodayDate();
	const rows = await database.getAllAsync(
		`SELECT * FROM Task WHERE date = ? ORDER BY createdAt DESC`,
		[today]
	);
	return rows as Task[];
}

export async function getRecentlyExpiredTasks(since: number): Promise<Task[]> {
	const database = await initDatabase();
	const rows = await database.getAllAsync(
		`SELECT * FROM Task
		 WHERE status = 'expired'
		   AND completedAt >= ?
		 ORDER BY completedAt DESC`,
		[since]
	);
	return rows as Task[];
}

export async function getUserData(): Promise<UserData | null> {
	const database = await initDatabase();
	const result: any[] = await database.getAllAsync(
		`SELECT * FROM UserData WHERE id = 0 LIMIT 1`
	);

	if (result.length === 0) {
		// fallback explícito, não fé
		return {
			id: 0,
			name: "User",
			numFMTimers: 0,
			sumDurFMTimers: 0,
		};
	}

	const row = result[0];
	return {
		id: row.id,
		name: row.name,
		numFMTimers: row.numFMTimers,
		sumDurFMTimers: row.sumDurFMTimers,
	};
}

export async function changeUserName(name: string): Promise<void> {
	const database = await initDatabase();
	await database.runAsync(`UPDATE UserData SET name = ? WHERE id = 0`, [name]);
}

export async function addFMTimer(duration: number): Promise<void> {
	const database = await initDatabase();
	await database.runAsync(
		`UPDATE UserData
		 SET numFMTimers = numFMTimers + 1,
		     sumDurFMTimers = sumDurFMTimers + ?
		 WHERE id = 0`,
		[duration]
	);
}

export async function forceExpireAllPendingTasks(): Promise<void> {
	const database = await initDatabase();
	const now = Date.now();

	await database.runAsync(
		`UPDATE Task
		 SET status = 'expired',
		     completedAt = ?
		 WHERE status = 'pending'`,
		[now]
	);
}
