const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${className}`}
      {...props}
    />
  );
};

export { Input };
