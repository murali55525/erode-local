const Button = ({ children, className = "", size = "default", variant = "default", ...props }) => {
  const sizeClasses = {
    default: "px-4 py-2",
    sm: "px-3 py-1 text-sm",
    lg: "px-6 py-3 text-lg"
  };

  const variantClasses = {
    default: "bg-rose-500 text-white hover:bg-rose-600",
    outline: "border border-rose-500 text-rose-500 hover:bg-rose-50",
    ghost: "text-gray-600 hover:bg-gray-100",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200"
  };

  return (
    <button
      className={`rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
