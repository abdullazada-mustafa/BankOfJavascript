'use strict'

// Data
const account1 = {
  owner: 'Mustafa Abdullazada',
  movements: [
    [200, '2020-11-18T21:31:17.178Z'],
    [455.23, '2020-12-23T07:42:02.383Z'],
    [-306.5, '2021-01-28T09:15:04.904Z'],
    [25000, '2021-04-01T10:17:24.185Z'],
    [-642.21, '2021-05-08T14:11:59.604Z'],
    [-133.9, '2022-04-24T17:01:17.194Z'],
    [79.97, '2022-04-28T23:36:17.929Z'],
    [1300, '2022-04-29T10:51:36.790Z'],
  ],
  interestRate: 1.2,
  pin: 1111,
  currency: 'AZN',
  locale: 'az-AZ',
}

const account2 = {
  owner: 'Jessica Davis',
  movements: [
    [5000, '2020-11-01T13:15:33.035Z'],
    [3400, '2020-11-30T09:48:16.867Z'],
    [-150, '2020-12-25T06:04:23.907Z'],
    [-790, '2021-01-25T14:18:46.235Z'],
    [-3210, '2021-02-05T16:33:06.386Z'],
    [-1000, '2021-04-10T14:43:26.374Z'],
    [8500, '2021-06-25T18:49:59.371Z'],
    [-30, '2021-07-26T12:01:20.894Z'],
  ],
  interestRate: 1.5,
  pin: 2222,
  currency: 'USD',
  locale: 'en-US',
}

const accounts = [account1, account2]

// Elements
const labelWelcome = document.querySelector('.welcome')
const labelDate = document.querySelector('.date')
const labelBalance = document.querySelector('.balance__value')
const labelSumIn = document.querySelector('.summary__value--in')
const labelSumOut = document.querySelector('.summary__value--out')
const labelSumInterest = document.querySelector('.summary__value--interest')
const labelTimer = document.querySelector('.timer')

const containerApp = document.querySelector('.app')
const containerMovements = document.querySelector('.movements')

const btnLogin = document.querySelector('.login__btn')
const btnTransfer = document.querySelector('.form__btn--transfer')
const btnLoan = document.querySelector('.form__btn--loan')
const btnClose = document.querySelector('.form__btn--close')
const btnSort = document.querySelector('.btn--sort')

const inputLoginUsername = document.querySelector('.login__input--user')
const inputLoginPin = document.querySelector('.login__input--pin')
const inputTransferTo = document.querySelector('.form__input--to')
const inputTransferAmount = document.querySelector('.form__input--amount')
const inputLoanAmount = document.querySelector('.form__input--loan-amount')
const inputCloseUsername = document.querySelector('.form__input--user')
const inputClosePin = document.querySelector('.form__input--pin')

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24))

  const daysPassed = calcDaysPassed(new Date(), date)
  if (daysPassed === 0) return 'Today'
  if (daysPassed === 1) return 'Yesterday'
  if (daysPassed <= 7) return `${daysPassed} days ago`
  else {
    return new Intl.DateTimeFormat(locale).format(date)
  }
}

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value)
}

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = ''

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a[0] - b[0])
    : acc.movements

  movs.forEach(function (mov, i) {
    const type = mov[0] > 0 ? 'deposit' : 'withdrawal'
    const date = new Date(mov[1])
    const displayDate = formatMovementDate(date, acc.locale)

    const formattedMov = formatCur(mov[0], acc.locale, acc.currency)

    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formattedMov}</div>
  </div>`
    containerMovements.insertAdjacentHTML('afterbegin', html)
  })
}

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov[0], 0)
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency)
}

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov[0] > 0)
    .reduce((acc, mov) => acc + mov[0], 0)
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency)
  const out = acc.movements
    .filter(mov => mov[0] < 0)
    .reduce((acc, mov) => acc + mov[0], 0)
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency)

  const interest = acc.movements
    .filter(mov => mov[0] > 0)
    .map(deposit => (deposit[0] * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0)
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency)
}
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('')
  })
}
createUsernames(accounts)

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc)

  // Display balance
  calcDisplayBalance(acc)

  // Display summary
  calcDisplaySummary(acc)
}

const startLogOutTimer = function () {
  // Set time to 5 minutes
  let time = 300
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0)
    const sec = String(Math.trunc(time % 60)).padStart(2, 0)

    // In each call, print the remaining time to the UI
    labelTimer.textContent = `${min}:${sec}`

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer)
      labelWelcome.textContent = 'Login to get started'
      containerApp.style.opacity = 0
    }

    // Decrease 1s
    time--
  }
  // Call the time every second
  tick()
  const timer = setInterval(tick, 1000)
  return timer
}

// Event Handlers
let currentAccount, timer

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault()

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  )
  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`
    containerApp.style.opacity = 1

    // Create current date and time
    const now = new Date()
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now)

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = ''

    // Timer
    if (timer) clearInterval(timer)
    timer = startLogOutTimer()

    // Update UI
    updateUI(currentAccount)
  }
})

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault()
  const amount = +inputTransferAmount.value
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  )
  inputTransferTo.value = inputTransferAmount.value = ''
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Transfer money and date
    currentAccount.movements.push([-amount, new Date().toISOString()])
    receiverAcc.movements.push([
      receiverAcc.username === 'ma' ? amount * 1.7 : amount / 1.7,
      new Date().toISOString(),
    ])

    // Update UI
    updateUI(currentAccount)

    // Reset timer
    clearInterval(timer)
    timer = startLogOutTimer()
  }
})

btnLoan.addEventListener('click', function (e) {
  e.preventDefault()

  const amount = Math.floor(inputLoanAmount.value)
  if (
    amount > 0 &&
    currentAccount.movements.some(mov => mov[0] >= amount * 0.1)
  ) {
    setTimeout(function () {
      // Add movement and date
      currentAccount.movements.push([amount, new Date().toISOString()])

      // Update UI
      updateUI(currentAccount)
      clearInterval(timer)
      timer = startLogOutTimer()
    }, 2500)
  }
  inputLoanAmount.value = ''
})

btnClose.addEventListener('click', function (e) {
  e.preventDefault()
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    )
    accounts.splice(index, 1)
    labelWelcome.textContent = 'Log in to get started'
    containerApp.style.opacity = 0
  }
  inputCloseUsername.value = inputClosePin.value = ''
})

let sorted = false
btnSort.addEventListener('click', function (e) {
  e.preventDefault()
  displayMovements(currentAccount, !sorted)
  sorted = !sorted
})
