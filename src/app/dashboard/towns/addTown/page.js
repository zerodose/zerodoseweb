// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// import { createTown } from "@/api/townApi";
// import { getDistrictDropdown } from "@/api/districtApi";
// import Select from "@/components/ui/Select";

// export default function AddTownPage() {
//   const router = useRouter();

//   const [formData, setFormData] = useState({
//     name: "",
//     district: "",
//   });

//   const [districts, setDistricts] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [districtLoading, setDistrictLoading] = useState(true);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // =====================================================
//   // Load Districts
//   // =====================================================

//   useEffect(() => {
//     const loadDistricts = async () => {
//       try {
//         setDistrictLoading(true);

//         const response = await getDistrictDropdown();

//         setDistricts(response.data || []);
//       } catch (error) {
//         console.error("Get districts error:", error);

//         setError(error?.response?.data?.message || "Failed to load districts.");
//       } finally {
//         setDistrictLoading(false);
//       }
//     };

//     loadDistricts();
//   }, []);

//   // =====================================================
//   // Handle Change
//   // =====================================================

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     setError("");
//     setSuccess("");
//   };

//   // =====================================================
//   // Submit
//   // =====================================================

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setError("");
//     setSuccess("");

//     if (!formData.name.trim()) {
//       setError("Town name is required.");
//       return;
//     }

//     if (!formData.district) {
//       setError("Please select a district.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await createTown({
//         name: formData.name.trim(),
//         district: formData.district,
//       });

//       setSuccess(response.message || "Town created successfully.");

//       setFormData({
//         name: "",
//         district: "",
//       });
//     } catch (error) {
//       const message =
//         error?.response?.data?.message || "Failed to create town.";

//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen bg-surface px-4 py-10">
//       <div className="mx-auto w-full max-w-xl">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-text">Add Town</h1>

//           <p className="mt-2 text-sm text-text-secondary">
//             Create a new town in Zerodose.
//           </p>
//         </div>

//         {/* Card */}
//         <div className="rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
//           {/* Error */}
//           {error && (
//             <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
//               {error}
//             </div>
//           )}

//           {/* Success */}
//           {success && (
//             <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
//               {success}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {/* Town Name */}
//             <div>
//               <label
//                 htmlFor="name"
//                 className="mb-2 block text-sm font-medium text-text"
//               >
//                 Town Name
//               </label>

//               <input
//                 id="name"
//                 name="name"
//                 type="text"
//                 value={formData.name}
//                 onChange={handleChange}
//                 placeholder="Enter town name"
//                 minLength={2}
//                 maxLength={100}
//                 required
//                 disabled={loading}
//                 className="
//                   h-12 w-full rounded-lg
//                   border border-border
//                   bg-input-background
//                   px-4
//                   text-sm text-text
//                   outline-none
//                   transition
//                   placeholder:text-input-placeholder
//                   focus:border-primary
//                   focus:ring-2
//                   focus:ring-primary-light
//                   disabled:cursor-not-allowed
//                   disabled:opacity-60
//                 "
//               />
//             </div>

//             {/* District */}
//             <Select
//               label="District"
//               name="district"
//               value={formData.district}
//               onChange={handleChange}
//               placeholder={
//                 districtLoading ? "Loading districts..." : "Select district"
//               }
//               disabled={loading || districtLoading}
//               required
//               options={districts.map((district) => ({
//                 value: district._id,
//                 label: district.name,
//               }))}
//             />

//             {/* Submit */}
//             <button
//               type="submit"
//               disabled={loading || districtLoading}
//               className="
//                 h-12 w-full rounded-lg
//                 bg-primary
//                 px-4
//                 text-sm font-semibold
//                 text-primary-foreground
//                 transition
//                 hover:bg-primary-dark
//                 disabled:cursor-not-allowed
//                 disabled:opacity-60
//               "
//             >
//               {loading ? "Creating Town..." : "Add Town"}
//             </button>
//           </form>
//         </div>

