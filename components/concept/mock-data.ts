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
  // Real, verified Unsplash photos (via WebSearch + WebFetch of the actual
  // photo page — never guessed) under the free Unsplash License.
  image: { src: string; alt: string };
  workouts: { id: string; title: string; detail: string; duration: string }[];
};

export const DISCIPLINES: Discipline[] = [
  {
    id: "fitness",
    name: "Fitness",
    tagline: "Strength, conditioning, and progressive overload.",
    gradient: "linear-gradient(135deg, #1c1c1e, #46464a)",
    image: {
      src: "https://images.unsplash.com/photo-1590487988256-9ed24133863e?q=80&w=800&auto=format&fit=crop",
      alt: "Grayscale gym equipment in moody light",
    },
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
    image: {
      src: "https://images.unsplash.com/photo-1754257319747-df51c384c0fa?q=80&w=800&auto=format&fit=crop",
      alt: "Pilates reformer workout in a bright studio",
    },
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
    image: {
      src: "https://images.unsplash.com/photo-1687783615494-b4a1f1af8b58?q=80&w=800&auto=format&fit=crop",
      alt: "Bright minimalist yoga studio with mats",
    },
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
  // Real, verified Unsplash photos (via WebSearch + WebFetch of the actual
  // photo page — never guessed) under the free Unsplash License. Only
  // sourced for the 5 recipes actually shown (RECIPES.slice(0, 5)).
  image?: { src: string; alt: string };
  // Illustrative macro estimates for the "quick macro summary" on the
  // client-dashboard concept's recipe cards — not a real nutrition database.
  macros?: { protein: number; carbs: number; fat: number };
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
    image: {
      src: "https://images.unsplash.com/photo-1702648982253-8b851013e81f?q=80&w=1000&auto=format&fit=crop",
      alt: "Oatmeal bowl topped with fruit and nuts",
    },
    macros: { protein: 24, carbs: 88, fat: 28 },
  },
  {
    id: "r2",
    name: "Grilled Salmon & Quinoa",
    description: "Salmon fillet, quinoa, roasted broccoli, lemon-olive oil dressing.",
    category: "nutrient-rich",
    calories: 540,
    glutenFree: true,
    lactoseFree: true,
    image: {
      src: "https://images.unsplash.com/photo-1695882257148-b35580f4c4b6?q=80&w=1000&auto=format&fit=crop",
      alt: "Salmon and mushrooms cooking on a grill",
    },
    macros: { protein: 42, carbs: 38, fat: 20 },
  },
  {
    id: "r3",
    name: "Beef & Sweet Potato Skillet",
    description: "Lean ground beef, sweet potato, spinach, avocado.",
    category: "high-calorie",
    calories: 680,
    glutenFree: true,
    lactoseFree: true,
    image: {
      src: "https://images.unsplash.com/photo-1567932783552-e305bbf70b63?q=80&w=1000&auto=format&fit=crop",
      alt: "Grilled meat platter on a dark surface",
    },
    macros: { protein: 38, carbs: 52, fat: 30 },
  },
  {
    id: "r4",
    name: "Greek Yogurt Berry Parfait",
    description: "Greek yogurt, mixed berries, walnuts, chia seeds.",
    category: "nutrient-rich",
    calories: 380,
    glutenFree: true,
    lactoseFree: false,
    image: {
      src: "https://images.unsplash.com/photo-1636044992466-ba190da5d40b?q=80&w=1000&auto=format&fit=crop",
      alt: "Layered yogurt parfait with fresh fruit",
    },
    macros: { protein: 22, carbs: 44, fat: 12 },
  },
  {
    id: "r5",
    name: "Chicken & Rice Power Bowl",
    description: "Grilled chicken thigh, jasmine rice, black beans, mango salsa.",
    category: "high-calorie",
    calories: 750,
    glutenFree: true,
    lactoseFree: true,
    image: {
      src: "https://images.unsplash.com/photo-1781334266250-a7e72fdf539f?q=80&w=1000&auto=format&fit=crop",
      alt: "Plates of roasted chicken, rice, and salad",
    },
    macros: { protein: 48, carbs: 82, fat: 18 },
  },
  {
    id: "r6",
    name: "Rainbow Veggie Salad",
    description: "Mixed greens, chickpeas, roasted peppers, tahini dressing.",
    category: "nutrient-rich",
    calories: 410,
    glutenFree: true,
    lactoseFree: true,
    macros: { protein: 16, carbs: 46, fat: 18 },
  },
];
