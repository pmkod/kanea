import { sessionsQueryKey } from "@/constants/query-keys";
import { getActiveSessionRequest } from "@/services/session-service";
import { Session } from "@/types/session";
import { useQuery } from "@tanstack/react-query";

export const useSession = ({ session }: { session: Session }) =>
  useQuery({
    queryKey: [sessionsQueryKey, session.id],
    queryFn: () => getActiveSessionRequest(session.id),
  });
