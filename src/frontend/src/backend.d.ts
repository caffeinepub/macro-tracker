import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DailyGoals {
    fat: number;
    carbs: number;
    calories: bigint;
    protein: number;
}
export interface FoodEntry {
    id: bigint;
    fat: number;
    mealTag: string;
    carbs: number;
    date: string;
    calories: bigint;
    name: string;
    protein: number;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFoodEntry(date: string, name: string, calories: bigint, protein: number, carbs: number, fat: number, mealTag: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteFoodEntry(entryId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyGoals(): Promise<DailyGoals>;
    getFoodEntriesByDate(date: string): Promise<Array<FoodEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setDailyGoals(calories: bigint, protein: number, carbs: number, fat: number): Promise<void>;
}
