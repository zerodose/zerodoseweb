// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";

// import User from "@/models/User";

// import {
//   generateVerificationCode,
//   hashVerificationCode,
// } from "@/lib/auth/generateVerificationCode";

// import { sendVerificationEmail } from "@/lib/mail/sendVerificationEmail";

// import { setPendingPasswordReset } from "@/lib/pendingPasswordResets";

// export async function POST(request) {
//   try {
//     // ============================================================
//     // Connect Database
//     // ============================================================

//     await connectDB();

//     // ============================================================
//     // Get Request Body
//     // ============================================================

//     const body = await request.json();

//     const mobile = body?.mobile?.trim();

//     if (!mobile) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Mobile number is required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ============================================================
//     // Validate Pakistani Mobile Number
//     // ============================================================

//     if (!/^03\d{9}$/.test(mobile)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Please enter a valid Pakistani mobile number.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ============================================================
//     // Find User By Mobile Number
//     //
//     // Email user khud enter nahi karega.
//     // Database mein mobile se user find hoga.
//     // User ki existing email par OTP jayega.
//     // ============================================================

//     const user = await User.findOne({
//       contactNumber: mobile,
//     })
//       .select("_id name email designation contactNumber isActive")
//       .lean();

//     // ============================================================
//     // User Not Found
//     // ============================================================

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "No account found with this mobile number.",
//         },
//         {
//           status: 404,
//         },
//       );
//     }

//     // ============================================================
//     // Active User Check
//     // ============================================================

//     if (!user.isActive) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "This account is inactive. Please contact administrator.",
//         },
//         {
//           status: 403,
//         },
//       );
//     }

//     // ============================================================
//     // Check User Email
//     //
//     // Email database mein already honi chahiye.
//     // User email provide nahi karega.
//     // ============================================================

//     if (!user.email) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "No email address is associated with this account. Please contact administrator.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // ============================================================
//     // OTP Email
//     // ============================================================

//     const verificationEmail = user.email;
//     const verificationName = user.name;

//     // ============================================================
//     // Generate OTP
//     // ============================================================

//     const verificationCode = generateVerificationCode();

//     // ============================================================
//     // Hash OTP
//     // ============================================================

//     const hashedVerificationCode = hashVerificationCode(verificationCode);

//     // ============================================================
//     // OTP Expiry
//     //
//     // 10 minutes
//     // ============================================================

//     const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

//     // ============================================================
//     // Save Pending Password Reset
//     // ============================================================

//     setPendingPasswordReset(mobile, {
//       userId: user._id.toString(),

//       identifier: mobile,

//       designation: user.designation,

//       verificationCode: hashedVerificationCode,

//       verificationExpires,

//       verificationEmail,

//       createdAt: Date.now(),
//     });

//     // ============================================================
//     // Send OTP Email
//     // ============================================================

//     try {
//       await sendVerificationEmail({
//         email: verificationEmail,
//         name: verificationName,
//         code: verificationCode,
//       });
//     } catch (emailError) {
//       console.error("Forgot password email error:", emailError);

//       return NextResponse.json(
//         {
//           success: false,
//           message: "Verification email could not be sent. Please try again.",
//         },
//         {
//           status: 500,
//         },
//       );
//     }

//     // ============================================================
//     // Mask Email
//     // ============================================================

//     const maskedEmail = verificationEmail.replace(
//       /^(.{2}).*(@.*)$/,
//       "$1****$2",
//     );

//     // ============================================================
//     // Success
//     // ============================================================

//     return NextResponse.json(
//       {
//         success: true,

//         message: "Verification code has been sent.",

//         data: {
//           mobile,

//           email: maskedEmail,
//         },
//       },
//       {
//         status: 200,
//       },
//     );
//   } catch (error) {
//     console.error("Forgot password error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: error?.message || "Failed to process forgot password request.",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";

import User from "@/models/User";

import {
  generateVerificationCode,
  hashVerificationCode,
} from "@/lib/auth/generateVerificationCode";

import { sendVerificationEmail } from "@/lib/mail/sendVerificationEmail";

import { setPendingPasswordReset } from "@/lib/pendingPasswordResets";

