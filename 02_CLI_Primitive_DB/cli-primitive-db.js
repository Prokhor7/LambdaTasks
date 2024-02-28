import inquirer from "inquirer";
import fs from "fs";

class Database {
  filePath;

  constructor(filePath) {
    this.filePath = filePath;
  }

  addUser(user) {
    fs.appendFileSync(this.filePath, JSON.stringify(user) + "\n");
  }

  getUsers() {
    try {
      return fs
        .readFileSync(this.filePath, "utf-8")
        .split("\n")
        .map((user) => {
          if (user) {
            return JSON.parse(user);
          }
        })
        .filter((user) => user !== undefined);
    } catch (error) {
      return [];
    }
  }
}

async function addUsers() {
  const db = new Database("./db.txt");

  let exit = false;
  let newUser = {};

  while (true) {
    await inquirer
      .prompt({
        message: "Enter the user's name. To cancel press ENTER: ",
        type: "input",
        name: "name",
      })
      .then(({ name }) => {
        if (!name) {
          exit = true;
        } else {
          newUser.name = name;
        }
      });
    if (exit) {
      break;
    }
    await inquirer
      .prompt([
        {
          message: "Select gender:",
          type: "list",
          name: "gender",
          choices: ["male", "female", "other"],
        },
        {
          message: "Enter the age:",
          type: "input",
          name: "age",
          validate: (age) => {
            if (age) {
              if (!isNaN(age)) {
                if (age >= 0 && age <= 130) {
                  return true;
                }
              }
            }

            return "Invalid age";
          },
        },
      ])
      .then(({ gender, age }) => {
        newUser.gender = gender;
        newUser.age = age;
      });
    db.addUser(newUser);
  }
}

async function searchUser() {
  const db = new Database("./db.txt");
  let users = [];
  let performSearch = true;
  await inquirer
    .prompt({
      type: "confirm",
      name: "search",
      message: "Do you want to perform a search in DB?",
    })
    .then(({ search }) => {
      if (search) {
        users = db.getUsers();
      } else {
        performSearch = false;
      }
    });
  if (performSearch) {
    await inquirer
      .prompt({
        message: "Enter the user's name which you want to find in db: ",
        type: "input",
        name: "query",
        validate: (query) => {
          if (query) {
            return true;
          }

          return "Please enter search query";
        },
      })
      .then(({ query }) => {
        const foundUsers = users.filter((user) =>
          user.name.toLowerCase().includes(query.toLowerCase())
        );

        if (foundUsers.length > 0) {
          console.log("Found: ", foundUsers);
        } else {
          console.log("No users found with the specified name.");
        }
      });
  }
}

async function main() {
  await addUsers();
  await searchUser();
  console.log("Goodbye!");
}

main();
