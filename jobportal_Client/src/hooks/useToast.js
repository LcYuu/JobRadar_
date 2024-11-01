import { useToast as useToastUI } from "../ui/toast"

export function useToast() {
  const { toast } = useToastUI()
  
  return {
    toast: ({
      title,
      description,
      variant = "default",
      duration = 3000,
    }) => {
      toast({
        title,
        description,
        variant,
        duration,
      })
    },
  }
} 