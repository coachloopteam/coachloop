// Illustrative data only — this concept previews a proposed Workout Hub and
// Recipe Vault. Nothing here is wired to Supabase: there is no `discipline`
// column on logs, no workout-assignment table, and no recipes table in the
// current schema (supabase/schema.sql). "Assign" and "Save" actions in this
// preview show a confirmation but write nothing.

export type Discipline = {
  id: "fitness" | "pilates" | "yoga";
  name: string;
  tagline: string;
  gradient: string;
  workouts: { id: string; title: string; detail: string; duration: string }[];
};

export const DISCIPLINES: Discipline[] = [
  {
    id: "fitness",
    name: "Fitness",
    tagline: "Strength, conditioning, and progressive overload.",
    gradient: "linear-gradient(135deg, #1c1c1e, #46464a)",
    workouts: [
      { id: "f1", title: "Full-Body Strength", detail: "Squat, bench, row — 4x6 compound sets", duration: "50 min" },
      { id: "f2", title: "Conditioning Circuit", detail: "Kettlebell swings, sled push, rowing intervals", duration: "30 min" },
      { id: "f3", title: "Upper Body Push/Pull", detail: "Overhead press, pull-ups, accessory work", duration: "45 min" },
    ],
  },
  {
    id: "pilates",
    name: "Pilates",
    tagline: "Core control, posture, and precise movement.",
    gradient: "linear-gradient(135deg, var(--accent), #ff8a65)",
    workouts: [
      { id: "p1", title: "Reformer Fundamentals", detail: "Footwork, hundred, leg circles", duration: "40 min" },
      { id: "p2", title: "Mat Core Series", detail: "Roll-ups, teasers, side-plank series", duration: "35 min" },
      { id: "p3", title: "Posture & Alignment", detail: "Spinal articulation and shoulder stability", duration: "30 min" },
    ],
  },
  {
    id: "yoga",
    name: "Yoga",
    tagline: "Mobility, breathwork, and recovery.",
    gradient: "linear-gradient(135deg, #5b6a55, #8ea27f)",
    workouts: [
      { id: "y1", title: "Morning Vinyasa Flow", detail: "Sun salutations into standing sequence", duration: "35 min" },
      { id: "y2", title: "Deep Hip Mobility", detail: "Hip openers held for 90 seconds each", duration: "40 min" },
      { id: "y3", title: "Restorative Wind-Down", detail: "Supported poses, breathwork, long holds", duration: "25 min" },
    ],
  },
];

export type Recipe = {
  id: string;
  name: string;
  description: string;
  category: "high-calorie" | "nutrient-rich";
  calories: number;
  glutenFree: boolean;
  lactoseFree: boolean;
};

export const RECIPES: Recipe[] = [
  {
    id: "r1",
    name: "Peanut Butter Oat Bowl",
    description: "Rolled oats, banana, peanut butter, whole milk, honey.",
    category: "high-calorie",
    calories: 720,
    glutenFree: true,
    lactoseFree: false,
  },
  {
    id: "r2",
    name: "Grilled Salmon & Quinoa",
    description: "Salmon fillet, quinoa, roasted broccoli, lemon-olive oil dressing.",
    category: "nutrient-rich",
    calories: 540,
    glutenFree: true,
    lactoseFree: true,
  },
  {
    id: "r3",
    name: "Beef & Sweet Potato Skillet",
    description: "Lean ground beef, sweet potato, spinach, avocado.",
    category: "high-calorie",
    calories: 680,
    glutenFree: true,
    lactoseFree: true,
  },
  {
    id: "r4",
    name: "Greek Yogurt Berry Parfait",
    description: "Greek yogurt, mixed berries, walnuts, chia seeds.",
    category: "nutrient-rich",
    calories: 380,
    glutenFree: true,
    lactoseFree: false,
  },
  {
    id: "r5",
    name: "Chicken & Rice Power Bowl",
    description: "Grilled chicken thigh, jasmine rice, black beans, mango salsa.",
    category: "high-calorie",
    calories: 750,
    glutenFree: true,
    lactoseFree: true,
  },
  {
    id: "r6",
    name: "Rainbow Veggie Salad",
    description: "Mixed greens, chickpeas, roasted peppers, tahini dressing.",
    category: "nutrient-rich",
    calories: 410,
    glutenFree: true,
    lactoseFree: true,
  },
];
