

// Task 1: Basic Type & Interface Practice

interface User {
  name: string;
  email: string;
  phone?: string; //optional
  active?: boolean;
}

// Example:
const user1: User = { name: "Alice", email: "alice@example.com", active: true };
const user2: User = { name: "Bob", email: "bob@example.com", phone: "123-456-7890" };

console.log("User 1:", user1);
console.log("User 2:", user2);


// Task 2: Union & Type Narrowing

function formatInput(input: string | number): string {
  if (typeof input === "number") {
    return `Input as number: ${input.toFixed(2)}`;
  } else {
    return `Input as string: ${input.toUpperCase()}`;
  }
}

// Example:
console.log(formatInput("hello world"));
console.log(formatInput(3.14159));


// Task 3: Array & Object Typing

interface Product {
  name: string;
  price: number;
  inStock: boolean;
}

const products: Product[] = [
  { name: "Laptop", price: 1000, inStock: true },
  { name: "Mouse", price: 50, inStock: true },
  { name: "Keyboard", price: 75, inStock: false },
];

// Example:
console.log("Product List:");
products.forEach(p => console.log(`- ${p.name} ($${p.price}) - In Stock: ${p.inStock}`));


// Task 4: Function with Generics

function getFirstItem<T>(arr: T[]): T | null {
  return arr.length > 0 ? arr[0] : null;
}

// Example:
const firstString = getFirstItem<string>(["a", "b", "c"]);
const firstNumber = getFirstItem<number>([1, 2, 3]);
const emptyArray = getFirstItem<any>([]);

console.log(`First string: ${firstString}`);
console.log(`First number: ${firstNumber}`);
console.log(`From empty array: ${emptyArray}`);


// Task 5: Readonly & Partial Utility

const readOnlyUser: Readonly<User> = {
  name: "Readonly User",
  email: "readonly@example.com"
};

type UserUpdate = Partial<User>;

const userUpdate: UserUpdate = {
  phone: "987-654-3210"
};

console.log("Readonly User:", readOnlyUser);
console.log("Partial Update Object:", userUpdate);


// Task 6: Type Assertion & Casting

let unknownValue: unknown = "This is a string from an API";

if (typeof unknownValue === "string") {
  console.log(`Safe cast (guard): ${unknownValue.toUpperCase()}`);
}

const assertedString = unknownValue as string;
console.log(`'as' assertion: ${assertedString.toUpperCase()}`);


// Task 7: Enum & Literal Type
console.log("\n--- 7. Enum & Literal Type ---");

enum Role {
  Admin, // 0
  User,  // 1
  Guest  // 2
}

let myRole: Role = Role.Admin;
console.log(`My role is: ${myRole} (${Role[myRole]})`);

type Status = "pending" | "approved" | "rejected";

let myStatus: Status = "pending";

console.log(`My status is: ${myStatus}`);


// Task 8: Function Return Type Practice


async function fetchUsers(): Promise<User[]> {
  const mockUsers: User[] = [
    { name: "Carol", email: "carol@example.com" },
    { name: "David", email: "david@example.com", active: true },
  ];
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return mockUsers;
}


(async () => {
  console.log("Fetching users...");
  const users = await fetchUsers();
  console.log("Users fetched:", users);
})();