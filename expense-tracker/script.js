class Expense {
	constructor(name, amount) {
		this.name = name;
		this.amount = amount;
		this.timeStamp = new Date().toLocaleTimeString();
	}
}

function zeroRemove(input) {
	let value = input.value;

	if(value.startsWith('0') && value.length > 1) {
		value = value.replace(/^0+/, '');
	}
	input.value = value;
}

const menuPop = document.querySelector(".menu-pop"); //menu
const setTotalPop = document.querySelector(".set-total-amount"); //add total
const mainApp = document.querySelector(".budget-track"); //main spent interface

// settings
const menu = document.querySelector("#menu");
let isMenuOpen = false;
function openMenu() {
	if (isMenuOpen) {
		menuPop.style.display = "none";
		mainApp.style.display = "block"
		isMenuOpen = false;
	} else {
		menuPop.style.display = "flex";
		mainApp.style.display = "none"
		isMenuOpen = true;
	}
}

/* Budget Tracker*/
let totalAmount, currentAmount;

const currentAmountText = document.querySelector(".current-amount");
const totalAmountText = document.querySelector(".start-amount");

const editTotal = document.querySelector(".edit-start");
const addAmoutn = document.querySelector(".add");

const addSpentName = document.querySelector(".add-spent-name");
const addInput = document.querySelector(".add-spent-amount");

const setTotalInput = document.querySelector("#set-total");
const setTotalBtn = document.querySelector(".set-budget");

let isSetTotalOpen = false;
function openSetTotalPop() {
	if (isSetTotalOpen) {
		if(totalAmount <= 0) {
			return;
		}
		setTotalPop.style.display = "none";
		mainApp.style.display = "block"
		isSetTotalOpen = false;
	} else {
		setTotalPop.style.display = "flex";
		if(totalAmount > 0)
			setTotalInput.value = totalAmount;
		mainApp.style.display = "none"
		isSetTotalOpen = true;
	}
}
if (localStorage.getItem('totalAmount') && Number(localStorage.getItem('totalAmount')) > 0) {
	totalAmount = localStorage.getItem('totalAmount');
	totalAmountText.innerText = totalAmount;
	setTotalInput.value = totalAmount;
} else {
	setTotalAmount();
}
if (localStorage.getItem('currentAmount')) {
	currentAmount = localStorage.getItem('currentAmount');
	currentAmountText.innerText = currentAmount;
} else {
	currentAmount = totalAmount;
	currentAmountText.innerText = currentAmount;
}

let day = new Date();
let today = day.toLocaleDateString();
let todaySpent = [];

function renderProgress() {
	const progress = document.querySelector(".progress");
	let per = (currentAmount / totalAmount) * 180;

	progress.style.background = `conic-gradient(var(--color) 0deg, var(--color2) ${per}deg, hsl(from var(--black) h s calc(l + 25)) ${per}deg)`;
}
renderProgress();

function addSpentAmount() {
	let name = addSpentName.value;
	let number = addInput.value;
	if (isNaN(parseFloat(number)) || number === 0) {
		errorMessage("Enter a valid value!");
	} else if(name === null || name.length === 0) {
		errorMessage("Enter name of expense!");
	} else if (Number(number) > currentAmount) {
		errorMessage("Insuffient amount!")
	} else {
		currentAmount = Number(currentAmount) - Number(number);
		localStorage.setItem('currentAmount', currentAmount);
		currentAmountText.innerText = currentAmount;
		addSpentName.value = '';
		addInput.value = '';

		todaySpent.push(new Expense(name, number));
		localStorage.setItem(today, JSON.stringify(todaySpent));

		loadExpensesForDate(day);
		renderProgress();
	}
}

let currentViewingDate = new Date();
let viewingExpense = [];

function loadExpensesForDate(date) {
    let dateKey = date.toLocaleDateString();
    const saved = localStorage.getItem(dateKey);
    
    viewingExpense = saved ? JSON.parse(saved) : [];

	renderExpenses();
}

function renderExpenses() {
	let view = document.querySelector(".expense-view");
	let dateView = document.querySelector(".current-expense-date");
	view.innerHTML = '';
	dateView.innerText = currentViewingDate.toLocaleDateString();

	if(viewingExpense.length === 0) {
		view.innerHTML = `
			<tr>
				<td colspan="4">No expenses recorded for this date.</td>
			</tr>
		`;
	}

	for(let i = 0; i < viewingExpense.length; i++) {
		let item = viewingExpense[i];
		view.innerHTML += `
			<tr>
				<td>${i+1}</td>
				<td>${item.name}</td>
				<td>${item.amount}</td>
				<td>${item.timeStamp}</td>
			</tr>
		`
	}
}
loadExpensesForDate(currentViewingDate);

