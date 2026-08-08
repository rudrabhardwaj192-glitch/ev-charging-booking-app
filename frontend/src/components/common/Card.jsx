function Card({ children }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      {children}
    </div>
  );
}

export default Card;