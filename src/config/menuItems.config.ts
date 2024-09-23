export const menuItems: MenuItem[] = [
  {
    displayName: "Dashboard",
    hyperLink: "/home",
    subMenu: [
      {
        displayName: "Facts",
        hyperLink: "/home",
      },
      {
        displayName: "Charts",
        hyperLink: "/homeCharts",
      },
    ],
  },
  {
    displayName: "Objects",
    hyperLink: "/details",
  },

  {
    displayName: "Limits",
    hyperLink: "/limits",
  },
  {
    displayName: "Usage",
    hyperLink: "/usage",
  },
  {
    displayName: "Licenses",
    hyperLink: "/licenses",
  },
  {
    displayName: "Events",
    hyperLink: "/events",
  },
  {
    displayName: "Utilities",
    hyperLink: "/scratch",

    subMenu: [
      {
        displayName: "Domains",
        hyperLink: "/domainmapper",
        badge: "beta",
      },
      {
        displayName: "Unused Code",
        hyperLink: "/unusedCode",
        badge: "beta",
      },
      {
        displayName: "Scratch",
        hyperLink: "/scratch",
        badge: "beta",
      },
    ],
  },
];

export interface MenuItem {
  displayName: string;
  hyperLink: string;
  badge?: string;
  subMenu?: {
    displayName: string;
    hyperLink: string;
    badge?: string;
  }[];
}
