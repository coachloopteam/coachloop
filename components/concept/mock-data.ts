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
  // Form/alignment breakdown cards for the Media Hub concept — same
  // sourcing rule as `image`: every photo verified against its real
  // Unsplash photo page, never guessed.
  breakdown: { id: string; title: string; note: string; image: { src: string; alt: string } }[];
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
    breakdown: [
      {
        id: "fb1",
        title: "Barbell Rollout — Core Control",
        note: "Hips stay low and braced as the bar rolls forward under control, driven by the core rather than the shoulders.",
        image: {
          src: "https://images.unsplash.com/photo-1647828150413-1717ace5bac2?q=80&w=800&auto=format&fit=crop",
          alt: "Person performing a kneeling barbell rollout in a gym",
        },
      },
      {
        id: "fb2",
        title: "Hip-Hinge & Deadlift Setup",
        note: "Bar stays close to the shins, spine neutral, and the pull starts from the floor through the heels.",
        image: {
          src: "https://images.unsplash.com/photo-1751456357787-fe644b095838?q=80&w=800&auto=format&fit=crop",
          alt: "Woman performing a barbell deadlift in a gym",
        },
      },
      {
        id: "fb3",
        title: "Plank & Core Bracing",
        note: "Ribs stacked over the pelvis, glutes engaged, and a straight line from shoulders to heels.",
        image: {
          src: "https://images.unsplash.com/photo-1674600625236-ad76734fee0d?q=80&w=800&auto=format&fit=crop",
          alt: "Woman holding a plank position on a yoga mat",
        },
      },
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
    breakdown: [
      {
        id: "pb1",
        title: "Reformer Side-Plank Extension",
        note: "Hips stay lifted and stacked as the free arm reaches overhead, carriage held steady beneath a braced core.",
        image: {
          src: "https://images.unsplash.com/photo-1747239202356-764770773c9a?q=80&w=800&auto=format&fit=crop",
          alt: "Woman performing a side-plank extension on a pilates reformer",
        },
      },
      {
        id: "pb2",
        title: "Reformer Split Stretch",
        note: "The working leg extends long while the standing leg stays grounded, hips square to the reformer.",
        image: {
          src: "https://images.unsplash.com/photo-1754257320374-cd5fb647cfea?q=80&w=800&auto=format&fit=crop",
          alt: "Woman performing a split stretch on a pilates reformer",
        },
      },
      {
        id: "pb3",
        title: "Spinal Articulation",
        note: "Move through the spine segment by segment rather than hinging from one point.",
        image: {
          src: "https://images.unsplash.com/photo-1758599881262-7b79a56ac284?q=80&w=800&auto=format&fit=crop",
          alt: "Woman doing a spine-mobility stretch on a mat",
        },
      },
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
    breakdown: [
      {
        id: "yb1",
        title: "Warrior II Alignment",
        note: "Front knee stacks over the ankle, hips open to the side, and the gaze holds steady over the front hand.",
        image: {
          src: "https://images.unsplash.com/photo-1561577732-12fffa81b37e?q=80&w=800&auto=format&fit=crop",
          alt: "Woman practicing warrior pose in a forest",
        },
      },
      {
        id: "yb2",
        title: "Tree Pose Balance",
        note: "Root down through the standing foot before lifting — the pelvis stays level, not tilted toward the raised leg.",
        image: {
          src: "https://images.unsplash.com/photo-1758274525911-402f99afec14?q=80&w=800&auto=format&fit=crop",
          alt: "Women practicing tree pose outdoors in a park",
        },
      },
      {
        id: "yb3",
        title: "Seated Forward Fold",
        note: "Hinge from the hips, not the waist, keeping the spine long as the chest reaches toward the legs.",
        image: {
          src: "https://images.unsplash.com/photo-1758599880788-e49f6ee77bc7?q=80&w=800&auto=format&fit=crop",
          alt: "Woman in a seated forward fold stretch on a mat",
        },
      },
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
    image: {
      src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop",
      alt: "Vibrant vegetable salad bowl with chickpeas and greens",
    },
    macros: { protein: 16, carbs: 46, fat: 18 },
  },
];
