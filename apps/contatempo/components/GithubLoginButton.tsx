"use client";

import React from "react";
import { signIn } from "next-auth/react";

export default function GithubLoginButton() {
  return (
    <button
      onClick={() =>
        signIn("github", { callbackUrl: `${window.location.origin}/dashboard` })
      }
    >
      Login com Github
    </button>
  );
}
