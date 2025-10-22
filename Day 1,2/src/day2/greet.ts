export {};
/**
 * TypeScript Day 2 Tasks (Task 8: CLI Program)
 *
 * To run this file, in your terminal:
 * npx ts-node src/day2/greet.ts Fahim
 * npx ts-node src/day2/greet.ts "Some Name"
 */

// 'process.argv' is an array of strings from the command line
// [0] is the path to 'node'
// [1] is the path to 'ts-node'
// [2] is the path to 'greet.ts'
// [3] is the first argument we provide (e.g., "Fahim")

// We check if an argument was provided at index 2
const name = process.argv[2];

if (!name) {
  console.log("Please provide a name!");
  console.log("Usage: ts-node greet.ts <your-name>");
} else {
  console.log(`Hello, ${name}!`);
}
