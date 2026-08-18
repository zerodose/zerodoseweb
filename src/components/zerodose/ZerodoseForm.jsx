"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { getCampaigns } from "@/api/campaignApi";
import { createZerodose } from "@/api/zerodoseApi";
import { getCurrentLocation } from "@/utils/location";

export default function ZerodoseForm() {
  const router = useRouter();

  // ============================================================
  // Form State
  // ============================================================

  const [formData, setFormData] = useState({
    childName: "",
    fatherName: "",
    age: "",
    address: "",
    contactNo: "",
  });

  // ============================================================
  // Campaign State
  // ============================================================

  const [campaign, setCampaign] = useState(null);

  const [loading, setLoading] = useState(false);
  const [checkingCampaign, setCheckingCampaign] = useState(true);

  // ============================================================
  // Check Current Campaign
  // ============================================================

  useEffect(() => {
    const checkCampaign = async () => {
      try {
        setCheckingCampaign(true);

        const response = await getCampaigns({
          status: "current",
          limit: 1,
        });

        const campaigns = response?.data || [];

        const today = new Date();

        const activeCampaign = campaigns.find((item) => {
          if (!item?.startDate || !item?.endDate) {
            return false;
          }

          const startDate = new Date(item.startDate);
          const endDate = new Date(item.endDate);

          if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
          ) {
            return false;
          }

          endDate.setHours(23, 59, 59, 999);

          return today >= startDate && today <= endDate;
        });

        if (!activeCampaign) {
          toast.error("There is no active campaign.");

          router.replace("/worker");
          return;
        }

        // Save current campaign
        setCampaign(activeCampaign);
      } catch (error) {
        console.error("Campaign check error:", error);

        toast.error(
          error?.response?.data?.message ||
            "Unable to verify the current campaign.",
        );

        router.replace("/worker");
      } finally {
        setCheckingCampaign(false);
      }
    };

    checkCampaign();
  }, [router]);

  // ============================================================
  // Handle Change
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // Submit
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ----------------------------------------------------------
    // Campaign Check
    // ----------------------------------------------------------

    if (!campaign) {
      toast.error("No active campaign found.");
      return;
    }

    // ----------------------------------------------------------
    // Child Name
    // ----------------------------------------------------------

    if (!formData.childName.trim()) {
      toast.error("Child name is required.");
      return;
    }

    // ----------------------------------------------------------
    // Father Name
    // ----------------------------------------------------------

    if (!formData.fatherName.trim()) {
      toast.error("Father name is required.");
      return;
    }

    // ----------------------------------------------------------
    // Age
    // ----------------------------------------------------------

    if (formData.age === "") {
      toast.error("Age is required.");
      return;
    }

    const age = Number(formData.age);

    if (!Number.isInteger(age) || age < 0 || age > 59) {
      toast.error("Age must be between 0 and 59.");
      return;
    }

    // ----------------------------------------------------------
    // Address
    // ----------------------------------------------------------

    if (!formData.address.trim()) {
      toast.error("Address is required.");
      return;
    }

    // ----------------------------------------------------------
    // Contact Number
    // ----------------------------------------------------------

    const contactNo = formData.contactNo.trim();

    if (contactNo && !/^03\d{9}$/.test(contactNo)) {
      toast.error("Please enter a valid Pakistani mobile number.");
      return;
    }

    try {
      setLoading(true);

      // ========================================================
      // Get Current GPS Location
      // ========================================================

      const location = await getCurrentLocation();

      // ========================================================
      // Calculate Campaign Day
      // ========================================================

      const campaignStart = new Date(campaign.startDate);

      if (Number.isNaN(campaignStart.getTime())) {
        throw new Error("Invalid campaign start date.");
      }

      campaignStart.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const day =
        Math.floor(
          (today.getTime() - campaignStart.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;

      // ========================================================
      // Validate Campaign Day
      // ========================================================

      const campaignEnd = new Date(campaign.endDate);

      if (Number.isNaN(campaignEnd.getTime())) {
        throw new Error("Invalid campaign end date.");
      }

      campaignEnd.setHours(0, 0, 0, 0);

      const campaignDays =
        Math.floor(
          (campaignEnd.getTime() - campaignStart.getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1;

      if (day < 1 || day > campaignDays) {
        toast.error("Today is outside the current campaign period.");
        return;
      }

      // ========================================================
      // Payload
      //
      // Client sends ONLY fields allowed from client.
      // Assignment data comes from backend using logged-in worker.
      // ========================================================

      const payload = {
        childName: formData.childName.trim(),
        fatherName: formData.fatherName.trim(),
        age,
        address: formData.address.trim(),
        contactNo: contactNo || null,
        day,
        location,
      };

      console.log("Creating Zerodose:", payload);

      // ========================================================
      // Create Zerodose
      // ========================================================

      await createZerodose(payload);

      toast.success("Zerodose recorded successfully.");

      // ========================================================
      // Go Back
      // ========================================================

      router.back();
    } catch (error) {
      console.error("Add zerodose error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add zerodose.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Campaign Checking
  // ============================================================

  if (checkingCampaign) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-text-secondary text-sm">
          Checking current campaign...
        </p>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="w-full">
      {/* ========================================================
          Header
      ======================================================== */}

      <div className="mt-4 mb-6 flex items-start gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="border-border bg-background text-text-secondary hover:bg-surface mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-text text-2xl font-semibold">Add Zerodose</h1>

          <p className="text-text-secondary mt-1 text-sm">
            Record a new zerodose child.
          </p>
        </div>
      </div>

      {/* ========================================================
          Form Card
      ======================================================== */}

      <div className="border-border bg-background rounded-xl border shadow-sm">
        {/* ======================================================
            Child Information
        ====================================================== */}

        <div className="p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <User size={20} />
            </div>

            <div>
              <h2 className="text-text font-semibold">Child Information</h2>

              <p className="text-text-secondary text-sm">
                Enter child details below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* ==================================================
                Child Name
            ================================================== */}

            <div>
              <label className="text-text mb-2 block text-sm font-medium">
                Child Name
              </label>

              <input
                type="text"
                name="childName"
                value={formData.childName}
                onChange={handleChange}
                placeholder="Enter child name"
                disabled={loading}
                className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full rounded-lg border px-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* ==================================================
                Father Name
            ================================================== */}

            <div>
              <label className="text-text mb-2 block text-sm font-medium">
                Father Name
              </label>

              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                placeholder="Enter father name"
                disabled={loading}
                className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full rounded-lg border px-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* ==================================================
                Age
            ================================================== */}

            <div>
              <label className="text-text mb-2 block text-sm font-medium">
                Age (In Month)
              </label>

              <input
                type="number"
                name="age"
                min="0"
                max="59"
                value={formData.age}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    handleChange(e);
                    return;
                  }

                  const number = Number(value);

                  if (number >= 0 && number <= 59) {
                    handleChange(e);
                  }
                }}
                placeholder="Enter age"
                disabled={loading}
                className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full [appearance:textfield] rounded-lg border px-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* ==================================================
                Contact
            ================================================== */}

            <div>
              <label className="text-text mb-2 block text-sm font-medium">
                Contact No
              </label>

              <div className="relative">
                <Phone
                  size={17}
                  className="text-text-secondary absolute top-1/2 left-3 -translate-y-1/2"
                />

                <input
                  type="tel"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 11);

                    setFormData((previous) => ({
                      ...previous,
                      contactNo: value,
                    }));
                  }}
                  placeholder="03XXXXXXXXX"
                  inputMode="numeric"
                  maxLength={11}
                  disabled={loading}
                  className={`border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full rounded-lg border pr-3 pl-10 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    formData.contactNo && !/^03\d{9}$/.test(formData.contactNo)
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : ""
                  }`}
                />
              </div>

              {formData.contactNo && !/^03\d{9}$/.test(formData.contactNo) && (
                <p className="mt-1.5 text-xs text-red-500">
                  Enter a valid Pakistani mobile number (03XXXXXXXXX).
                </p>
              )}
            </div>
          </div>

          {/* ====================================================
              Address
          ==================================================== */}

          <div className="mt-5">
            <label className="text-text mb-2 block text-sm font-medium">
              Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              placeholder="Enter complete address"
              disabled={loading}
              className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light w-full resize-none rounded-lg border px-3 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        {/* ======================================================
            Buttons
        ====================================================== */}

        <div className="border-border flex flex-col-reverse gap-3 border-t p-5 sm:flex-row sm:justify-end sm:p-6">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="border-border text-text hover:bg-surface h-11 rounded-lg border px-5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !campaign}
            className="bg-primary hover:bg-primary-dark flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Add Zerodose"}
          </button>
        </div>
      </div>
    </div>
  );
}
