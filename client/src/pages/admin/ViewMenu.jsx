import MenuTable from "../../components/MenuTable";

export default function ViewMenu({ menu }) {
  return (
    <div>
      <h2 className=" text-2xl font-bold px-3">View Menu</h2>
      <hr />
      <MenuTable menu={menu} user={true} showQR />
    </div>
  );
}
