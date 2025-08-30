/*export const menu = [
  {
    category: "Starters",
    items: [
      { id: 1, name: "Paneer Tikka", price: 180, available: true },
      { id: 2, name: "Veg Spring Roll", price: 150, available: true },
      { id: 3, name: "Chicken Wings", price: 220, available: false },
    ],
  },
  {
    category: "Main Course",
    items: [
      { id: 4, name: "Butter Chicken", price: 320, available: true },
      { id: 5, name: "Paneer Butter Masala", price: 280, available: true },
      { id: 6, name: "Dal Makhani", price: 200, available: true },
    ],
  },
  {
    category: "Beverages",
    items: [
      { id: 7, name: "Cold Coffee", price: 120, available: true },
      { id: 8, name: "Fresh Lime Soda", price: 100, available: true },
      { id: 9, name: "Masala Chai", price: 50, available: true },
    ],
  },
  {
    category: "Desserts",
    items: [
      { id: 10, name: "Gulab Jamun", price: 90, available: true },
      { id: 11, name: "Ice Cream (2 Scoops)", price: 150, available: true },
      { id: 12, name: "Brownie with Ice Cream", price: 180, available: true },
    ],
  },
];*/

export const menu = [
  {
    cafes: {
      cafeAroma: {
        name: "Cafe Aroma",
        ownerId: "owner001",
        serviceType: "menu",
        location: "Delhi",
        createdAt: "2025-08-29T10:00:00Z",
        menu: {
          starter1: {
            category: "Starters",
            items: [
              { id: 1, name: "Paneer Tikka", price: 180, available: true },
              { id: 2, name: "Spring Roll", price: 150, available: true },
            ],
          },
          drink1: {
            category: "Drinks",
            items: [
              { id: 3, name: "Cold Coffee", price: 120, available: true },
              { id: 4, name: "Masala Tea", price: 40, available: true },
            ],
          },
        },
      },

      cafeBliss: {
        name: "Cafe Bliss",
        ownerId: "owner002",
        serviceType: "menu+order",
        location: "Bangalore",
        createdAt: "2025-08-29T10:05:00Z",
        menu: {
          maincourse1: {
            category: "Main Course",
            items: [
              { id: 5, name: "Butter Chicken", price: 320, available: true },
              { id: 6, name: "Veg Biryani", price: 250, available: true },
            ],
          },
          dessert1: {
            category: "Desserts",
            items: [
              { id: 7, name: "Chocolate Brownie", price: 150, available: true },
              { id: 8, name: "Gulab Jamun", price: 100, available: true },
            ],
          },
        },
        orders: {
          order101: {
            customerName: "Rahul",
            tableNo: "5",
            items: [{ itemId: 5, quantity: 2, price: 320 }],
            status: "pending",
            createdAt: "2025-08-29T10:10:00Z",
          },
          order102: {
            customerName: "Priya",
            tableNo: "2",
            items: [{ itemId: 8, quantity: 3, price: 100 }],
            status: "completed",
            createdAt: "2025-08-29T10:20:00Z",
          },
        },
      },

      cafeTreat: {
        name: "Cafe Treat",
        ownerId: "owner003",
        serviceType: "menu",
        location: "Mumbai",
        createdAt: "2025-08-29T10:15:00Z",
        menu: {
          snack1: {
            category: "Snacks",
            items: [
              { id: 9, name: "Samosa", price: 30, available: true },
              { id: 10, name: "Pav Bhaji", price: 90, available: true },
            ],
          },
          drink2: {
            category: "Drinks",
            items: [
              { id: 11, name: "Lassi", price: 60, available: true },
              { id: 12, name: "Orange Juice", price: 70, available: true },
            ],
          },
        },
      },
    },
  },
];
