import Navbar from "../../components/Navbar";
import ViewMenu from "../ViewMenu";

export default function ClientDashboard() {
  return (
    <>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar />
        <div>
          <h2 className=" text-2xl font-bold p-3">View Menu</h2>
          <hr />
          <ViewMenu />
        </div>
      </div>
    </>
  );
}
