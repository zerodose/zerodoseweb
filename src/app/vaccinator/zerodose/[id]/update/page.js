"use client";

import { useParams } from "next/navigation";

import VaccinatorZerodoseForm from "@/components/vaccinator/VaccinatorZerodoseForm";

export default function ZerodoseUpdatePage() {
  const params = useParams();

  const id = params?.id;

  return <VaccinatorZerodoseForm zerodoseId={id} />;
}
