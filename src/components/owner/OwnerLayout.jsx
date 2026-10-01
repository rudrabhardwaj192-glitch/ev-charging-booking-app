import OwnerSidebar from "./OwnerSidebar";

function OwnerLayout({ children }) {
  return (
    <div className="flex bg-gray-100">

      <OwnerSidebar />

      <div className="flex-1 p-8">
        {children}
      </div>

    </div>
  );
}

export default OwnerLayout;