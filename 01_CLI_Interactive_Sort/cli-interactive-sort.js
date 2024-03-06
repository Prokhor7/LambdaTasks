const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

class Data {
  data = {
    words: [],
    numbers: [],
  };

  operations = [];

  constructor(operations) {
    this.operations.push(...operations);
  }

  pushData(newData) {
    if (!newData.includes("")) {
      newData.forEach((element) => {
        if (isNaN(element)) {
          this.data.words.push(element);
        } else {
          this.data.numbers.push(parseFloat(element));
        }
      });
    }
  }

  askUser() {
    let str = "";
    for (let i = 0; i < this.operations.length; i++) {
      str += `${i + 1}. ${this.operations[i]}\n`;
    }
    str += `\nSelect (1-${this.operations.length} or 'exit') and press ENTER: `;

    return str;
  }

  getChoices() {
    const choices = ["exit"];
    for (let i = 0; i < this.operations.length; i++) {
      choices.push((i + 1).toString());
    }
    return choices;
  }

  doOperation(choice) {
    this.operations[choice - 1].perform(this.data);
  }
}

const sortWordsAToZ = {
  toString() {
    return "Sort the words alphabetically.";
  },
  perform(data) {
    data.words.sort();
    console.log(data.words);
  },
};

const numbersInAscendingOrder = {
  toString() {
    return "Display the numbers in ascending order.";
  },
  perform(data) {
    data.numbers.sort((a, b) => a - b);
    console.log(data.numbers);
  },
};

const numbersInDescendingOrder = {
  toString() {
    return "Display the numbers in descending order.";
  },
  perform(data) {
    data.numbers.sort((a, b) => b - a);
    console.log(data.numbers);
  },
};

const wordsByNumberOfLetters = {
  toString() {
    return "Display the words in ascending order based on the number of letters in each word.";
  },
  perform(data) {
    data.words.sort((a, b) => a.length - b.length);
    console.log(data.words);
  },
};

const showUniqueWords = {
  toString() {
    return "Show only unique words.";
  },
  perform(data) {
    const uniqueWordsSet = new Set(data.words);
    console.log([...uniqueWordsSet]);
  },
};

const showUniqueValues = {
  toString() {
    return "Show only the unique values from the entire set of words and numbers.";
  },
  perform(data) {
    const uniqueWordsSet = new Set(data.words);
    const uniqueNumbersSet = new Set(data.numbers);
    console.log([...uniqueWordsSet, ...uniqueNumbersSet]);
  },
};

async function main() {
  const data = new Data([
    sortWordsAToZ,
    numbersInAscendingOrder,
    numbersInDescendingOrder,
    wordsByNumberOfLetters,
    showUniqueWords,
    showUniqueValues,
  ]);
  console.log("Hello!");
  let exit = false;
  const choices = data.getChoices();

  while (true) {
    const enteredData = await askQuestion(
      "\nEnter words or digits dividing them in spaces: "
    );

    const newData = enteredData.split(" ");
    data.pushData(newData);

    let choice;
    do {
      const chosenOption = await askQuestion(
        `\nWhat operation would you like to perform?\n${data.askUser()}`
      );
      choice = chosenOption;

      if (!choices.includes(choice)) {
        console.log("\nThere is no such option. Please, try again.");
      } else {
        if (choice === "exit") {
          exit = true;
          break;
        } else {
          data.doOperation(choice);
        }
      }
    } while (!choices.includes(choice));

    if (exit) {
      break;
    }
  }

  console.log("\nGoodbye!");
  rl.close();
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

main();
