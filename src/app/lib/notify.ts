import { toast } from "sonner";

export function notifySuccess(message: string) {
  toast.success(message);
}
