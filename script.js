const Modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

const Transactions = {
  all: [
    {
      description: "Luz",
      amount: -50000,
      date: "23/01/2021",
    },
    {
      description: "Website",
      amount: 500000,
      date: "23/01/2021",
    },
    {
      description: "Internet",
      amount: -20000,
      date: "23/01/2021",
    },
    {
      description: "App",
      amount: 200000,
      date: "23/01/2021",
    },
  ],

  add(transaction) {
    Transactions.all.push(transaction);
    App.reload();
  },

  remove(index) {
    Transactions.all.splice(index, 1);
    App.reload();
  },

  incomes() {
    let income = 0;

    Transactions.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });

    return income;
  },
  expenses() {
    let expense = 0;

    Transactions.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });

    return expense;
  },
  total() {
    const total = Transactions.incomes() + Transactions.expenses();
    return total;
  },
};

const DOM = {
  transactionContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction);

    DOM.transactionContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td><img src="./assets/minus.svg" alt="Remover transação" /></td>
    `;

    return html;
  },

  updateBalance() {
    document.querySelector("#incomeDisplay").innerHTML = Utils.formatCurrency(
      Transactions.incomes()
    );

    document.querySelector("#expenseDisplay").innerHTML = Utils.formatCurrency(
      Transactions.expenses()
    );

    document.querySelector("#totalDisplay").innerHTML = Utils.formatCurrency(
      Transactions.total()
    );
  },

  clearTransactions() {
    DOM.transactionContainer.innerHTML = "";
  },
};

const Utils = {
  formatAmount(value) {
    return Number(value) * 100;
  },

  formatDate(date) {
    const splittedDate = date.split("-");
    return splittedDate.reverse().join("/");
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validadeFields() {
    const { description, amount, date } = Form.getValues();

    if (description.trim() === "" || amount.trim() === "" || date.trim() === "")
      throw new Error("Por favor, preencha todos os campos");
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return { description, amount, date };
  },

  saveTransaction(transaction) {
    Transactions.add(transaction);
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault();

    try {
      Form.validadeFields();
      const transaction = Form.formatValues();
      Form.saveTransaction(transaction);
      Form.clearFields();

      Modal.close();
    } catch (err) {
      alert(err.message);
    }
  },
};

const App = {
  init() {
    Transactions.all.forEach((transaction) => {
      DOM.addTransaction(transaction);
    });

    DOM.updateBalance();
  },

  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();
