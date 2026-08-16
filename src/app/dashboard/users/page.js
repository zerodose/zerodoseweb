"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Table from "@/components/admin/table/Table";
import exportPDF from "@/utils/export/exportPDF";
import exportExcel from "@/utils/export/exportExcel";
import { api } from "@/api/client";

export default function DashboardPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users");

      const formattedUsers = (response.data.data || []).map((user) => ({
        ...user,

        district: user.district?.name || "-",
        town: user.town?.name || "-",
        unionCouncil: user.unionCouncil?.name || "-",
        supervisor: user.supervisor?.name || "-",
        ucmo: user.ucmo?.name || "-",
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Get users error:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <Table
      data={users}
      loading={loading}
      hiddenColumns={["_id", "__v", "password", "createdAt", "updatedAt"]}
      pageTitle="Users"
pageDescription="View and manage system users."
      pageBreadcrumbs={[
        {
          label: "Users",
        },
      ]}
      columnTitles={{
        name: "Name",
        email: "Email",
        designation: "Role",
        district: "District",
        town: "Town",
        unionCouncil: "Union Council",
        supervisor: "Supervisor",
        ucmo: "UCMO",
        teamNumber: "Team",
        zerodose: "Zerodose",
        isActive: "Active",
        createdAt: "Created Date",
      }}

      columnOptions={[
        "name",
        "email",
        "designation",
        "district",
        "town",
        "unionCouncil",
        "supervisor",
        "ucmo",
        "teamNumber",
        "zerodose",
        "isActive",
      ]}

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
        {
          key: "isActive",
          label: "IsActive",
          type: "select",
          column: "isActive",
        },
      ]}

      onRowClick={(user) => {
        router.push(`/dashboard/users/${user._id}`);
      }}

      addButton
      addButtonText="Add User"
      onAdd={() => router.push("/dashboard/users/addUser")}

      onExportPDF={exportPDF}
      onExportExcel={exportExcel}
    />
  );
}
