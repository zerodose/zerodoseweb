"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Table from "@/components/admin/table/Table";
import exportPDF from "@/utils/export/exportPDF";
import exportExcel from "@/utils/export/exportExcel";
import { api } from "@/api/client";

export default function CampaignsPage() {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCampaigns = async () => {
    try {
      setLoading(true);

      const response = await api.get("/campaigns");

      setCampaigns(response.data.data || []);
    } catch (error) {
      console.error("Get campaigns error:", error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCampaigns();
  }, []);

  return (
    <Table
      data={campaigns}
      loading={loading}
      hiddenColumns={["_id", "__v", "createdAt", "updatedAt"]}
      dateColumns={["createdAt", "recordDate", "visitDate"]}

      columnTitles={{
        name: "Campaign",
        year: "Year",
        month: "Month",
        startDate: "Start Date",
        // endDate: "End Date",
        isActive: "Active",
      }}
      columnOptions={[
        "name",
        "year",
        "month",
        "startDate",
        // "endDate",
        "isActive",
      ]}
      filterOptions={[
        {
          key: "name",
          label: "Campaign",
          type: "select",
          column: "name",
        },
        {
          key: "year",
          label: "Year",
          type: "select",
          column: "year",
        },
        {
          key: "month",
          label: "Month",
          type: "select",
          column: "month",
        },
        {
          key: "isActive",
          label: "IsActive",
          type: "select",
          column: "isActive",
        },
        {
          key: "dateRange",
          label: "Start Date",
          type: "dateRange",
          column: "startDate",
        },
      ]}
      onRowClick={(campaign) => {
        router.push(`/dashboard/campaigns/${campaign._id}`);
      }}
      addButton
      addButtonText="Add Campaign"
      onAdd={() => router.push("/dashboard/campaigns/addCampaign")}
      onExportPDF={exportPDF}
      onExportExcel={exportExcel}
    />
  );
}