function prevDate() {
	let monthStart = localStorage.getItem('firstDay') || 1;
	if(currentViewingDate.getDate() === Number(monthStart)) {
		errorMessage("You are already viewing the start of budget cycle!");
		return;
	}
	currentViewingDate.setDate(currentViewingDate.getDate() - 1);
	loadExpensesForDate(currentViewingDate);
}
function nextDate() {
	if(currentViewingDate.toLocaleDateString() === today) {
		errorMessage("You are already viewing today's expenses!");
		return;
	}
	currentViewingDate.setDate(currentViewingDate.getDate() + 1);
	loadExpensesForDate(currentViewingDate);
}

function setTotalAmount() {
	if (isMenuOpen) {
		openMenu();
	}
	openSetTotalPop();
}
//total amount set
function addMonthlyTotal() {
	let number = setTotalInput.value;
	if (!number || isNaN(parseFloat(number)) || number <= 0) {
		errorMessage("Invalid Number! Please enter a valid number");
	} else {
		totalAmount = number;
		currentAmount = totalAmount;
		currentAmountText.innerText = currentAmount;
		totalAmountText.innerText = totalAmount;
		localStorage.setItem('totalAmount', totalAmount);
		localStorage.setItem('currentAmount', currentAmount);
		message("Total Budget Amount set Successfully");

		renderProgress();
		openSetTotalPop();
	}
}

function resetBudget() {
	localStorage.clear();

	localStorage.setItem('currentAmount', 0);
	localStorage.setItem('totalAmount', 0);

	currentAmount = 0, totalAmount = 0;
	currentAmountText.innerText = currentAmount;
	totalAmountText.innerText = totalAmount;

	openMenu();
	openSetTotalPop();
}

function errorMessage(message) {
	const errorBlock = document.querySelector(".errorBlock");
	const errorP = document.querySelector(".errorP");
	errorBlock.style.display = "none";
	errorBlock.style.display = "block";
	errorP.innerText = message;
	setTimeout(() => {
		errorBlock.style.display = "none";
	}, 2000);
}
function message(message) {
	const messageBlock = document.querySelector(".messageBlock");
	const messageP = document.querySelector(".messageP");
	messageBlock.style.display = "none";
	messageBlock.style.display = "block";
	messageP.innerText = message;
	setTimeout(() => {
		messageBlock.style.display = "none";
	}, 2000);
}

// colors
const defaultColor1 = '#209fdf';
const defaultColor2 = '#9f20df';

const color1 = document.querySelector("#color-1");
const color2 = document.querySelector("#color-2");
const firstDay = document.querySelector("#first-day");
const saveMenu = document.querySelector(".save");

// to set color value to css variable and to input
const savedColor1 = localStorage.getItem('color');
const savedColor2 = localStorage.getItem('color2');
const savedFirstDay = localStorage.getItem('firstDay');
if (savedColor1) {
	document.documentElement.style.setProperty('--color', savedColor1);
	textColor();
	color1.value = savedColor1;
} else {
	localStorage.setItem('color', defaultColor1);
}

if (savedColor2) {
	document.documentElement.style.setProperty('--color2', savedColor2);
	color2.value = savedColor2;
} else {
	localStorage.setItem('color2', defaultColor2);
}

if (savedFirstDay) {
	firstDay.value = savedFirstDay;
} else {
	localStorage.setItem('firstDay', 1);
}

//save the colors and first day
saveMenu.addEventListener('click', function () {
	const selectedColor1 = color1.value;
	const selectedColor2 = color2.value;
	const selectedFirstDay = firstDay.value || 1;

	document.documentElement.style.setProperty('--color', selectedColor1);
	document.documentElement.style.setProperty('--color2', selectedColor2);

	localStorage.setItem('color', selectedColor1);
	localStorage.setItem('color2', selectedColor2);
	localStorage.setItem('firstDay', selectedFirstDay);

	textColor();
	openMenu();
});

function restoreDefault() {
	localStorage.setItem('color', defaultColor1);
	localStorage.setItem('color2', defaultColor2);
	localStorage.setItem('firstDay', 1);

	document.documentElement.style.setProperty('--color', defaultColor1);
	document.documentElement.style.setProperty('--color2', defaultColor2);

	color1.value = defaultColor1;
	color2.value = defaultColor2;
	firstDay.value = 1;
	textColor();
}
function getLightness(color) {
	color = color.replace("#", "");

	if (color.length === 3) {
		color = color.split("").map(c => c + c).join("");
	}
	const r = parseInt(color.substring(0, 2), 16) / 255;
	const g = parseInt(color.substring(2, 4), 16) / 255;
	const b = parseInt(color.substring(4, 6), 16) / 255;

	const min = Math.min(r, g, b);
	const max = Math.max(r, g, b);

	const lightness = (max + min) / 2;
	return lightness * 100;
}
function textColor() {
	if (getLightness(localStorage.getItem('color')) <= 50) {
		document.documentElement.style.setProperty('--text', "#FFFFFF");
	} else {
		document.documentElement.style.setProperty('--text', "#000000");
	}

	if (getLightness(localStorage.getItem('color2')) <= 50) {
		menu.style.backgroundColor = "#ffffffaa";
	} else {
		menu.style.backgroundColor = "#121212aa";
	}
}