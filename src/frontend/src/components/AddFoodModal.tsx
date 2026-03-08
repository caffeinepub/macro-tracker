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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddFoodEntry } from "../hooks/useQueries";

interface AddFoodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
}

const MEAL_TAGS = ["Breakfast", "Lunch", "Dinner", "Snack"];

const DEFAULT_FORM = {
  name: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  mealTag: "Breakfast",
};

export function AddFoodModal({ open, onOpenChange, date }: AddFoodModalProps) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const addFood = useAddFoodEntry();

  const handleClose = () => {
    setForm(DEFAULT_FORM);
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Food name is required");
      return;
    }
    const calories = Number.parseFloat(form.calories) || 0;
    const protein = Number.parseFloat(form.protein) || 0;
    const carbs = Number.parseFloat(form.carbs) || 0;
    const fat = Number.parseFloat(form.fat) || 0;

    try {
      await addFood.mutateAsync({
        date,
        name: form.name.trim(),
        calories,
        protein,
        carbs,
        fat,
        mealTag: form.mealTag,
      });
      toast.success("Food added");
      handleClose();
    } catch {
      toast.error("Failed to add food");
    }
  };

  const setField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        data-ocid="add_food.dialog"
        className="sm:max-w-sm gap-0 p-0 overflow-hidden"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="font-display text-lg font-semibold">
            Add Food
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {/* Food Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="food-name"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Food Name
              </Label>
              <Input
                id="food-name"
                data-ocid="add_food.name_input"
                placeholder="e.g. Grilled Chicken"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                autoComplete="off"
                className="bg-secondary border-0 focus-visible:ring-1"
              />
            </div>

            {/* Calories */}
            <div className="space-y-1.5">
              <Label
                htmlFor="food-calories"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Calories (kcal)
              </Label>
              <Input
                id="food-calories"
                data-ocid="add_food.calories_input"
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                value={form.calories}
                onChange={(e) => setField("calories", e.target.value)}
                className="bg-secondary border-0 focus-visible:ring-1"
              />
            </div>

            {/* Macros row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="food-protein"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Protein
                </Label>
                <div className="relative">
                  <Input
                    id="food-protein"
                    data-ocid="add_food.protein_input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    placeholder="0"
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
                  htmlFor="food-carbs"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Carbs
                </Label>
                <div className="relative">
                  <Input
                    id="food-carbs"
                    data-ocid="add_food.carbs_input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    placeholder="0"
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
                  htmlFor="food-fat"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Fat
                </Label>
                <div className="relative">
                  <Input
                    id="food-fat"
                    data-ocid="add_food.fat_input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    placeholder="0"
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

            {/* Meal */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Meal
              </Label>
              <Select
                value={form.mealTag}
                onValueChange={(v) => setField("mealTag", v)}
              >
                <SelectTrigger
                  data-ocid="add_food.meal_select"
                  className="bg-secondary border-0 focus:ring-1"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_TAGS.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 pt-0 gap-2">
            <Button
              type="button"
              variant="ghost"
              data-ocid="add_food.cancel_button"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="add_food.submit_button"
              disabled={addFood.isPending}
              className="flex-1"
            >
              {addFood.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Food"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
