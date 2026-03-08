import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDailyGoals, useSetDailyGoals } from "../hooks/useQueries";

interface GoalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalsModal({ open, onOpenChange }: GoalsModalProps) {
  const { data: goals } = useDailyGoals();
  const setGoals = useSetDailyGoals();

  const [form, setForm] = useState({
    calories: "2000",
    protein: "150",
    carbs: "250",
    fat: "65",
  });

  // Pre-fill form when goals load
  useEffect(() => {
    if (goals) {
      setForm({
        calories: String(Number(goals.calories)),
        protein: String(goals.protein),
        carbs: String(goals.carbs),
        fat: String(goals.fat),
      });
    }
  }, [goals]);

  const handleClose = () => onOpenChange(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const calories = Number.parseFloat(form.calories) || 2000;
    const protein = Number.parseFloat(form.protein) || 150;
    const carbs = Number.parseFloat(form.carbs) || 250;
    const fat = Number.parseFloat(form.fat) || 65;

    try {
      await setGoals.mutateAsync({ calories, protein, carbs, fat });
      toast.success("Goals saved");
      handleClose();
    } catch {
      toast.error("Failed to save goals");
    }
  };

  const setField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        data-ocid="goals.dialog"
        className="sm:max-w-sm gap-0 p-0 overflow-hidden"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="font-display text-lg font-semibold">
            Daily Goals
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="goal-calories"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Calories (kcal)
              </Label>
              <Input
                id="goal-calories"
                data-ocid="goals.calories_input"
                type="number"
                inputMode="numeric"
                min="0"
                value={form.calories}
                onChange={(e) => setField("calories", e.target.value)}
                className="bg-secondary border-0 focus-visible:ring-1"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="goal-protein"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Protein
                </Label>
                <div className="relative">
                  <Input
                    id="goal-protein"
                    data-ocid="goals.protein_input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={form.protein}
                    onChange={(e) => setField("protein", e.target.value)}
                    className="bg-secondary border-0 focus-visible:ring-1 pr-6"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                    g
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="goal-carbs"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Carbs
                </Label>
                <div className="relative">
                  <Input
                    id="goal-carbs"
                    data-ocid="goals.carbs_input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={form.carbs}
                    onChange={(e) => setField("carbs", e.target.value)}
                    className="bg-secondary border-0 focus-visible:ring-1 pr-6"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                    g
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="goal-fat"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Fat
                </Label>
                <div className="relative">
                  <Input
                    id="goal-fat"
                    data-ocid="goals.fat_input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={form.fat}
                    onChange={(e) => setField("fat", e.target.value)}
                    className="bg-secondary border-0 focus-visible:ring-1 pr-6"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                    g
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 pt-0 gap-2">
            <Button
              type="button"
              variant="ghost"
              data-ocid="goals.cancel_button"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="goals.save_button"
              disabled={setGoals.isPending}
              className="flex-1"
            >
              {setGoals.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Goals"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
