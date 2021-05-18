import {join} from "path";
import {readFileSync} from "fs";

export interface LoginData {
	username: string;
	password: string;
}

export interface TestData {
	correct: LoginData;
	wrong: LoginData;
}

export function getTestData(): TestData {
	const fn = join(__dirname, "../../data.json");
	const fc = readFileSync(fn , {
		encoding: "utf-8"
	});
	return <TestData>JSON.parse(fc);
}

