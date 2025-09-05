import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ViewMenu from "../ViewMenu";

export default function ClientDashboard() {
  return (
    <>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar />
        <Outlet />
      </div>
    </>
  );
}