export async function POST(request) {
  try {
    // ============================================================
    // Connect Database
    // ============================================================

    await connectDB();

    // ============================================================
    // Get Request Body
    // ============================================================

    const body = await request.json();

    const mobile = body?.mobile?.trim();

    if (!mobile) {
      return NextResponse.json(
        {
          success: false,
          message: "Mobile number is required.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Validate Pakistani Mobile Number
    // ============================================================

    if (!/^03\d{9}$/.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid Pakistani mobile number.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Find User
    // ============================================================

    const user = await User.findOne({
      contactNumber: mobile,
    })
      .select(
        "_id name designation contactNumber isActive supervisor",
      )
      .lean();

    // ============================================================
    // User Not Found
    // ============================================================

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "No account found with this mobile number.",
        },
        {
          status: 404,
        },
      );
    }

    // ============================================================
    // Active User Check
    // ============================================================

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This account is inactive. Please contact administrator.",
        },
        {
          status: 403,
        },
      );
    }

    // ============================================================
    // Worker Check
    //
    // Worker does not have email.
    // Worker password reset code will go to supervisor.
    // ============================================================

    if (user.designation === "worker") {
      // ----------------------------------------------------------
      // Worker must have a supervisor
      // ----------------------------------------------------------

      if (!user.supervisor) {
        return NextResponse.json(
          {
            success: false,
            message:
              "No supervisor is assigned to this worker. Please contact administrator.",
          },
          {
            status: 400,
          },
        );
      }

      // ----------------------------------------------------------
      // Find Supervisor
      // ----------------------------------------------------------

      const supervisor = await User.findOne({
        _id: user.supervisor,
        designation: "supervisor",
        isActive: true,
      })
        .select("_id name email contactNumber")
        .lean();

      if (!supervisor) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Assigned supervisor was not found or is inactive. Please contact administrator.",
          },
          {
            status: 400,
          },
        );
      }

      // ----------------------------------------------------------
      // Supervisor must have email
      // ----------------------------------------------------------

      if (!supervisor.email) {
        return NextResponse.json(
          {
            success: false,
            message:
              "No email address is associated with your supervisor. Please contact administrator.",
          },
          {
            status: 400,
          },
        );
      }

      // ----------------------------------------------------------
      // Generate OTP
      // ----------------------------------------------------------

      const verificationCode = generateVerificationCode();

      // ----------------------------------------------------------
      // Hash OTP
      // ----------------------------------------------------------

      const hashedVerificationCode =
        hashVerificationCode(verificationCode);

      // ----------------------------------------------------------
      // OTP Expiry
      //
      // 10 minutes
      // ----------------------------------------------------------

      const verificationExpires = new Date(
        Date.now() + 10 * 60 * 1000,
      );

      // ----------------------------------------------------------
      // Save Pending Password Reset
      // ----------------------------------------------------------

      setPendingPasswordReset(mobile, {
        userId: user._id.toString(),

        identifier: mobile,

        designation: user.designation,

        verificationCode: hashedVerificationCode,

        verificationExpires,

        verificationEmail: supervisor.email,

        createdAt: Date.now(),
      });

      // ----------------------------------------------------------
      // Send OTP To Supervisor
      // ----------------------------------------------------------

      try {
        await sendVerificationEmail({
          email: supervisor.email,
          name: supervisor.name,
          code: verificationCode,
        });
      } catch (emailError) {
        console.error(
          "Worker forgot password email error:",
          emailError,
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Verification email could not be sent. Please try again.",
          },
          {
            status: 500,
          },
        );
      }

      // ----------------------------------------------------------
      // Mask Supervisor Email
      // ----------------------------------------------------------

      const maskedEmail = supervisor.email.replace(
        /^(.{2}).*(@.*)$/,
        "$1****$2",
      );

      // ----------------------------------------------------------
      // Worker Success
      // ----------------------------------------------------------

      return NextResponse.json(
        {
          success: true,

          message:
            "Verification code has been sent to your supervisor.",

          data: {
            mobile,

            email: maskedEmail,

            recipient: "supervisor",
          },
        },
        {
          status: 200,
        },
      );
    }

    // ============================================================
    // Non-Worker Users
    //
    // Supervisor / UCMO / Admin etc.
    // Their own email will receive the OTP.
    // ============================================================

    const emailUser = await User.findById(user._id)
      .select("_id name email designation contactNumber")
      .lean();

    // ============================================================
    // Check User Email
    // ============================================================

    if (!emailUser?.email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No email address is associated with this account. Please contact administrator.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // Generate OTP
    // ============================================================

    const verificationCode = generateVerificationCode();

    // ============================================================
    // Hash OTP
    // ============================================================

    const hashedVerificationCode =
      hashVerificationCode(verificationCode);

    // ============================================================
    // OTP Expiry
    // ============================================================

    const verificationExpires = new Date(
      Date.now() + 10 * 60 * 1000,
    );

    // ============================================================
    // Save Pending Password Reset
    // ============================================================

    setPendingPasswordReset(mobile, {
      userId: user._id.toString(),

      identifier: mobile,

      designation: user.designation,

      verificationCode: hashedVerificationCode,

      verificationExpires,

      verificationEmail: emailUser.email,

      createdAt: Date.now(),
    });

    // ============================================================
    // Send OTP To User
    // ============================================================

    try {
      await sendVerificationEmail({
        email: emailUser.email,
        name: emailUser.name,
        code: verificationCode,
      });
    } catch (emailError) {
      console.error(
        "Forgot password email error:",
        emailError,
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Verification email could not be sent. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    // ============================================================
    // Mask Email
    // ============================================================

    const maskedEmail = emailUser.email.replace(
      /^(.{2}).*(@.*)$/,
      "$1****$2",
    );

    // ============================================================
    // Success
    // ============================================================

    return NextResponse.json(
      {
        success: true,

        message: "Verification code has been sent.",

        data: {
          mobile,

          email: maskedEmail,

          recipient: "self",
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to process forgot password request.",
      },
      {
        status: 500,
      },
    );
  }
}