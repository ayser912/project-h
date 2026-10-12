import type { Community, Topic } from "@/lib/types";

/**
 * Health topic taxonomy. In Phase 2 this moves to the `topics` table and is
 * editable from the admin dashboard; slugs stay stable.
 */
export const topics: Topic[] = [
  {
    slug: "general-health",
    icon: "Stethoscope",
    name: { ar: "الصحة العامة", en: "General health" },
    description: {
      ar: "أسئلة ونقاشات يومية حول الصحة والعادات الصحية.",
      en: "Everyday conversations about health and healthy habits.",
    },
    related: ["preventive-medicine", "sleep-lifestyle", "public-health"],
  },
  {
    slug: "nutrition",
    icon: "Apple",
    name: { ar: "التغذية", en: "Nutrition" },
    description: {
      ar: "الطعام والعادات الغذائية والتثقيف الغذائي.",
      en: "Food, eating habits and nutrition education.",
    },
    related: ["fitness", "diabetes", "healthy-aging"],
  },
  {
    slug: "fitness",
    icon: "Dumbbell",
    name: { ar: "اللياقة البدنية", en: "Fitness" },
    description: {
      ar: "الحركة والرياضة والنشاط البدني في الحياة اليومية.",
      en: "Movement, exercise and staying active day to day.",
    },
    related: ["nutrition", "sleep-lifestyle", "cardiovascular"],
  },
  {
    slug: "mental-health",
    icon: "Brain",
    name: { ar: "الصحة النفسية", en: "Mental health" },
    description: {
      ar: "مساحة محترمة للحديث عن الرفاه النفسي والدعم.",
      en: "A respectful space to talk about wellbeing and support.",
    },
    related: ["sleep-lifestyle", "general-health"],
  },
  {
    slug: "diabetes",
    icon: "Droplet",
    name: { ar: "السكري", en: "Diabetes" },
    description: {
      ar: "توعية وتجارب ونقاشات حول السكري.",
      en: "Awareness, experiences and discussion about diabetes.",
    },
    related: ["nutrition", "cardiovascular", "medications"],
  },
  {
    slug: "cardiovascular",
    icon: "HeartPulse",
    name: { ar: "صحة القلب والأوعية", en: "Heart health" },
    description: {
      ar: "التوعية بصحة القلب والدورة الدموية.",
      en: "Awareness about the heart and circulation.",
    },
    related: ["fitness", "nutrition", "preventive-medicine"],
  },
  {
    slug: "womens-health",
    icon: "Flower2",
    name: { ar: "صحة المرأة", en: "Women's health" },
    description: {
      ar: "موضوعات صحية تخص النساء في مختلف مراحل الحياة.",
      en: "Health topics for women at every stage of life.",
    },
    related: ["childrens-health", "mental-health", "preventive-medicine"],
  },
  {
    slug: "childrens-health",
    icon: "Baby",
    name: { ar: "صحة الأطفال", en: "Children's health" },
    description: {
      ar: "للأهالي ومقدّمي الرعاية: نمو الأطفال وصحتهم.",
      en: "For parents and carers: children's growth and health.",
    },
    related: ["womens-health", "nutrition", "first-aid"],
  },
  {
    slug: "dermatology",
    icon: "Sparkles",
    name: { ar: "البشرة والجلدية", en: "Skin and dermatology" },
    description: {
      ar: "العناية بالبشرة والتوعية بالأمراض الجلدية.",
      en: "Skin care and awareness of skin conditions.",
    },
    related: ["general-health", "preventive-medicine"],
  },
  {
    slug: "cancer-awareness",
    icon: "Ribbon",
    name: { ar: "التوعية بالسرطان", en: "Cancer awareness" },
    description: {
      ar: "التوعية والكشف المبكر وقصص الدعم.",
      en: "Awareness, screening conversations and stories of support.",
    },
    related: ["preventive-medicine", "mental-health"],
  },
  {
    slug: "healthy-aging",
    icon: "Sprout",
    name: { ar: "الشيخوخة الصحية", en: "Healthy aging" },
    description: {
      ar: "الصحة والنشاط مع التقدم في العمر.",
      en: "Staying healthy and active as we get older.",
    },
    related: ["fitness", "cardiovascular", "medications"],
  },
  {
    slug: "dental-health",
    icon: "Smile",
    name: { ar: "صحة الفم والأسنان", en: "Dental health" },
    description: {
      ar: "العناية بالفم والأسنان.",
      en: "Caring for your mouth and teeth.",
    },
    related: ["childrens-health", "preventive-medicine"],
  },
  {
    slug: "medications",
    icon: "Pill",
    name: { ar: "الأدوية والصيدلة", en: "Medications and pharmacy" },
    description: {
      ar: "فهم الأدوية والتعامل مع الصيدلية. لا يُغني عن استشارة مختص.",
      en: "Understanding medicines and pharmacy visits. Not a substitute for professional advice.",
    },
    related: ["general-health", "diabetes", "healthy-aging"],
  },
  {
    slug: "preventive-medicine",
    icon: "ShieldCheck",
    name: { ar: "الطب الوقائي", en: "Preventive medicine" },
    description: {
      ar: "الوقاية والفحوصات الدورية والعادات الواقية.",
      en: "Prevention, routine check-ups and protective habits.",
    },
    related: ["public-health", "general-health", "cardiovascular"],
  },
  {
    slug: "public-health",
    icon: "Users",
    name: { ar: "الصحة العامة المجتمعية", en: "Public health" },
    description: {
      ar: "صحة المجتمع والحملات والمبادرات الصحية.",
      en: "Community health, campaigns and initiatives.",
    },
    related: ["preventive-medicine", "first-aid"],
  },
  {
    slug: "first-aid",
    icon: "BriefcaseMedical",
    name: { ar: "الإسعافات الأولية", en: "First aid" },
    description: {
      ar: "التوعية بالإسعافات الأولية. في الطوارئ اتصل بالرقم المحلي للطوارئ.",
      en: "First-aid awareness. In an emergency, call your local emergency number.",
    },
    related: ["public-health", "childrens-health"],
  },
  {
    slug: "sleep-lifestyle",
    icon: "Moon",
    name: { ar: "النوم ونمط الحياة", en: "Sleep and lifestyle" },
    description: {
      ar: "النوم والروتين اليومي والتوازن.",
      en: "Sleep, daily routines and balance.",
    },
    related: ["mental-health", "fitness", "general-health"],
  },
];

