import { router } from "expo-router";
import React, { useEffect } from "react";

/**
 * This page redirects to the user signup page
 * The actual signup pages are:
 * - /user-signup: For regular travelers
 * - /guide-registration: For travel guides
 */
export default function SignupScreen() {
  useEffect(() => {
    // Redirect to user signup page
    router.replace("/user-signup");
  }, []);

  return null;
}
