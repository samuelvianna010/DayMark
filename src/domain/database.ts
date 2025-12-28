import * as SQLite from "expo-sqlite";
import { Task, TaskStatus, UserData } from "./types";
import { getTodayDate } from "./dates";

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase() {
	if (db) return db;

	db = await SQLite.openDatabaseAsync("daymark.db");

	try {
		await db.execAsync(`
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
		id INTEGER NOT NULL,
		name TEXT NOT NULL,
		numFMTimers INTEGER NOT NULL,
		sumDurFMTimers INTEGER NOT NULL
	  );
	  INSERT OR IGNORE INTO UserData (id, name, numFMTimers, sumDurFMTimers) VALUES (0, 'User', 0, 0);
    
    `);

		console.log("Database initialized.");
	} catch (err) {
		console.error("Database init error:", err);
	}

	return db;
}

/* --------------------- TASK CRUD --------------------- */
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

export async function deleteTask(task: Task) {
	const database = await initDatabase();
	try {
		await database.runAsync(`DELETE FROM Task WHERE id = ?`, [task.id]);
		console.log("Task deleted successfully.");
	} catch (err) {
		console.log("Error deleting task:", err);
	}
}

/* --------------------- TASK STATUS / EXPIRE --------------------- */
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

/* --------------------- TASK QUERIES --------------------- */
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

/* --------------------- USER DATA (placeholder) --------------------- */
// Aqui você vai criar funções como:
// export async function getUserData() { ... }
// export async function saveUserData(name: string, timersCreated: number, avgDuration: number) { ... }
// export async function clearUserData() { ... }

export async function getUserData(): Promise<UserData | null> {
	const database = await initDatabase();
	try {
		const result: any[] = await database.getAllAsync("SELECT * FROM UserData");
		if (result.length === 0) return null;
		// Mapear para UserData
		const row = result[0];
		return {
			id: row.id,
			name: row.name,
			numFMTimers: row.numFMTimers,
			sumDurFMTimers: row.sumDurFMTimers,
		};
	} catch (err) {
		console.log("Error getting userdata:", err);
		return null;
	}
}

// Atualizar nome do usuário
export async function changeUserName(name: string): Promise<void> {
	const database = await initDatabase();
	try {
		await database.runAsync("UPDATE UserData SET name = ? WHERE id = 0", [
			name,
		]);
	} catch (err) {
		console.log("Error updating user name:", err);
	}
}

// Incrementar contador e somar duração de modo foco
export async function addFMTimer(duration: number): Promise<void> {
	const database = await initDatabase();
	try {
		await database.runAsync(
			"UPDATE UserData SET numFMTimers = numFMTimers + 1, sumDurFMTimers = sumDurFMTimers + ? WHERE id = 0",
			[duration]
		);
	} catch (err) {
		console.log("Error adding FM timer:", err);
	}
}
