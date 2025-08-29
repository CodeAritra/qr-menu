import { useState } from "react";

export default function MenuForm({ addMenuItem }) {
  const [item, setItem] = useState({ name: "", price: "", category: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    addMenuItem(item);
    setItem({ name: "", price: "", category: "" });
  };

  return (
    <form onSubmit={handleSubmit} className=" py-2 space-y-4">
      <input type="text" placeholder="Item Name" value={item.name}
        onChange={(e) => setItem({ ...item, name: e.target.value })}
        className="input input-bordered w-full" required />
      <input type="number" placeholder="Price" value={item.price}
        onChange={(e) => setItem({ ...item, price: e.target.value })}
        className="input input-bordered w-full" required />
      <input type="text" placeholder="Category" value={item.category}
        onChange={(e) => setItem({ ...item, category: e.target.value })}
        className="input input-bordered w-full" required />
      <button type="submit" className="btn btn-primary w-full">Add Item</button>
    </form>
  );
}
