const balanceEl = document.getElementById("balance");
const form = document.getElementById("transaction-form");
const descInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const transactionList = document.getElementById("transactions");
const chartCanvas = document.getElementById("expenseChart");
const regularList = document.getElementById("regular-transactions"); // optional

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let regularTransactions =
  JSON.parse(localStorage.getItem("regularTransactions")) || [];

function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem(
    "regularTransactions",
    JSON.stringify(regularTransactions)
  );
}

function checkLowBalance(balance) {
    balanceEl.style.color = balance < 100 ? 'red' : 'black';
  if (balance < 100) {
    alert("⚠️ Warning: Your balance is below ₹100!");
  }
}


function addTransaction(e) {
  e.preventDefault();

  const desc = descInput.value;
  let amount = +amountInput.value;
  const category = categoryInput.value;

  if (!desc || !amount) return;

  if (category === "income") {
    // Leave amount as positive
  } else {
    amount = -Math.abs(amount); // convert to negative
  }

  if (category === "regular") {
    regularTransactions.push({ desc, amount, category });
  } else {
    transactions.push({ desc, amount, category });
  }

  updateLocalStorage();
  renderTransactions();
  renderChart();
  form.reset();
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  updateLocalStorage();
  renderTransactions();
  renderChart();
}

function deleteRegularTransaction(index) {
  regularTransactions.splice(index, 1);
  updateLocalStorage();
  renderTransactions();
  renderChart();
}

function renderTransactions() {
  transactionList.innerHTML = '';
  regularList.innerHTML = '';

  let balance = 0;

  // Render main transactions
  transactions.forEach((t, index) => {
    const li = document.createElement('li');
    li.innerHTML = `${t.desc} - ₹${Math.abs(t.amount)} (${t.category})
      <button onclick="deleteTransaction(${index})">❌</button>`;
    li.style.borderLeftColor = t.amount > 0 ? 'green' : 'red';
    transactionList.appendChild(li);

    balance += t.amount;
  });

  // Render regular transactions and subtract from balance
  regularTransactions.forEach((t, index) => {
    const li = document.createElement('li');
    li.innerHTML = `${t.desc} - ₹${Math.abs(t.amount)} (Regular)
      <button onclick="deleteRegularTransaction(${index})">❌</button>`;
    li.style.borderLeftColor = '#607d8b';
    regularList.appendChild(li);

    // Deduct from balance
    balance += t.amount; // regular is already negative
  });

  balanceEl.innerText = `Balance: ₹${balance}`;
  checkLowBalance(balance);
}

function renderChart() {
  const expenseCategories = {};

  transactions.forEach((t) => {
    if (t.amount < 0 && t.category !== "regular") {
      expenseCategories[t.category] =
        (expenseCategories[t.category] || 0) + Math.abs(t.amount);
    }
  });

  const data = {
    labels: Object.keys(expenseCategories),
    datasets: [
      {
        label: "Expenses",
        data: Object.values(expenseCategories),
        backgroundColor: [
          "#f44336",
          "#ff9800",
          "#2196f3",
          "#9c27b0",
          "#009688",
        ],
      },
    ],
  };

  if (window.myChart) {
    window.myChart.destroy();
  }

  window.myChart = new Chart(chartCanvas, {
    type: "pie",
    data,
  });
}

form.addEventListener("submit", addTransaction);
renderTransactions();
renderChart();
