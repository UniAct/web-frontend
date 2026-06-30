"use client";

import { useTheme } from "next-themes";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      closeButton
      expand={false}
      gap={10}
      visibleToasts={4}
      icons={{
        success: <CheckCircle2 className="size-5" />,
        error: <XCircle className="size-5" />,
        warning: <AlertTriangle className="size-5" />,
        info: <Info className="size-5" />,
      }}
      toastOptions={{
        duration: 3500,
        classNames: {
          toast: "app-toast",
          title: "app-toast-title",
          description: "app-toast-description",
          actionButton: "app-toast-action",
          cancelButton: "app-toast-cancel",
          closeButton: "app-toast-close",
          success: "app-toast-success",
          error: "app-toast-error",
          warning: "app-toast-warning",
          info: "app-toast-info",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
