"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import CampaignHeader from "./CampaignHeader";
import ZerodoseTable from "./ZerodoseTable";

export default function PreviousCampaigns({ campaigns = [] }) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedcampaign, setSelectedcampaign] = useState("");

  const years = useMemo(() => {
    return [...new Set(campaigns.map((item) => item.campaign?.year))]
      .filter(Boolean)
      .sort((a, b) => b - a);
  }, [campaigns]);

  const months = useMemo(() => {
    return [
      ...new Set(
        campaigns
          .filter((item) => item.campaign?.year?.toString() === selectedYear)
          .map((item) => item.campaign?.month),
      ),
    ].sort((a, b) => b - a);
  }, [campaigns, selectedYear]);

  const campaignOptions = useMemo(() => {
    return campaigns.filter(
      (item) =>
        item.campaign?.year?.toString() === selectedYear &&
        item.campaign?.month?.toString() === selectedMonth,
    );
  }, [campaigns, selectedYear, selectedMonth]);

  const selectedCampaign = useMemo(() => {
    return campaigns.find(
      (item) => item.campaign?._id?.toString() === selectedcampaign,
    )?.campaign;
  }, [campaigns, selectedcampaign]);

  const selectedData = useMemo(() => {
    if (!selectedcampaign) return [];

    return campaigns.filter(
      (item) => item.campaign?._id?.toString() === selectedcampaign,
    );
  }, [campaigns, selectedcampaign]);

  const handleYearChange = (value) => {
    setSelectedYear(value);

    const firstMonth = campaigns.find(
      (item) => item.campaign?.year?.toString() === value,
    )?.campaign?.month;

    setSelectedMonth(firstMonth?.toString() || "");

    const firstCampaign = campaigns.find(
      (item) => item.campaign?.year?.toString() === value,
    )?.campaign?._id;

    setSelectedcampaign(firstCampaign?.toString() || "");
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);

    const firstCampaign = campaigns.find(
      (item) =>
        item.campaign?.year?.toString() === selectedYear &&
        item.campaign?.month?.toString() === value,
    )?.campaign?._id;

    setSelectedcampaign(firstCampaign?.toString() || "");
  };

  return (
    <section>
      <div className="mb-5">
        <h3 className="text-text text-base font-semibold md:text-lg">
          Previous Campaigns
        </h3>

        <p className="text-text-secondary mt-1 text-xs md:text-sm">
          Select year, month and campaign to view previous Zerodose records.
        </p>
      </div>

      <div className="bg-surface border-border mb-5 rounded-xl border p-4 md:rounded-2xl md:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Year */}
          <div>
            <label className="text-text mb-1.5 block text-xs font-medium">
              Year
            </label>

            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="bg-background border-border text-text w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none"
              >
                <option value="">Select Year</option>

                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
              />
            </div>
          </div>

          {/* Month */}
          <div>
            <label className="text-text mb-1.5 block text-xs font-medium">
              Month
            </label>

            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                disabled={!selectedYear}
                className="bg-background border-border text-text w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none disabled:opacity-50"
              >
                <option value="">Select Month</option>

                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
              />
            </div>
          </div>

          {/* Campaign */}
          <div>
            <label className="text-text mb-1.5 block text-xs font-medium">
              Campaign
            </label>

            <div className="relative">
              <select
                value={selectedcampaign}
                onChange={(e) => setSelectedcampaign(e.target.value)}
                disabled={!selectedMonth}
                className="bg-background border-border text-text w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none disabled:opacity-50"
              >
                <option value="">Select Campaign</option>

                {campaignOptions.map((item) => (
                  <option key={item.campaign._id} value={item.campaign._id}>
                    {item.campaign.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
              />
            </div>
          </div>
        </div>
      </div>

      {selectedCampaign && (
        <>
          <CampaignHeader
            campaign={selectedCampaign}
            label="PREVIOUS CAMPAIGN"
            recorded={selectedData.length}
            covered={
              selectedData.filter(
                (item) => item.vaccinationStatus === "covered",
              ).length
            }
          />

          <ZerodoseTable data={selectedData} />
        </>
      )}
    </section>
  );
}
