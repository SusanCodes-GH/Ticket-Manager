import { toast as t } from "react-toastify";

export const toast = {
  success: (msg) => t.success(msg, { position: "top-right", autoClose: 3000 }),
  error: (msg) => t.error(msg, { position: "top-right", autoClose: 4000 }),
  info: (msg) => t.info(msg, { position: "top-right", autoClose: 3000 }),
  warning: (msg) => t.warning(msg, { position: "top-right", autoClose: 4000 }),
};
