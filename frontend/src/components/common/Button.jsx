function Button({ children, ...props }) {
  return (
    <button
      {...props}
      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
    >
      {children}
    </button>
  );
}

export default Button;