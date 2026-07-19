import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { setUser, getUser } from "@/lib/auth";

export function useAuth(requireAuth = true) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    authClient.getSession().then((result) => {
      const session = result?.data;
      if (session?.user) {
        const u = session.user as any;
        // keep localStorage in sync with real session
        setUser({
          name: u.name || "",
          email: u.email || "",
          hospitalName: u.hospitalName || getUser()?.hospitalName || "",
          country: u.country || getUser()?.country || "",
          department: u.department || getUser()?.department || "",
          role: u.role || "Node Administrator",
        });
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        if (requireAuth) navigate({ to: "/login" });
      }
      setLoading(false);
    });
  }, [requireAuth, navigate]);

  return { loading, authenticated };
}
