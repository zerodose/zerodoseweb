"use client";
import Table from "@/components/admin/table/Table";

export default function DashboardPage() {
  const users = [
    {
      _id: "1",
      name: "Ali",
      email: "ali@gmail.com",
      designation: "Supervisor",
      district: "Karachi",
      teamNumber: 5,
      zerodose: 20,
    },
    {
      _id: "2",
      name: "Ahmed",
      email: "ahmed@gmail.com",
      designation: "Supervisor",
      district: "Lahore",
      teamNumber: 2,
      zerodose: 35,
    },
  ];

  return (
    <Table
      data={users}
      hiddenColumns={["_id", "password"]}
      columnTitles={{
        name: "Name",
        email: "Email",
        designation: "Role",
        contactNumber: "Contact",
      }}
      onRowClick={(user) => {
        router.push(`/dashboard/users/${user._id}`);
      }}
      addButton
      addButtonText="Add User"
      onAdd={() => router.push("/dashboard/users/add")}
      onExportPDF={(data) => {
        console.log("PDF", data);
      }}
      onExportExcel={(data) => {
        console.log("Excel", data);
      }}
      
    />
  );
}
