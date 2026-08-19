"use client";

import { useParams } from "next/navigation";

import ZerodoseForm from "@/components/worker/ZerodoseForm";

export default function ZerodoseUpdatePage() {
  const params = useParams();

  const id = params?.id;

  return <ZerodoseForm mode="edit" zerodoseId={id} />;
}
