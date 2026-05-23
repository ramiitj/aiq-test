import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LiveSessionEvent {
  testStartedDelta: number;
  testCompletedDelta: number;
  violationDelta: number;
  lastEventAt: string | null;
}

/**
 * Subscribes to realtime changes on tests and security_violations.
 * Calls onChange() whenever something interesting happens so the
 * monitor can refetch the aggregated snapshot.
 */
export function useLiveSessions(onChange: () => void) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel("admin-live-monitor")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tests" },
        () => onChange()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "security_violations" },
        () => onChange()
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { connected };
}
