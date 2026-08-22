"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { getCampaigns } from "@/api/campaignApi";
import {
  createZerodose,
  getZerodose,
  submitZerodoseUpdate,
} from "@/api/zerodoseApi";
import { getCurrentLocation } from "@/utils/location";
import Loader from "../ui/Loader";
import Select from "../ui/Select";

export default function ZerodoseForm({ mode = "create", zerodoseId = null }) {
  const router = useRouter();

  const isEdit = mode === "edit";

  const [formData, setFormData] = useState({
    childName: "",
    fatherName: "",
    age: "",
    gender: "",
    houseNumber: "",
    address: "",
    contactNo: "",
  });

  const [campaign, setCampaign] = useState(null);
  const [zerodose, setZerodose] = useState(null);

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setChecking(true);

        if (isEdit) {
          if (!zerodoseId) {
            toast.error("Invalid Zerodose ID.");
            router.back();
            return;
          }

          const response = await getZerodose(zerodoseId);

          const data = response?.data;

          if (!data) {
            toast.error("Zerodose not found.");
            router.back();
            return;
          }

          setZerodose(data);

          setFormData({
            childName: data.childName || "",
            fatherName: data.fatherName || "",
            age:
              data.age !== undefined && data.age !== null
                ? String(data.age)
                : "",
            gender: data.gender || "",
            houseNumber:
              data.houseNumber !== undefined && data.houseNumber !== null
                ? String(data.houseNumber)
                : "",
            address: data.address || "",
            contactNo: data.contactNo || "",
          });

          setChecking(false);
          return;
        }

        const response = await getCampaigns({
          status: "current",
          limit: 1,
        });

        const campaigns = response?.data || [];

        if (!campaigns.length) {
          toast.error("There is no active campaign.");
          router.replace("/worker");
          return;
        }

        setCampaign(campaigns[0]);
      } catch (error) {
        console.error("Zerodose form load error:", error);

        toast.error(
          error?.response?.data?.message ||
            "Unable to load Zerodose information.",
        );

        router.back();
      } finally {
        setChecking(false);
      }
    };

    loadData();
  }, [isEdit, zerodoseId, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.childName.trim()) {
      toast.error("Child name is required.");
      return false;
    }

    if (!formData.fatherName.trim()) {
      toast.error("Father name is required.");
      return false;
    }

    if (formData.age === "") {
      toast.error("Age is required.");
      return false;
    }

    const age = Number(formData.age);

    if (!Number.isInteger(age) || age < 0 || age > 59) {
      toast.error("Age must be between 0 and 59.");
      return false;
    }

    if (!formData.gender) {
      toast.error("Gender is required.");
      return false;
    }

    if (!["male", "female"].includes(formData.gender)) {
      toast.error("Gender must be male or female.");
      return false;
    }

    if (formData.houseNumber === "") {
      toast.error("House number is required.");
      return false;
    }

    const houseNumber = Number(formData.houseNumber);

    if (!Number.isInteger(houseNumber) || houseNumber < 0) {
      toast.error("House number must be a valid number.");
      return false;
    }

    if (!formData.address.trim()) {
      toast.error("Address is required.");
      return false;
    }

    const contactNo = formData.contactNo.trim();

    if (contactNo && !/^03\d{9}$/.test(contactNo)) {
      toast.error("Please enter a valid Pakistani mobile number.");
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!campaign) {
      toast.error("No active campaign found.");
      return;
    }

    const location = await getCurrentLocation();

    const payload = {
      childName: formData.childName.trim(),
      fatherName: formData.fatherName.trim(),
      age: Number(formData.age),
      gender: formData.gender,
      houseNumber: Number(formData.houseNumber),
      address: formData.address.trim(),
      contactNo: formData.contactNo.trim() || null,
      location,
    };

    await createZerodose(payload);

    toast.success("Zerodose recorded successfully.");

    router.back();
  };

  const handleUpdate = async () => {
    if (!zerodoseId) {
      toast.error("Invalid Zerodose ID.");
      return;
    }

    const storedUser = localStorage.getItem("authUser");

    let authUser = null;

    if (storedUser) {
      try {
        authUser = JSON.parse(storedUser);
      } catch (error) {
        console.error("Failed to parse authUser:", error);
      }
    }

    if (!authUser?.id) {
      toast.error("Unable to identify logged-in worker.");
      return;
    }

    const location = await getCurrentLocation();

    const payload = {
      workerId: authUser.id,
      zerodoseId,
      childName: formData.childName.trim(),
      fatherName: formData.fatherName.trim(),
      age: Number(formData.age),
      gender: formData.gender,
      houseNumber: Number(formData.houseNumber),
      address: formData.address.trim(),
      contactNo: formData.contactNo.trim() || null,
      location,
    };

    await submitZerodoseUpdate(zerodoseId, payload);

    toast.success("Update request submitted. Supervisor approval is required.");

    router.back();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isEdit) {
        await handleUpdate();
      } else {
        await handleCreate();
      }
    } catch (error) {
      console.error("Zerodose submit error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          `Failed to ${isEdit ? "update" : "add"} Zerodose.`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="w-full animate-pulse">
        <div className="mb-6 pt-4">
          <div className="relative overflow-hidden rounded-2xl bg-gray-300 p-5 shadow-sm md:p-6">
            <div className="relative z-10">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-gray-400" />
                <div className="h-4 w-32 rounded bg-gray-400" />
              </div>
              <div className="h-8 w-52 rounded-md bg-gray-400" />
              <div className="mt-2 h-4 w-72 max-w-full rounded bg-gray-400" />
            </div>
            <div className="absolute -right-5 -bottom-8 h-36 w-36 rounded-full bg-gray-400/60" />
          </div>
        </div>

        <div className="border-border bg-background rounded-2xl border shadow-sm">
          <div className="p-6 sm:p-8 md:p-9">
            <div className="mb-7 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gray-300" />
              <div className="space-y-2">
                <div className="h-5 w-40 rounded-md bg-gray-300" />
                <div className="h-4 w-56 rounded-md bg-gray-300" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item}>
                  <div className="mb-2 h-4 w-24 rounded-md bg-gray-300" />
                  <div className="h-12 w-full rounded-lg bg-gray-300" />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="mb-2 h-4 w-20 rounded-md bg-gray-300" />
              <div className="h-24 w-full rounded-lg bg-gray-300" />
            </div>
          </div>

          <div className="border-border flex flex-col-reverse gap-3 border-t p-6 sm:flex-row sm:justify-end sm:p-7">
            <div className="h-11 w-full rounded-lg bg-gray-300 sm:w-24" />
            <div className="h-11 w-full rounded-lg bg-gray-300 sm:w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {loading && (
        <Loader text={isEdit ? "Updating Zerodose..." : "Adding Zerodose..."} />
      )}

      <div className="my-6">
        <div className="bg-primary relative overflow-hidden rounded-2xl p-5 shadow-sm md:p-6">
          <div className="relative z-10">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                <User className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-white md:text-3xl">
                  {isEdit ? "Update Zerodose" : "Add Zerodose"}
                </h1>

                <p className="mt-1 text-sm leading-relaxed text-white/80">
                  {isEdit
                    ? "Update zerodose child details."
                    : "Record a new zerodose child."}
                </p>
              </div>
            </div>
          </div>

          <User className="pointer-events-none absolute -right-5 -bottom-8 h-36 w-36 text-white/10" />
        </div>
      </div>

      <div className="border-border bg-background rounded-xl border shadow-sm">
        <div className="p-6 sm:p-8 md:p-9">
          <div className="mb-7 flex items-center gap-3">
            <div className="bg-primary-light text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <User className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-text text-base font-semibold">
                Child Information
              </h2>

              <p className="text-text-secondary mt-0.5 text-sm">
                {isEdit
                  ? "Update child details below."
                  : "Enter child details below."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

                  if (Number.isInteger(number) && number >= 0 && number <= 59) {
                    handleChange(e);
                  }
                }}
                placeholder="Enter age"
                disabled={loading}
                className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full [appearance:textfield] rounded-lg border px-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                {
                  value: "male",
                  label: "Male",
                },
                {
                  value: "female",
                  label: "Female",
                },
              ]}
              placeholder="Select gender"
              disabled={loading}
              required
            />

            <div>
              <label className="text-text mb-2 block text-sm font-medium">
                House Number
              </label>

              <input
                type="number"
                name="houseNumber"
                min="0"
                max="999"
                value={formData.houseNumber}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    handleChange(e);
                    return;
                  }

                  // Maximum 3 digits
                  if (value.length > 3) {
                    return;
                  }

                  const number = Number(value);

                  if (
                    Number.isInteger(number) &&
                    number >= 0 &&
                    number <= 999
                  ) {
                    handleChange(e);
                  }
                }}
                placeholder="Enter house number"
                disabled={loading}
                className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full [appearance:textfield] rounded-lg border px-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

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

          <div className="mt-6">
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

        <div className="border-border flex flex-col-reverse gap-3 border-t p-6 sm:flex-row sm:justify-end sm:p-6">
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
            disabled={loading}
            className="bg-primary hover:bg-primary-dark flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? isEdit
                ? "Submitting..."
                : "Saving..."
              : isEdit
                ? "Request Update"
                : "Add Zerodose"}
          </button>
        </div>
      </div>
    </div>
  );
}
