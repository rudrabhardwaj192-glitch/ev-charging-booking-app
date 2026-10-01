function Modal({ children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white rounded-xl p-6">
        {children}
      </div>
    </div>
  );
}

export default Modal;