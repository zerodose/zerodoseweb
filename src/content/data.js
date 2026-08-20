import {
  LayoutDashboard,
  Users,
  MapPin,
  Settings,
  Megaphone,
  Database,
  Ad,
  MapPinned,
  Building2,
  Syringe,
  Map,
  ClipboardCheck,
} from "lucide-react";

export const dashboardSidebar = [

  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Campaigns",
    href: "/dashboard/campaigns",
    icon: Megaphone,
  },
  {
    title: "Districts",
    href: "/dashboard/districts",
    icon: Map,
  },
  {
    title: "Towns",
    href: "/dashboard/towns",
    icon: Building2,
  },
  {
    title: "Union Councils",
    href: "/dashboard/unioncouncils",
    icon: MapPinned,
  },
  {
    title: "Zerodose",
    href: "/dashboard/zerodose",
    icon: Syringe,
  },
  {
    title: "Pending Approvals",
    href: "/dashboard/pendingapprovals",
    icon: ClipboardCheck,
  },

  // =====================================================
  // Settings
  // =====================================================

  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export const ucmoSidebar = [
  {
    title: "Dashboard",
    href: "/ucmo",
    icon: LayoutDashboard,
  },

  {
    title: "Campaigns",
    icon: Megaphone,
    children: [
      {
        title: "Current Campaign",
        href: "/ucmo/campaign",
      },
      {
        title: "Previous Campaigns",
        href: "/ucmo/campaigns/previous",
      },
    ],
  },

  {
    title: "Supervisors",
    href: "/ucmo/supervisors",
    icon: Users,
  },

  {
    title: "Zerodose",
    href: "/ucmo/zerodose",
    icon: Database,
  },
];

export const supervisorSidebar = [
  {
    title: "Dashboard",
    href: "/supervisor",
    icon: LayoutDashboard,
  },

  {
    title: "Add Worker",
    href: "/supervisor/addworker",
    icon: Users,
  },
  {
    title: "Workers",
    href: "/supervisor/workers",
    icon: Users,
  },

  {
    title: "Zerodose",
    href: "/supervisor/zerodose",
    icon: Database,
  },
];

export const currentCampaign = {
  name: "Campaign 2026 - August",
  startDate: "01 Aug 2026",
  endDate: "31 Aug 2026",
};

export const currentData = [
  {
    teamNo: "T-001",
    teamLeader: "Ahmed Khan",
    teamMember: "Bilal Ahmed",
    recordedZerodose: 12,
    recordedDate: "05 Aug 2026",
    coveredZerodose: 10,
    coveredDate: "07 Aug 2026",
    visitZerodose: 2,
  },
  {
    teamNo: "T-002",
    teamLeader: "Muhammad Ali",
    teamMember: "Usman Raza",
    recordedZerodose: 15,
    recordedDate: "06 Aug 2026",
    coveredZerodose: 13,
    coveredDate: "08 Aug 2026",
    visitZerodose: 2,
  },
  {
    teamNo: "T-003",
    teamLeader: "Hassan Raza",
    teamMember: "Saad Ahmed",
    recordedZerodose: 9,
    recordedDate: "08 Aug 2026",
    coveredZerodose: 8,
    coveredDate: "10 Aug 2026",
    visitZerodose: 1,
  },
  {
    teamNo: "T-004",
    teamLeader: "Imran Shah",
    teamMember: "Hamza Khan",
    recordedZerodose: 18,
    recordedDate: "09 Aug 2026",
    coveredZerodose: 15,
    coveredDate: "11 Aug 2026",
    visitZerodose: 3,
  },
  {
    teamNo: "T-005",
    teamLeader: "Usman Tariq",
    teamMember: "Ali Hassan",
    recordedZerodose: 11,
    recordedDate: "10 Aug 2026",
    coveredZerodose: 9,
    coveredDate: "12 Aug 2026",
    visitZerodose: 2,
  },
];

export const previousCampaigns = [
  {
    id: 1,
    year: "2026",
    month: "July",
    name: "Campaign 2026 - July",
    startDate: "01 Jul 2026",
    endDate: "31 Jul 2026",
    data: [
      {
        teamNo: "T-001",
        teamLeader: "Ahmed Khan",
        teamMember: "Bilal Ahmed",
        recordedZerodose: 20,
        recordedDate: "05 Jul 2026",
        coveredZerodose: 18,
        coveredDate: "08 Jul 2026",
        visitZerodose: 2,
      },
      {
        teamNo: "T-002",
        teamLeader: "Muhammad Ali",
        teamMember: "Usman Raza",
        recordedZerodose: 17,
        recordedDate: "07 Jul 2026",
        coveredZerodose: 15,
        coveredDate: "10 Jul 2026",
        visitZerodose: 2,
      },
      {
        teamNo: "T-003",
        teamLeader: "Hassan Raza",
        teamMember: "Saad Ahmed",
        recordedZerodose: 13,
        recordedDate: "09 Jul 2026",
        coveredZerodose: 12,
        coveredDate: "12 Jul 2026",
        visitZerodose: 1,
      },
    ],
  },
  {
    id: 2,
    year: "2026",
    month: "June",
    name: "Campaign 2026 - June",
    startDate: "01 Jun 2026",
    endDate: "30 Jun 2026",
    data: [
      {
        teamNo: "T-001",
        teamLeader: "Ahmed Khan",
        teamMember: "Bilal Ahmed",
        recordedZerodose: 16,
        recordedDate: "04 Jun 2026",
        coveredZerodose: 14,
        coveredDate: "07 Jun 2026",
        visitZerodose: 2,
      },
      {
        teamNo: "T-002",
        teamLeader: "Muhammad Ali",
        teamMember: "Usman Raza",
        recordedZerodose: 14,
        recordedDate: "06 Jun 2026",
        coveredZerodose: 12,
        coveredDate: "09 Jun 2026",
        visitZerodose: 2,
      },
    ],
  },
];

export const dashboardRoutes = {
  admin: "/dashboard",
  worker: "/worker",
  supervisor: "/supervisor",
  ucmo: "/ucmo",
  otherStaff: "/otherStaff",
  townFP: "/townfp",
  districtFP: "/districtfp",
  vaccinator: "/vaccinator",
};
