import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ViewMenu from "../ViewMenu";
import { useMenu } from "../../context/useMenu";

export default function ClientDashboard() {
  const { trial, cafe } = useMenu();

  if (trial?.expired) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold">🚨 Trial Expired</h1>
        <p className="mt-2">
          Your free trial for {cafe.name} has ended. Please contact owner.
        </p>
      </div>
    );
  }
  return (
    <>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar />
        <Outlet />
      </div>
    </>
  );
}
