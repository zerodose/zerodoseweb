"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { getCampaigns } from "@/api/campaignApi";
import { createZerodose, getZerodose, updateZerodose } from "@/api/zerodoseApi";
import { getCurrentLocation } from "@/utils/location";

export default function ZerodoseForm({
  mode = "create",
  zerodoseId = null,
}) {
  const router = useRouter();

  const isEdit = mode === "edit";

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
  // State
  // ============================================================

  const [campaign, setCampaign] = useState(null);
  const [zerodose, setZerodose] = useState(null);

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // ============================================================
  // Load
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setChecking(true);

        // ------------------------------------------------------
        // Update Mode
        // ------------------------------------------------------

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
            address: data.address || "",
            contactNo: data.contactNo || "",
          });

          setChecking(false);
          return;
        }

        // ------------------------------------------------------
        // Create Mode
        // ------------------------------------------------------

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

        setCampaign(activeCampaign);
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
  // Validation
  // ============================================================

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

  // ============================================================
  // Create
  // ============================================================

  const handleCreate = async () => {
    if (!campaign) {
      toast.error("No active campaign found.");
      return;
    }

    // ----------------------------------------------------------
    // Get Current GPS
    // ----------------------------------------------------------

    const location = await getCurrentLocation();

    // ----------------------------------------------------------
    // Campaign Day
    // ----------------------------------------------------------

    const campaignStart = new Date(campaign.startDate);

    if (Number.isNaN(campaignStart.getTime())) {
      throw new Error("Invalid campaign start date.");
    }

    campaignStart.setHours(0, 0, 0, 0);

    const campaignEnd = new Date(campaign.endDate);

    if (Number.isNaN(campaignEnd.getTime())) {
      throw new Error("Invalid campaign end date.");
    }

    campaignEnd.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const day =
      Math.floor(
        (today.getTime() - campaignStart.getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;

    const campaignDays =
      Math.floor(
        (campaignEnd.getTime() - campaignStart.getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;

    if (day < 1 || day > campaignDays) {
      toast.error("Today is outside the current campaign period.");
      return;
    }

    // ----------------------------------------------------------
    // Payload
    // ----------------------------------------------------------

    const payload = {
      childName: formData.childName.trim(),
      fatherName: formData.fatherName.trim(),
      age: Number(formData.age),
      address: formData.address.trim(),
      contactNo: formData.contactNo.trim() || null,
      location,
    };

    await createZerodose(payload);

    toast.success("Zerodose recorded successfully.");

    router.back();
  };

  // ============================================================
  // Update
  // ============================================================

  const handleUpdate = async () => {
    if (!zerodoseId) {
      toast.error("Invalid Zerodose ID.");
      return;
    }

    // ----------------------------------------------------------
    // Get NEW GPS location
    // ----------------------------------------------------------

    const location = await getCurrentLocation();

    // ----------------------------------------------------------
    // Update Payload
    // ----------------------------------------------------------

    const payload = {
      childName: formData.childName.trim(),
      fatherName: formData.fatherName.trim(),
      age: Number(formData.age),
      address: formData.address.trim(),
      contactNo: formData.contactNo.trim() || null,

      // IMPORTANT:
      // Worker update always sends the NEW current location.
      location,
    };

    await updateZerodose(zerodoseId, payload);

    toast.success(
      "Update request submitted. Supervisor approval is required.",
    );

    router.back();
  };

  // ============================================================
  // Submit
  // ============================================================

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

  // ============================================================
  // Loading Skeleton
  // ============================================================

  if (checking) {
    return (
      <div className="w-full animate-pulse">
        <div className="mt-4 mb-6 flex items-start gap-3">
          <div className="bg-surface mt-1 h-9 w-9 shrink-0 rounded-lg" />

          <div className="flex-1">
            <div className="bg-surface h-7 w-44 rounded-md" />
            <div className="bg-surface mt-2 h-4 w-64 rounded-md" />
          </div>
        </div>

        <div className="border-border bg-background rounded-xl border shadow-sm">
          <div className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="bg-surface h-10 w-10 rounded-lg" />

              <div>
                <div className="bg-surface h-5 w-36 rounded-md" />
                <div className="bg-surface mt-2 h-4 w-52 rounded-md" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item}>
                  <div className="bg-surface mb-2 h-4 w-24 rounded-md" />
                  <div className="bg-surface h-11 w-full rounded-lg" />
                </div>
              ))}
            </div>

            <div className="mt-5">
              <div className="bg-surface mb-2 h-4 w-20 rounded-md" />
              <div className="bg-surface h-[76px] w-full rounded-lg" />
            </div>
          </div>

          <div className="border-border flex justify-end gap-3 border-t p-5 sm:p-6">
            <div className="bg-surface h-11 w-24 rounded-lg" />
            <div className="bg-surface h-11 w-32 rounded-lg" />
          </div>
        </div>
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

      <div className="mt-4 mb-6 p-4 flex items-start gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="border-border bg-background text-text-secondary hover:bg-surface mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-text text-2xl font-semibold">
            {isEdit ? "Update Zerodose" : "Add Zerodose"}
          </h1>

          <p className="text-text-secondary mt-1 text-sm">
            {isEdit
              ? "Update zerodose child details."
              : "Record a new zerodose child."}
          </p>
        </div>
      </div>

      {/* ========================================================
          Form
      ======================================================== */}

      <div className="border-border bg-background rounded-xl border shadow-sm">
        <div className="p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <User size={20} />
            </div>

            <div>
              <h2 className="text-text font-semibold">
                Child Information
              </h2>

              <p className="text-text-secondary text-sm">
                {isEdit
                  ? "Update child details below."
                  : "Enter child details below."}
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
                    formData.contactNo &&
                    !/^03\d{9}$/.test(formData.contactNo)
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : ""
                  }`}
                />
              </div>

              {formData.contactNo &&
                !/^03\d{9}$/.test(formData.contactNo) && (
                  <p className="mt-1.5 text-xs text-red-500">
                    Enter a valid Pakistani mobile number (03XXXXXXXXX).
                  </p>
                )}
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

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { User, Phone, ArrowLeft } from "lucide-react";
// import { toast } from "sonner";

// import { getCampaigns } from "@/api/campaignApi";
// import { createZerodose, getZerodose, updateZerodose } from "@/api/zerodoseApi";
// import { getCurrentLocation } from "@/utils/location";

// export default function ZerodoseForm({ mode = "create", zerodoseId = null }) {
//   const router = useRouter();

//   const isUpdate = mode === "update";

//   // ============================================================
//   // Form State
//   // ============================================================

//   const [formData, setFormData] = useState({
//     childName: "",
//     fatherName: "",
//     age: "",
//     address: "",
//     contactNo: "",
//   });

//   // ============================================================
//   // Campaign State
//   // ============================================================

//   const [campaign, setCampaign] = useState(null);

//   const [loading, setLoading] = useState(false);
//   const [loadingData, setLoadingData] = useState(true);

//   // ============================================================
//   // Load Campaign
//   // ============================================================

//   useEffect(() => {
//     const loadCampaign = async () => {
//       try {
//         const response = await getCampaigns({
//           status: "current",
//           limit: 1,
//         });

//         const campaigns = response?.data || [];

//         const today = new Date();

//         const activeCampaign = campaigns.find((item) => {
//           if (!item?.startDate || !item?.endDate) {
//             return false;
//           }

//           const startDate = new Date(item.startDate);
//           const endDate = new Date(item.endDate);

//           if (
//             Number.isNaN(startDate.getTime()) ||
//             Number.isNaN(endDate.getTime())
//           ) {
//             return false;
//           }

//           endDate.setHours(23, 59, 59, 999);

//           return today >= startDate && today <= endDate;
//         });

//         if (!activeCampaign) {
//           toast.error("There is no active campaign.");

//           router.replace("/worker");
//           return;
//         }

//         setCampaign(activeCampaign);
//       } catch (error) {
//         console.error("Campaign check error:", error);

//         toast.error(
//           error?.response?.data?.message ||
//             "Unable to verify the current campaign.",
//         );

//         router.replace("/worker");
//       }
//     };

//     loadCampaign();
//   }, [router]);

//   // ============================================================
//   // Load Existing Zerodose For Update
//   // ============================================================

//   useEffect(() => {
//     if (!isUpdate || !zerodoseId) {
//       setLoadingData(false);
//       return;
//     }

//     const loadZerodose = async () => {
//       try {
//         setLoadingData(true);

//         const response = await getZerodose(zerodoseId);

//         const item = response?.data || response;

//         if (!item) {
//           toast.error("Zerodose record not found.");
//           router.replace("/worker");
//           return;
//         }

//         setFormData({
//           childName: item.childName || "",
//           fatherName: item.fatherName || "",
//           age:
//             item.age !== undefined && item.age !== null ? String(item.age) : "",
//           address: item.address || "",
//           contactNo: item.contactNo || "",
//         });
//       } catch (error) {
//         console.error("Get zerodose error:", error);

//         toast.error(
//           error?.response?.data?.message ||
//             error?.message ||
//             "Failed to load zerodose.",
//         );

//         router.back();
//       } finally {
//         setLoadingData(false);
//       }
//     };

//     loadZerodose();
//   }, [isUpdate, zerodoseId, router]);

//   // ============================================================
//   // Handle Change
//   // ============================================================

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((previous) => ({
//       ...previous,
//       [name]: value,
//     }));
//   };

//   // ============================================================
//   // Calculate Campaign Day
//   // ============================================================

//   const getCampaignDay = () => {
//     if (!campaign?.startDate || !campaign?.endDate) {
//       throw new Error("Invalid campaign dates.");
//     }

//     const campaignStart = new Date(campaign.startDate);
//     const campaignEnd = new Date(campaign.endDate);

//     if (
//       Number.isNaN(campaignStart.getTime()) ||
//       Number.isNaN(campaignEnd.getTime())
//     ) {
//       throw new Error("Invalid campaign dates.");
//     }

//     campaignStart.setHours(0, 0, 0, 0);
//     campaignEnd.setHours(0, 0, 0, 0);

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const day =
//       Math.floor(
//         (today.getTime() - campaignStart.getTime()) / (1000 * 60 * 60 * 24),
//       ) + 1;

//     const campaignDays =
//       Math.floor(
//         (campaignEnd.getTime() - campaignStart.getTime()) /
//           (1000 * 60 * 60 * 24),
//       ) + 1;

//     if (day < 1 || day > campaignDays) {
//       throw new Error("Today is outside the current campaign period.");
//     }

//     return day;
//   };

//   // ============================================================
//   // Validation
//   // ============================================================

//   const validateForm = () => {
//     if (!formData.childName.trim()) {
//       toast.error("Child name is required.");
//       return false;
//     }

//     if (!formData.fatherName.trim()) {
//       toast.error("Father name is required.");
//       return false;
//     }

//     if (formData.age === "") {
//       toast.error("Age is required.");
//       return false;
//     }

//     const age = Number(formData.age);

//     if (!Number.isInteger(age) || age < 0 || age > 59) {
//       toast.error("Age must be between 0 and 59.");
//       return false;
//     }

//     if (!formData.address.trim()) {
//       toast.error("Address is required.");
//       return false;
//     }

//     const contactNo = formData.contactNo.trim();

//     if (contactNo && !/^03\d{9}$/.test(contactNo)) {
//       toast.error("Please enter a valid Pakistani mobile number.");
//       return false;
//     }

//     return true;
//   };

//   // ============================================================
//   // Submit
//   // ============================================================

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (loading) {
//       return;
//     }

//     if (!campaign) {
//       toast.error("No active campaign found.");
//       return;
//     }

//     if (!validateForm()) {
//       return;
//     }

//     try {
//       setLoading(true);

//       // ========================================================
//       // Always get NEW GPS location
//       // ========================================================

//       const location = await getCurrentLocation();

//       const age = Number(formData.age);

//       // ========================================================
//       // CREATE
//       // ========================================================

//       if (!isUpdate) {
//         const day = getCampaignDay();

//         const payload = {
//           childName: formData.childName.trim(),
//           fatherName: formData.fatherName.trim(),
//           age,
//           address: formData.address.trim(),
//           contactNo: formData.contactNo.trim() || null,
//           location,
//         };

//         await createZerodose(payload);

//         toast.success("Zerodose recorded successfully.");

//         router.back();
//         return;
//       }

//       // ========================================================
//       // UPDATE
//       // ========================================================

//       if (!zerodoseId) {
//         throw new Error("Zerodose ID is missing.");
//       }

//       const payload = {
//         childName: formData.childName.trim(),
//         fatherName: formData.fatherName.trim(),
//         age,
//         address: formData.address.trim(),
//         contactNo: formData.contactNo.trim() || null,

//         // IMPORTANT:
//         // Update always sends the NEW current GPS location.
//         location,
//       };

//       await updateZerodose(zerodoseId, payload);

//       toast.success("Zerodose update request submitted successfully.");

//       router.back();
//     } catch (error) {
//       console.error(
//         isUpdate ? "Update zerodose error:" : "Add zerodose error:",
//         error,
//       );

//       toast.error(
//         error?.response?.data?.message ||
//           error?.message ||
//           (isUpdate ? "Failed to update zerodose." : "Failed to add zerodose."),
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============================================================
//   // Loading Skeleton
//   // ============================================================

//   if (loadingData) {
//     return (
//       <div className="w-full animate-pulse">
//         <div className="mt-4 mb-6 flex items-start gap-3">
//           <div className="bg-surface mt-1 h-9 w-9 shrink-0 rounded-lg" />

//           <div className="flex-1">
//             <div className="bg-surface h-7 w-40 rounded-md" />
//             <div className="bg-surface mt-2 h-4 w-64 rounded-md" />
//           </div>
//         </div>

//         <div className="border-border bg-background rounded-xl border shadow-sm">
//           <div className="p-5 sm:p-6">
//             <div className="mb-5 flex items-center gap-3">
//               <div className="bg-surface h-10 w-10 shrink-0 rounded-lg" />

//               <div className="flex-1">
//                 <div className="bg-surface h-5 w-36 rounded-md" />
//                 <div className="bg-surface mt-2 h-4 w-52 rounded-md" />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//               {[1, 2, 3, 4].map((item) => (
//                 <div key={item}>
//                   <div className="bg-surface mb-2 h-4 w-24 rounded-md" />
//                   <div className="bg-surface h-11 w-full rounded-lg" />
//                 </div>
//               ))}
//             </div>

//             <div className="mt-5">
//               <div className="bg-surface mb-2 h-4 w-20 rounded-md" />
//               <div className="bg-surface h-[76px] w-full rounded-lg" />
//             </div>
//           </div>

//           <div className="border-border flex flex-col-reverse gap-3 border-t p-5 sm:flex-row sm:justify-end sm:p-6">
//             <div className="bg-surface h-11 w-full rounded-lg sm:w-24" />
//             <div className="bg-surface h-11 w-full rounded-lg sm:w-32" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ============================================================
//   // UI
//   // ============================================================

//   return (
//     <div className="w-full">
//       {/* ========================================================
//           Header
//       ======================================================== */}

//       <div className="mt-4 mb-6 flex items-start gap-3">
//         <button
//           type="button"
//           onClick={() => router.back()}
//           disabled={loading}
//           className="border-border bg-background text-text-secondary hover:bg-surface mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50"
//         >
//           <ArrowLeft size={18} />
//         </button>

//         <div>
//           <h1 className="text-text text-2xl font-semibold">
//             {isUpdate ? "Update Zerodose" : "Add Zerodose"}
//           </h1>

//           <p className="text-text-secondary mt-1 text-sm">
//             {isUpdate
//               ? "Update zerodose child details."
//               : "Record a new zerodose child."}
//           </p>
//         </div>
//       </div>

//       {/* ========================================================
//           Form Card
//       ======================================================== */}

//       <div className="border-border bg-background rounded-xl border shadow-sm">
//         <div className="p-5 sm:p-6">
//           {/* Section Header */}

//           <div className="mb-5 flex items-center gap-3">
//             <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-lg">
//               <User size={20} />
//             </div>

//             <div>
//               <h2 className="text-text font-semibold">Child Information</h2>

//               <p className="text-text-secondary text-sm">
//                 Enter child details below.
//               </p>
//             </div>
//           </div>

//           {/* Fields */}

//           <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//             {/* Child Name */}

//             <div>
//               <label className="text-text mb-2 block text-sm font-medium">
//                 Child Name
//               </label>

//               <input
//                 type="text"
//                 name="childName"
//                 value={formData.childName}
//                 onChange={handleChange}
//                 placeholder="Enter child name"
//                 disabled={loading}
//                 className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full rounded-lg border px-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
//               />
//             </div>

//             {/* Father Name */}

//             <div>
//               <label className="text-text mb-2 block text-sm font-medium">
//                 Father Name
//               </label>

//               <input
//                 type="text"
//                 name="fatherName"
//                 value={formData.fatherName}
//                 onChange={handleChange}
//                 placeholder="Enter father name"
//                 disabled={loading}
//                 className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full rounded-lg border px-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
//               />
//             </div>

//             {/* Age */}

//             <div>
//               <label className="text-text mb-2 block text-sm font-medium">
//                 Age (In Month)
//               </label>

//               <input
//                 type="number"
//                 name="age"
//                 min="0"
//                 max="59"
//                 value={formData.age}
//                 onChange={(e) => {
//                   const value = e.target.value;

//                   if (value === "") {
//                     handleChange(e);
//                     return;
//                   }

//                   const number = Number(value);

//                   if (number >= 0 && number <= 59) {
//                     handleChange(e);
//                   }
//                 }}
//                 placeholder="Enter age"
//                 disabled={loading}
//                 className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full [appearance:textfield] rounded-lg border px-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
//               />
//             </div>

//             {/* Contact */}

//             <div>
//               <label className="text-text mb-2 block text-sm font-medium">
//                 Contact No
//               </label>

//               <div className="relative">
//                 <Phone
//                   size={17}
//                   className="text-text-secondary absolute top-1/2 left-3 -translate-y-1/2"
//                 />

//                 <input
//                   type="tel"
//                   name="contactNo"
//                   value={formData.contactNo}
//                   onChange={(e) => {
//                     const value = e.target.value
//                       .replace(/\D/g, "")
//                       .slice(0, 11);

//                     setFormData((previous) => ({
//                       ...previous,
//                       contactNo: value,
//                     }));
//                   }}
//                   placeholder="03XXXXXXXXX"
//                   inputMode="numeric"
//                   maxLength={11}
//                   disabled={loading}
//                   className={`border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full rounded-lg border pr-3 pl-10 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
//                     formData.contactNo && !/^03\d{9}$/.test(formData.contactNo)
//                       ? "border-red-500 focus:border-red-500 focus:ring-red-100"
//                       : ""
//                   }`}
//                 />
//               </div>

//               {formData.contactNo && !/^03\d{9}$/.test(formData.contactNo) && (
//                 <p className="mt-1.5 text-xs text-red-500">
//                   Enter a valid Pakistani mobile number (03XXXXXXXXX).
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Address */}

//           <div className="mt-5">
//             <label className="text-text mb-2 block text-sm font-medium">
//               Address
//             </label>

//             <textarea
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//               rows={3}
//               placeholder="Enter complete address"
//               disabled={loading}
//               className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light w-full resize-none rounded-lg border px-3 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
//             />
//           </div>
//         </div>

//         {/* ======================================================
//             Buttons
//         ====================================================== */}

//         <div className="border-border flex flex-col-reverse gap-3 border-t p-5 sm:flex-row sm:justify-end sm:p-6">
//           <button
//             type="button"
//             onClick={() => router.back()}
//             disabled={loading}
//             className="border-border text-text hover:bg-surface h-11 rounded-lg border px-5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             Cancel
//           </button>

//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={loading || !campaign}
//             className="bg-primary hover:bg-primary-dark flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {loading
//               ? isUpdate
//                 ? "Updating..."
//                 : "Saving..."
//               : isUpdate
//                 ? "Update Zerodose"
//                 : "Add Zerodose"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
