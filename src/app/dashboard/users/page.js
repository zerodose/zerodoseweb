"use client";

import { useRouter } from "next/navigation";
import Table from "@/components/admin/table/Table";
import exportPDF from "@/utils/export/exportPDF";
import exportExcel from "@/utils/export/exportExcel";

export default function DashboardPage() {
  const router = useRouter();

  const users = [
    {
      _id: "1",
      name: "Ali",
      email: "ali@gmail.com",
      designation: "Supervisor",
      district: "Karachi",
      town: "Gulshan",
      teamNumber: 5,
      zerodose: 20,
      createdAt: "2026-08-10",
    },
    {
      _id: "2",
      name: "Ahmed",
      email: "ahmed@gmail.com",
      designation: "UCMO",
      district: "Lahore",
      town: "Model Town",
      teamNumber: 2,
      zerodose: 35,
      createdAt: "2026-08-12",
    },
  ];

  return (
    <Table
      data={users}
      hiddenColumns={["_id"]}
      columnTitles={{
        name: "Name",
        email: "Email",
        designation: "Role",
        district: "District",
        town: "Town",
        teamNumber: "Team",
        zerodose: "Zerodose",
        createdAt: "Created Date",
      }}
      filterOptions={[
        {
          key: "dateRange",
          label: "Date",
          type: "dateRange",
          column: "createdAt",
        },
        {
          key: "designation",
          label: "Role",
          type: "select",
          column: "designation",
        },
        {
          key: "district",
          label: "District",
          type: "select",
          column: "district",
        },
        {
          key: "town",
          label: "Town",
          type: "select",
          column: "town",
        },
      ]}
      onRowClick={(user) => {
        router.push(`/dashboard/users/${user._id}`);
      }}
      addButton
      addButtonText="Add User"
      onAdd={() => router.push("/dashboard/users/addUser")}
      // onExportPDF={(data) => {
      //   console.log("PDF Data:", data);
      // }}
      // onExportExcel={(data) => {
      //   console.log("Excel Data:", data);
      // }}
      onExportPDF={exportPDF}
      onExportExcel={exportExcel}
    />
  );
}