//         {/* Back */}
//         <button
//           type="button"
//           disabled={loading}
//           onClick={() => router.back()}
//           className="
//             mt-5 text-sm font-medium
//             text-primary
//             transition
//             hover:text-primary-dark
//             disabled:cursor-not-allowed
//             disabled:opacity-60
//           "
//         >
//           ← Go Back
//         </button>
//       </div>
//     </main>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPinned, Save } from "lucide-react";
import { toast } from "sonner";

import { createTown } from "@/api/townApi";
import { getDistrictDropdown } from "@/api/districtApi";
import Select from "@/components/ui/Select";

export default function AddTownPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    district: "",
  });

  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [districtLoading, setDistrictLoading] = useState(true);

  // =====================================================
  // Load Districts
  // =====================================================

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        setDistrictLoading(true);

        const response = await getDistrictDropdown();

        setDistricts(response.data || []);
      } catch (error) {
        console.error("Get districts error:", error);

        toast.error(
          error?.response?.data?.message || "Failed to load districts.",
        );
      } finally {
        setDistrictLoading(false);
      }
    };

    loadDistricts();
  }, []);

  // =====================================================
  // Handle Change
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // Submit
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter town name.");
      return;
    }

    if (!formData.district) {
      toast.error("Please select district.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        district: formData.district,
      };

      console.log("Create Town Payload:", payload);

      await createTown(payload);

      toast.success("Town created successfully.");

      router.push("/dashboard/towns");
    } catch (error) {
      const status = error?.response?.status;

      const message =
        error?.response?.data?.message || "Failed to create town.";

      if (status === 409) {
        toast.error(message);
        return;
      }

      console.error("Create Town error:", error);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* =====================================================
          Header
      ===================================================== */}

      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="bg-background border-border text-icon hover:bg-surface flex h-10 w-10 items-center justify-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-text text-xl font-bold sm:text-2xl">Add Town</h1>

          <p className="text-text-secondary mt-1 text-sm">
            Create a new town in Zerodose.
          </p>
        </div>
      </div>

      {/* =====================================================
          Form Card
      ===================================================== */}

      <div className="bg-background border-border rounded-2xl border shadow-sm">
        <form onSubmit={handleSubmit}>
          {/* =================================================
              Form Header
          ================================================= */}

          <div className="border-border flex items-center gap-3 border-b p-5 sm:p-6">
            <div className="bg-primary-light flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <MapPinned className="text-primary h-5 w-5" />
            </div>

            <div>
              <h2 className="text-text font-semibold">Town Information</h2>

              <p className="text-text-secondary mt-0.5 text-xs">
                Enter town details below.
              </p>
            </div>
          </div>

          {/* =================================================
              Fields
          ================================================= */}

          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-3 sm:p-6">
            {/* Town Name */}

            <div>
              <label
                htmlFor="name"
                className="text-text mb-2 block text-sm font-medium"
              >
                Town Name
                <span className="text-primary ml-1">*</span>
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter town name"
                minLength={2}
                maxLength={100}
                required
                disabled={loading}
                className="bg-input-background text-text placeholder:text-input-placeholder border-border focus:border-primary focus:ring-primary-light w-full rounded-xl border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* District */}

            <Select
              label="District"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder={
                districtLoading ? "Loading districts..." : "Select district"
              }
              disabled={loading || districtLoading}
              required
              options={districts.map((district) => ({
                value: district._id,
                label: district.name,
              }))}
            />
          </div>

          {/* =================================================
              Footer
          ================================================= */}

          <div className="border-border flex flex-col-reverse gap-3 border-t p-5 sm:flex-row sm:justify-end sm:p-6">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="border-border bg-background text-text hover:bg-surface rounded-xl border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || districtLoading}
              className="bg-primary hover:bg-primary-dark text-primary-foreground inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Town
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
