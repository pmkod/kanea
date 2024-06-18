import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { isBeingLoggedOutAtom } from "@/atoms/is-being-logged-out-atom";
import { useToast } from "@/components/core/use-toast";
import { logoutRequest } from "@/services/auth-service";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useAtom(isBeingLoggedOutAtom);

  const [webSocket, setWebSocket] = useAtom(webSocketAtom);
  const queryClient = useQueryClient();
  const logout = async () => {
    setIsLoading(true);

    try {
      await logoutRequest();
      webSocket?.disconnect();
      router.push("/");
      setWebSocket(undefined);
      queryClient.clear();
    } catch (error) {
      toast({ colorScheme: "destructive", description: "Error" });
    }

    setIsLoading(false);
  };

  return {
    logout,
    isLoading,
  };
};
