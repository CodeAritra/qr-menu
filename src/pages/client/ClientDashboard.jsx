/* eslint-disable no-unused-vars */
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ViewMenu from "../ViewMenu";
import { useMenu } from "../../context/useMenu";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ClientDashboard() {
  const { trial, cafe } = useMenu();
  const [tableNo, setTableNo] = useState();
  const [user, setuser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const tableParam = searchParams.get("table");
    if (tableParam) {
      setTableNo(tableParam);
      localStorage.setItem("tableNo", tableParam); // optional, persist if needed
    }
  }, [searchParams]);

  // useEffect(()=>{
  //   console.log("table no = ",tableNo);

  // },[tableNo])

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
      <div className="flex flex-col h-screen">
        <Navbar />
        <Outlet />

        {/* Bottom Navbar */}
        {!user && (
          <nav className="btm-nav bg-base-100 shadow-md sticky bottom-0  flex justify-evenly p-4">
            <button
              className="flex flex-col items-center justify-center"
              onClick={() => navigate("")}
            >
              <span className="text-xl">🍴</span>
              <span className="text-xs">Menu</span>
            </button>
            <button
              className="flex flex-col items-center justify-center"
              onClick={() => navigate("cart")}
            >
              <span className="text-xl">🛒</span>
              <span className="text-xs">Cart</span>
            </button>
          </nav>
        )}
      </div>
    </>
  );
}
