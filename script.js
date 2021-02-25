const Modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },
  set(transactions) {
    localStorage.setItem(
      "dev.finances:transactions",
      JSON.stringify(transactions)
    );
  },
};

const Transaction = {
  all: Storage.get(),
  add(transaction) {
    this.all.push(transaction);
    App.reload();
  },
  remove(index) {
    this.all.splice(index, 1);
    App.reload();
  },
  incomes() {
    let income = 0;

    this.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });

    return income;
  },
  expenses() {
    let expense = 0;

    this.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });

    return expense;
  },
  total() {
    const total = this.incomes() + this.expenses();
    return total;
  },
};

const DOM = {
  transactionContainer: document.querySelector("#data-table tbody"),
  searchBox: document.querySelector("#search").value,
  trs: [],

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.style.display = transaction.display == "none" ? "none" : "table-row";
    tr.dataset.index = index;

    DOM.trs.push(tr);
    DOM.transactionContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
      <td class="description">${Utils.captalize(transaction.description)}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" /></td>
    `;

    return html;
  },

  updateBalance() {
    document.querySelector("#incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );

    document.querySelector("#expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );

    document.querySelector("#totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTransactions() {
    this.transactionContainer.innerHTML = "";
    this.trs = [];
  },

  searchTransaction(event) {
    const inputValue = event.target.value;

    this.trs.forEach((tr, index) => {
      if (tr.textContent.includes(inputValue)) {
        Transaction.all[index].display = "";
      } else {
        Transaction.all[index].display = "none";
      }
    });

    App.reload();
  },
};

const Utils = {
  formatAmount(value) {
    return Math.round(Number(value) * 100);
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

  captalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: this.description.value,
      amount: this.amount.value,
      date: this.date.value,
    };
  },

  validadeFields() {
    const { description, amount, date } = this.getValues();

    if (description.trim() === "" || amount.trim() === "" || date.trim() === "")
      throw new Error("Por favor, preencha todos os campos");
  },

  formatValues() {
    let { description, amount, date } = this.getValues();

    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return { description, amount, date, display: "" };
  },

  saveTransaction(transaction) {
    Transaction.add(transaction);
  },

  clearFields() {
    this.description.value = "";
    this.amount.value = "";
    this.date.value = "";
  },

  submit(event) {
    event.preventDefault();

    try {
      this.validadeFields();
      const transaction = this.formatValues();
      this.saveTransaction(transaction);
      this.clearFields();

      Modal.close();
    } catch (err) {
      alert(err.message);
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);
    DOM.updateBalance();
    Storage.set(Transaction.all);
  },

  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();

document
  .querySelector("#search")
  .addEventListener("input", DOM.searchTransaction);
