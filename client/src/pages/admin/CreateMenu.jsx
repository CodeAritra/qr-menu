import MenuForm from "../../components/MenuForm";

export default function CreateMenu({ addMenuItem }) {
  return (
    <div className="md:p-2">
      <h2 className="text-2xl font-bold ">Create Menu</h2>
      <MenuForm addMenuItem={addMenuItem} />
    </div>
  );
}
