import React from "react";
import AdminSignupForm from "@/components/auth/AdminSignupForm";

export default async function UpdateUserPage({ params }) {
  const { id } = await params;

  return <AdminSignupForm mode="edit" userId={id} />;
}
