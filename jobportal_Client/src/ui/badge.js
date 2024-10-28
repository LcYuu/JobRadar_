import React from "react"

// Hàm tiện ích để kết hợp các class CSS
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Định nghĩa các biến thể (variants) của Badge dưới dạng đối tượng
const badgeVariants = {
  default:
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
  secondary:
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive:
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
  outline:
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground",
};

// Chuyển Badge component từ TypeScript sang JavaScript
function Badge({ className, variant = "default", ...props }) {
  // Lấy class tương ứng từ badgeVariants dựa trên variant được truyền vào
  const classes = badgeVariants[variant] || badgeVariants.default;

  return (
    <div className={cn(classes, className)} {...props} />
  );
}

export { Badge };
