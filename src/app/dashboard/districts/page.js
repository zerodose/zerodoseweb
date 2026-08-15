"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Table from "@/components/admin/table/Table";
import exportPDF from "@/utils/export/exportPDF";
import exportExcel from "@/utils/export/exportExcel";
import { api } from "@/api/client";

export default function DistrictsPage() {
  const router = useRouter();

  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDistricts = async () => {
    try {
      setLoading(true);

      const response = await api.get("/districts");

      setDistricts(response.data.data || []);
    } catch (error) {
      console.error("Get districts error:", error);
      setDistricts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDistricts();
  }, []);

  return (
    <Table
      data={districts}
      loading={loading}
      hiddenColumns={["_id", "__v", "createdAt", "updatedAt"]}
      columnTitles={{
        name: "District",
        code: "Code",
        isActive: "Active",
      }}
      columnOptions={["name", "code", "isActive"]}
      filterOptions={[
        {
          key: "code",
          label: "Code",
          type: "select",
          column: "code",
        },
        {
          key: "name",
          label: "District",
          type: "select",
          column: "name",
        },
        {
          key: "isActive",
          label: "IsActive",
          type: "select",
          column: "isActive",
        },
      ]}
      onRowClick={(district) => {
        router.push(`/dashboard/districts/${district._id}`);
      }}
      addButton
      addButtonText="Add District"
      onAdd={() => router.push("/dashboard/districts/addDistrict")}
      onExportPDF={exportPDF}
      onExportExcel={exportExcel}
    />
  );
}
