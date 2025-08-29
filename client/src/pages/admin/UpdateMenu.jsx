import MenuTable from "../../components/MenuTable";

export default function UpdateMenu({ menu, updateItem, deleteItem }) {
  return (
    <div>
      <h2 className="text-2xl font-bold p-4">Update Menu</h2>
      <MenuTable menu={menu} updateItem={updateItem} deleteItem={deleteItem} />
    </div>
  );
}
