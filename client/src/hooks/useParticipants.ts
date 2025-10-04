import { useState, useCallback } from "react";
import { DailyCall, DailyParticipant } from "@daily-co/daily-js";

interface Participant {
  id: string;
  name: string;
  email: string;
  isLocal: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isOwner?: boolean;
  joinedAt: string;
}

interface UseParticipantsOptions {
  userName?: string;
  userEmail?: string;
}

export const useParticipants = (options: UseParticipantsOptions = {}) => {
  const { userName = "You", userEmail = "" } = options;
  const [participants, setParticipants] = useState<Participant[]>([]);

  const updateParticipants = useCallback(
    (call: DailyCall) => {
      const dailyParticipants = call.participants();

      const participantList: Participant[] = Object.values(
        dailyParticipants
      ).map((p: DailyParticipant) => {
        const participantName = p.local
          ? userName
          : p.user_name || p.user_id || "Unknown User";

        return {
          id: p.session_id,
          name: participantName,
          email: p.local ? userEmail : p.user_id || "",
          isLocal: p.local,
          audioEnabled: p.audio,
          videoEnabled: p.video,
          isOwner: p.owner || false,
          joinedAt: new Date().toISOString(),
        };
      });

      setParticipants(participantList);
    },
    [userName, userEmail]
  );

  const clearParticipants = useCallback(() => {
    setParticipants([]);
  }, []);

  return {
    participants,
    updateParticipants,
    clearParticipants,
  };
};
