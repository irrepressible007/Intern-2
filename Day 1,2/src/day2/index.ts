
interface User {
  name: string;
  email: string;
  active: boolean;
}

// Task 1: Object & Array Manipulation


function filterActiveUsers(users: User[]): User[] {
  return users.filter(user => user.active === true);
}

// Example:
const users: User[] = [
  { name: "Alice", email: "a@a.com", active: true },
  { name: "Bob", email: "b@b.com", active: false },
  { name: "Carol", email: "c@c.com", active: true },
];
console.log("Active Users:", filterActiveUsers(users));


// Task 2: Function Overloading


// Overload signatures (what the "outside" world sees)
function getArea(shape: "circle", radius: number): number;
function getArea(shape: "square", side: number): number;

// Implementation signature (the "internal" logic, must handle all overloads)
function getArea(shape: "circle" | "square", size: number): number {
  if (shape === "circle") {
    return Math.PI * size * size; // size is radius
  }
  if (shape === "square") {
    return size * size; // size is side
  }
  // TypeScript will enforce that we never get here
  throw new Error("Invalid shape");
}

// Example:
console.log("Area of circle:", getArea("circle", 10));
console.log("Area of square:", getArea("square", 10));


// Task 3: Async/Await Practice


function fetchData(url: string): Promise<string> {
  console.log(`Fetching data from ${url}...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Data from ${url}`);
    }, 1000); // 1-second delay
  });
}

// Example (using an async IIFE to 'await' the result):
(async () => {
  const data = await fetchData("https://api.example.com/users");
  console.log(data);
})();


// Task 4: Error Handling


function safeJSONParse(str: string): object | null {
  try {
    const result = JSON.parse(str);
    // Ensure it's an object (and not null, which typeof reports as 'object')
    return (typeof result === "object" && result !== null) ? result : null;
  } catch (error) {
    console.error("JSON Parse Error:", (error as Error).message);
    return null;
  }
}

// Example:
const validJSON = '{"name": "Fahim", "id": 123}';
const invalidJSON = '{"name": "Fahim", id: 123}'; // Missing quotes on 'id'
console.log("Valid parse:", safeJSONParse(validJSON));
console.log("Invalid parse:", safeJSONParse(invalidJSON));


// Task 5: Interface + Class Implementation


interface Animal {
  name: string;
  sound(): string;
}

class Dog implements Animal {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  sound(): string {
    return "Woof!";
  }

  wagTail(): void {
    console.log(`${this.name} wags its tail.`);
  }
}

// Example:
const myDog: Animal = new Dog("Buddy");
console.log(`${myDog.name} says: ${myDog.sound()}`);

const myRealDog: Dog = new Dog("Rex"); // Or type it as 'Dog'
myRealDog.wagTail(); 


// Task 6: Generic Function


function getLastItem<T>(arr: T[]): T | null {
  if (arr.length === 0) {
    return null;
  }
  return arr[arr.length - 1];
}

// Example:
console.log("Last number:", getLastItem([1, 2, 3]));
console.log("Last string:", getLastItem(["a", "b", "c"]));
console.log("Last from empty:", getLastItem([]));


// Task 7: Module Export/Import


// This line imports the functions from your OTHER file
import { add, subtract } from './mathUtils';

// Example:
console.log("Imported add(5, 3) =", add(5, 3));
console.log("Imported subtract(10, 4) =", subtract(10, 4));