export const topicBySlug = new Map(topics.map((t) => [t.slug, t]));

/**
 * Communities are topic-based discussion hubs built on the main post system
 * (MVP scope). Membership is private by default.
 */
export const communities: Community[] = [
  {
    slug: "healthy-living-mena",
    icon: "Sprout",
    name: { ar: "حياة صحية في المنطقة", en: "Healthy Living MENA" },
    description: {
      ar: "عادات يومية وتجارب من المنطقة العربية.",
      en: "Daily habits and experiences from across the region.",
    },
    topics: ["general-health", "fitness", "sleep-lifestyle", "nutrition"],
    members: 12840,
  },
  {
    slug: "diabetes-awareness",
    icon: "Droplet",
    name: { ar: "التوعية بالسكري", en: "Diabetes Awareness" },
    description: {
      ar: "تجارب وأسئلة عامة ومحتوى توعوي حول السكري.",
      en: "Experiences, general questions and awareness about diabetes.",
    },
    topics: ["diabetes"],
    members: 5320,
  },
  {
    slug: "womens-wellness",
    icon: "Flower2",
    name: { ar: "عافية المرأة", en: "Women's Wellness" },
    description: {
      ar: "نقاشات حول صحة المرأة وعافيتها.",
      en: "Conversations about women's health and wellbeing.",
    },
    topics: ["womens-health"],
    members: 8910,
  },
  {
    slug: "parenting-child-health",
    icon: "Baby",
    name: { ar: "الأهل وصحة الطفل", en: "Parenting and Child Health" },
    description: {
      ar: "أهالٍ يتبادلون التجارب والأسئلة العامة.",
      en: "Parents swapping experiences and general questions.",
    },
    topics: ["childrens-health"],
    members: 10275,
  },
  {
    slug: "healthy-nutrition",
    icon: "Apple",
    name: { ar: "تغذية صحية", en: "Healthy Nutrition" },
    description: {
      ar: "وصفات وعادات غذائية ومحتوى من مختصي التغذية.",
      en: "Recipes, eating habits and content from nutrition professionals.",
    },
    topics: ["nutrition"],
    members: 15420,
  },
  {
    slug: "mental-wellbeing",
    icon: "Brain",
    name: { ar: "الرفاه النفسي", en: "Mental Wellbeing" },
    description: {
      ar: "مساحة داعمة ومحترمة. لست وحدك.",
      en: "A supportive, respectful space.",
    },
    topics: ["mental-health", "sleep-lifestyle"],
    members: 9680,
  },
];

export const communityBySlug = new Map(communities.map((c) => [c.slug, c]));
