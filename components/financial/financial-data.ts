export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export const monthly = [
  { month: "Jan", revenue: 1820, cogs: 1148, margin: 672, downtime: 52, scrap: 21, gm: 36.9 },
  { month: "Feb", revenue: 1940, cogs: 1204, margin: 736, downtime: 61, scrap: 18, gm: 37.9 },
  { month: "Mar", revenue: 2010, cogs: 1226, margin: 784, downtime: 48, scrap: 24, gm: 39 },
  { month: "Apr", revenue: 1880, cogs: 1174, margin: 706, downtime: 74, scrap: 19, gm: 37.6 },
  { month: "May", revenue: 2050, cogs: 1261, margin: 789, downtime: 55, scrap: 22, gm: 38.5 },
  { month: "Jun", revenue: 2140, cogs: 1318, margin: 822, downtime: 68, scrap: 25, gm: 38.4 },
];

export const sites = [
  { site: "Detroit", revenue: 8940, cogs: 5540, margin: 3400, gm: 38, downtime: 185, scrap: 74, oee: 83, color: "var(--chart-1)" },
  { site: "Frankfurt", revenue: 2260, cogs: 1328, margin: 932, gm: 41.2, downtime: 34, scrap: 18, oee: 91, color: "var(--chart-2)" },
  { site: "Osaka", revenue: 1140, cogs: 762, margin: 378, gm: 33.2, downtime: 98, scrap: 31, oee: 67, color: "var(--chart-3)" },
  { site: "São Paulo", revenue: 880, cogs: 564, margin: 316, gm: 35.9, downtime: 44, scrap: 22, oee: 78, color: "var(--chart-4)" },
  { site: "Dubai", revenue: 200, cogs: 148, margin: 52, gm: 26, downtime: 16, scrap: 9, oee: 55, color: "var(--chart-5)" },
];

export const products = [
  { product: "Valve Assembly", revenue: 3820, cogs: 2180, margin: 1640, gm: 42.9, units: 2840, scrap: 2.1 },
  { product: "Control Panel", revenue: 2940, cogs: 1794, margin: 1146, gm: 39, units: 1960, scrap: 1.8 },
  { product: "Power Sleeve", revenue: 2480, cogs: 1612, margin: 868, gm: 35, units: 2100, scrap: 3.2 },
  { product: "Sensor Kit", revenue: 1660, cogs: 1095, margin: 565, gm: 34, units: 3200, scrap: 4.1 },
  { product: "CNC Components", revenue: 1520, cogs: 958, margin: 562, gm: 37, units: 1420, scrap: 2.6 },
  { product: "Press Tooling", revenue: 800, cogs: 600, margin: 200, gm: 25, units: 680, scrap: 5.8 },
];

export const lines = [
  ["Detroit Line E", "Detroit", 91, 43.5, 1490, "On Target"], ["Frankfurt L1", "Frankfurt", 91, 44.1, 1490, "On Target"],
  ["Frankfurt L2", "Frankfurt", 88, 41.7, 1410, "On Target"], ["Detroit Line A", "Detroit", 87, 41.2, 1820, "On Target"],
  ["Frankfurt L3", "Frankfurt", 85, 38.2, 1370, "On Target"], ["Detroit Line D", "Detroit", 84, 39, 1360, "Needs Attention"],
  ["Detroit Line B", "Detroit", 81, 37.8, 1540, "Needs Attention"], ["Detroit Line C", "Detroit", 79, 35.1, 1280, "Needs Attention"],
  ["São Paulo L-I", "São Paulo", 78, 34.8, 1250, "Needs Attention"], ["Detroit Line F", "Detroit", 76, 32.8, 1210, "Needs Attention"],
  ["São Paulo L-II", "São Paulo", 74, 31.2, 1190, "Needs Attention"], ["Osaka Line α", "Osaka", 67, 28.4, 1050, "Critical"],
  ["Osaka Line β", "Osaka", 61, 24.9, 960, "Critical"], ["Dubai Bay 1", "Dubai", 55, 22, 870, "Critical"],
] as const;

export const siteColor = (site: string) => sites.find((item) => item.site === site)?.color ?? "var(--chart-1)";
