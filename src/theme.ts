// One palette and spacing scale for native pages, forms and the expedition world.
export const C = {
  bg: "#0C1918",
  panel: "#142724",
  panel2: "#1D3530",
  line: "#345049",
  gold: "#EAC48B",
  goldDim: "#A98A59",
  cream: "#F4F3E9",
  muted: "#AABFB5",
  mint: "#A5D5BA",
  blue: "#9BBFCB",
  violet: "#C3B4D3",
  danger: "#F1ACA0",
  sky: "#243F43",
  shadow: "#071210",
  good: "#A5D5BA",
} as const;
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const UI = {
  panel: {
    backgroundColor: C.panel,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  input: {
    color: C.cream,
    backgroundColor: C.bg,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 52,
    padding: 14,
    fontSize: 16,
  },
  title: {
    color: C.cream,
    fontSize: 22,
    fontWeight: "700" as const,
    lineHeight: 32,
  },
  body: { color: C.cream, fontSize: 16, lineHeight: 25 },
  muted: { color: C.muted, fontSize: 14, lineHeight: 22 },
} as const;
