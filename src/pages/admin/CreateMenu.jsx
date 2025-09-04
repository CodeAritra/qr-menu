import { useState } from "react";
import { useMenu } from "../../context/useMenu";

export default function CreateMenu() {
  const { addItem } = useMenu();
  const [item, setItem] = useState({
  id: Date.now(),
  name: "",
  price: "",
  category: "",
  available: true,   //  default value
});

const handleSubmit = (e) => {
  e.preventDefault();
 console.log("Submitting item:", item);
  // Pass the whole item object (includes available: true by default)
  addItem(item.category, item);

  // Reset form (new ID + reset fields + default available again)
  setItem({ 
    id: Date.now(), 
    name: "", 
    price: "", 
    category: "", 
    available: true 
  });
};

  return (
    <div className="md:p-2">
      <h2 className="text-2xl font-bold ">Create Menu</h2>
      <form onSubmit={handleSubmit} className=" py-2 space-y-4">
        <input
          type="text"
          placeholder="Item Name"
          value={item.name}
          onChange={(e) => setItem({ ...item, name: e.target.value })}
          className="input input-bordered w-full"
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={item.price}
          onChange={(e) => setItem({ ...item, price: e.target.value })}
          className="input input-bordered w-full"
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={item.category}
          onChange={(e) => setItem({ ...item, category: e.target.value })}
          className="input input-bordered w-full"
          required
        />
        <button type="submit" className="btn btn-primary w-full">
          Add Item
        </button>
      </form>
    </div>
  );
}
