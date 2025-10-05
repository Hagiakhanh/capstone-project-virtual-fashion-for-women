// src/utils/toastHelper.ts
import { toast, Bounce, ToastOptions, Id } from "react-toastify";
import { ReactNode } from "react";

// --- Các props mặc định cho <ToastContainer /> ---
// Import object này vào App.tsx/_app.tsx và truyền vào <ToastContainer />
export const defaultToastContainerProps = {
  position: "top-right" as const,
  autoClose: 3000,
  hideProgressBar: false,
  newestOnTop: false,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: "light" as const,
  transition: Bounce,
};

// Kiểu options mở rộng thêm `duration`
type ExtendedToastOptions = ToastOptions & {
  duration?: number; // giây
};

export const messageToast = {
  success: (content: ReactNode, options: ExtendedToastOptions = {}) => {
    const { duration, ...rest } = options;
    const finalOptions: ToastOptions = { ...rest };
    if (typeof duration === "number") {
      finalOptions.autoClose = duration * 1000;
    }
    toast.success(content, finalOptions);
  },

  error: (content: ReactNode, options: ExtendedToastOptions = {}) => {
    const { duration, ...rest } = options;
    const finalOptions: ToastOptions = { ...rest };
    if (typeof duration === "number") {
      finalOptions.autoClose = duration * 1000;
    }
    toast.error(content, finalOptions);
  },

  info: (content: ReactNode, options: ExtendedToastOptions = {}) => {
    const { duration, ...rest } = options;
    const finalOptions: ToastOptions = { ...rest };
    if (typeof duration === "number") {
      finalOptions.autoClose = duration * 1000;
    }
    toast.info(content, finalOptions);
  },

  information: (content: ReactNode, options: ExtendedToastOptions = {}) => {
    messageToast.info(content, options);
  },

  warning: (content: ReactNode, options: ExtendedToastOptions = {}) => {
    const { duration, ...rest } = options;
    const finalOptions: ToastOptions = { ...rest };
    if (typeof duration === "number") {
      finalOptions.autoClose = duration * 1000;
    }
    toast.warn(content, finalOptions);
  },

  loading: (content: ReactNode, options: ExtendedToastOptions = {}) => {
    const finalOptions: ToastOptions = { autoClose: false, ...options };
    if (typeof options.duration === "number") {
      finalOptions.autoClose = options.duration * 1000;
    }
    return toast.loading(content, finalOptions);
  },

  update: (toastId: Id, options: ToastOptions) => {
    toast.update(toastId, options);
  },

  dismiss: (toastId?: Id) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};
