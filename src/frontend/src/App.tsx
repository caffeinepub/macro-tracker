import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  LogIn,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { FoodEntry } from "./backend.d";
import { AddFoodModal } from "./components/AddFoodModal";
import { GoalsModal } from "./components/GoalsModal";
import { MacroBar } from "./components/MacroBar";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useDailyGoals,
  useDeleteFoodEntry,
  useFoodEntries,
} from "./hooks/useQueries";

// Format date as YYYY-MM-DD
function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Format date for display: "Mon, Mar 7"
function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

const MEAL_ORDER = ["Breakfast", "Lunch", "Dinner", "Snack"];

function groupByMeal(entries: FoodEntry[]): Record<string, FoodEntry[]> {
  return entries.reduce(
    (acc, entry) => {
      const tag = entry.mealTag || "Snack";
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(entry);
      return acc;
    },
    {} as Record<string, FoodEntry[]>,
  );
}

// Login screen
function LoginScreen() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm text-center space-y-8"
      >
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-foreground/5 mb-2">
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Macro Tracker
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            Track your daily calories and macros. Clean, focused, and
            effortless.
          </p>
        </div>

        <Button
          onClick={login}
          disabled={isLoggingIn || isInitializing}
          size="lg"
          className="w-full h-11 font-medium"
        >
          {isLoggingIn || isInitializing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In to Continue
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

// Individual food entry row
function FoodEntryRow({
  entry,
  index,
  date,
}: {
  entry: FoodEntry;
  index: number;
  date: string;
}) {
  const deleteEntry = useDeleteFoodEntry();
  const ocidIndex = index + 1;

  const handleDelete = async () => {
    try {
      await deleteEntry.mutateAsync({ entryId: entry.id, date });
      toast.success("Entry removed");
    } catch {
      toast.error("Failed to remove entry");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.2 }}
      data-ocid={`food.item.${ocidIndex}`}
      className="flex items-center gap-3 py-3 group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {entry.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          <span className="text-protein">{Math.round(entry.protein)}g P</span>
          <span className="mx-1 text-border">·</span>
          <span className="text-carbs">{Math.round(entry.carbs)}g C</span>
          <span className="mx-1 text-border">·</span>
          <span className="text-fat">{Math.round(entry.fat)}g F</span>
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {Number(entry.calories)} kcal
        </span>
        <button
          type="button"
          data-ocid={`food.delete_button.${ocidIndex}`}
          onClick={handleDelete}
          disabled={deleteEntry.isPending}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 rounded text-muted-foreground hover:text-destructive disabled:opacity-50"
          aria-label={`Delete ${entry.name}`}
        >
          {deleteEntry.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </motion.div>
  );
}

// Main app
export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [addFoodOpen, setAddFoodOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);

  const dateKey = formatDateKey(currentDate);
  const { data: entries = [], isLoading: entriesLoading } =
    useFoodEntries(dateKey);
  const { data: goals } = useDailyGoals();

  const totals = useMemo(() => {
    return entries.reduce(
      (acc, e) => ({
        calories: acc.calories + Number(e.calories),
        protein: acc.protein + e.protein,
        carbs: acc.carbs + e.carbs,
        fat: acc.fat + e.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [entries]);

  const goalCalories = goals ? Number(goals.calories) : 2000;
  const goalProtein = goals?.protein ?? 150;
  const goalCarbs = goals?.carbs ?? 250;
  const goalFat = goals?.fat ?? 65;

  const caloriesRemaining = goalCalories - totals.calories;

  const grouped = useMemo(() => groupByMeal(entries), [entries]);

  const prevDay = () => {
    setCurrentDate((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() - 1);
      return nd;
    });
  };

  const nextDay = () => {
    setCurrentDate((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + 1);
      return nd;
    });
  };

  const goToToday = () => setCurrentDate(new Date());

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <LoginScreen />
        <Toaster position="bottom-center" />
      </>
    );
  }

  // Count total items for sequential deterministic markers
  let globalIdx = 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="bottom-center" />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <h1 className="font-display text-lg font-bold tracking-tight text-foreground shrink-0">
            Macro Tracker
          </h1>

          {/* Date navigation */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              data-ocid="nav.date_prev_button"
              onClick={prevDay}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              data-ocid="nav.today_button"
              onClick={goToToday}
              className="px-2 py-1 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors min-w-[110px] text-center"
            >
              {isToday(currentDate) ? "Today" : formatDateDisplay(currentDate)}
            </button>
            <button
              type="button"
              data-ocid="nav.date_next_button"
              onClick={nextDay}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            data-ocid="nav.settings_open_modal_button"
            onClick={() => setGoalsOpen(true)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 space-y-5 pb-24">
        {/* Summary card */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-card space-y-5">
          {/* Calorie total */}
          <div data-ocid="summary.calories_section" className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Calories
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold text-foreground tabular-nums">
                {totals.calories.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                / {goalCalories.toLocaleString()} kcal
              </span>
            </div>
            <p
              className={`text-xs font-medium ${caloriesRemaining < 0 ? "text-destructive" : "text-muted-foreground"}`}
            >
              {caloriesRemaining < 0
                ? `${Math.abs(caloriesRemaining).toLocaleString()} kcal over`
                : `${caloriesRemaining.toLocaleString()} kcal remaining`}
            </p>
          </div>

          {/* Macro progress bars */}
          <div className="space-y-3.5">
            <MacroBar
              label="Protein"
              current={totals.protein}
              goal={goalProtein}
              colorClass="bg-protein"
              bgClass="bg-protein-bg"
              sectionId="summary.protein_section"
            />
            <MacroBar
              label="Carbs"
              current={totals.carbs}
              goal={goalCarbs}
              colorClass="bg-carbs"
              bgClass="bg-carbs-bg"
              sectionId="summary.carbs_section"
            />
            <MacroBar
              label="Fat"
              current={totals.fat}
              goal={goalFat}
              colorClass="bg-fat"
              bgClass="bg-fat-bg"
              sectionId="summary.fat_section"
            />
          </div>
        </div>

        {/* Food log */}
        <div className="space-y-4">
          {entriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2
                className="h-5 w-5 animate-spin text-muted-foreground"
                data-ocid="food.loading_state"
              />
            </div>
          ) : entries.length === 0 ? (
            <div
              data-ocid="food.empty_state"
              className="text-center py-14 space-y-2"
            >
              <p className="text-2xl">🍽️</p>
              <p className="text-sm font-medium text-foreground">
                No food logged yet
              </p>
              <p className="text-xs text-muted-foreground">
                Tap the + button to add your first meal
              </p>
            </div>
          ) : (
            <div data-ocid="food.list" className="space-y-3">
              <AnimatePresence>
                {MEAL_ORDER.filter((meal) => grouped[meal]?.length).map(
                  (meal) => (
                    <div
                      key={meal}
                      className="bg-card rounded-xl border border-border overflow-hidden shadow-card"
                    >
                      {/* Meal header */}
                      <div className="px-4 py-2.5 border-b border-border bg-secondary/50">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {meal}
                        </span>
                      </div>
                      {/* Entries */}
                      <div className="px-4 divide-y divide-border/60">
                        <AnimatePresence>
                          {grouped[meal].map((entry) => {
                            globalIdx++;
                            return (
                              <FoodEntryRow
                                key={String(entry.id)}
                                entry={entry}
                                index={globalIdx - 1}
                                date={dateKey}
                              />
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  ),
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Floating Add button */}
      <div className="fixed bottom-6 right-1/2 translate-x-1/2 z-20 max-w-lg w-full px-4 pointer-events-none">
        <div className="flex justify-end pointer-events-auto">
          <Button
            data-ocid="food.add_button"
            onClick={() => setAddFoodOpen(true)}
            size="lg"
            className="rounded-full h-12 px-5 shadow-lg font-medium gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Food
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-4 px-4">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Modals */}
      <AddFoodModal
        open={addFoodOpen}
        onOpenChange={setAddFoodOpen}
        date={dateKey}
      />
      <GoalsModal open={goalsOpen} onOpenChange={setGoalsOpen} />
    </div>
  );
}
