"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin, Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { createZerodose } from "@/api/zerodoseApi";

export default function ZerodoseForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    childName: "",
    fatherName: "",
    age: "",
    address: "",
    contactNo: "",
  });

  const [loading, setLoading] = useState(false);

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
  // Get Current Location
  // ============================================================

  // ============================================================
  // Get Current Location
  // ============================================================

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Location is not supported by this browser/device."));

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);

          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(
                new Error(
                  "Location permission denied. Please allow location access.",
                ),
              );
              break;

            case error.POSITION_UNAVAILABLE:
              reject(new Error("Unable to determine your current location."));
              break;

            case error.TIMEOUT:
              reject(
                new Error("Location request timed out. Please try again."),
              );
              break;

            default:
              reject(new Error("Unable to get your current location."));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        },
      );
    });
  };

  // ============================================================
  // Submit
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.childName.trim()) {
      toast.error("Child name is required.");
      return;
    }

    if (!formData.fatherName.trim()) {
      toast.error("Father name is required.");
      return;
    }

    if (!formData.age) {
      toast.error("Age is required.");
      return;
    }

    const age = Number(formData.age);

    if (Number.isNaN(age) || age < 0 || age > 59) {
      toast.error("Age must be between 0 and 59.");
      return;
    }

    if (!formData.address.trim()) {
      toast.error("Address is required.");
      return;
    }

    if (formData.contactNo && !/^03\d{9}$/.test(formData.contactNo.trim())) {
      toast.error("Please enter a valid Pakistani mobile number.");
      return;
    }

    try {
      setLoading(true);

      // GPS
      const location = await getCurrentLocation();

      const payload = {
        childName: formData.childName.trim(),
        fatherName: formData.fatherName.trim(),
        age,
        address: formData.address.trim(),
        contactNo: formData.contactNo.trim() || null,
        location,
      };

      await createZerodose(payload);

      toast.success("Zerodose recorded successfully.");

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
            {/* Child Name */}

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

            {/* Father Name */}

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

            {/* Age */}

            <div>
              <label className="text-text mb-2 block text-sm font-medium">
                Age ( In Month )
              </label>

              <input
                type="number"
                name="age"
                min="0"
                max="10"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter age"
                disabled={loading}
                className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full [appearance:textfield] appearance-none rounded-lg border px-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            {/* Contact */}

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
                  type="number"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleChange}
                  placeholder="03XXXXXXXXX"
                  disabled={loading}
                  className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full rounded-lg border pr-3 pl-10 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Address */}

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
            Location Information
        ====================================================== */}

        {/* <div className="border-border border-t p-5 sm:p-6">
          <div className="border-primary-soft bg-surface-blue flex items-start gap-3 rounded-lg border p-4">
            <MapPin size={20} className="text-primary mt-0.5 shrink-0" />

            <div>
              <h3 className="text-text text-sm font-semibold">Location</h3>

              <p className="text-text-secondary mt-1 text-sm">
                Your current GPS location will automatically be recorded when
                you submit this form.
              </p>
            </div>
          </div>
        </div> */}

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
            disabled={loading}
            className="bg-primary hover:bg-primary-dark flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Add Zerodose"}
          </button>
        </div>
      </div>
    </div>
  );
}
