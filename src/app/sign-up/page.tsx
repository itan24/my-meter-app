// src/app/sign-up/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/sign-in");
  }, [router]);

  return null;
}