import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DailyGoals, FoodEntry } from "../backend.d";
import { useActor } from "./useActor";

const DEFAULT_GOALS: DailyGoals = {
  calories: BigInt(2000),
  protein: 150,
  carbs: 250,
  fat: 65,
};

export function useFoodEntries(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery<FoodEntry[]>({
    queryKey: ["foodEntries", date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFoodEntriesByDate(date);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDailyGoals() {
  const { actor, isFetching } = useActor();
  return useQuery<DailyGoals>({
    queryKey: ["dailyGoals"],
    queryFn: async () => {
      if (!actor) return DEFAULT_GOALS;
      try {
        const goals = await actor.getDailyGoals();
        // If calories is 0, treat as unset
        if (goals.calories === BigInt(0)) return DEFAULT_GOALS;
        return goals;
      } catch {
        return DEFAULT_GOALS;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddFoodEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      name,
      calories,
      protein,
      carbs,
      fat,
      mealTag,
    }: {
      date: string;
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      mealTag: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addFoodEntry(
        date,
        name,
        BigInt(Math.round(calories)),
        protein,
        carbs,
        fat,
        mealTag,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["foodEntries", variables.date],
      });
    },
  });
}

export function useDeleteFoodEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entryId,
      date,
    }: {
      entryId: bigint;
      date: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.deleteFoodEntry(entryId);
      return date;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["foodEntries", variables.date],
      });
    },
  });
}

export function useSetDailyGoals() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      calories,
      protein,
      carbs,
      fat,
    }: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.setDailyGoals(
        BigInt(Math.round(calories)),
        protein,
        carbs,
        fat,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyGoals"] });
    },
  });
}
