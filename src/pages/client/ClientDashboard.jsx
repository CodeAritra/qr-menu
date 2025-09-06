/* eslint-disable no-unused-vars */
import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ViewMenu from "../ViewMenu";
import { useMenu } from "../../context/useMenu";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ClientDashboard() {
  const { trial, cafe } = useMenu();
  const [tableNo, setTableNo] = useState();

  const [searchParams] = useSearchParams();

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
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar />
        <Outlet />
      </div>
    </>
  );
}
