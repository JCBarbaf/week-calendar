const dateInput = document.querySelector('.date-input')
const datePs = document.querySelectorAll('.day-date')
const addButtons = document.querySelectorAll('.add-button')
const today = new Date()
today.setUTCHours(0, 0, 0, 0)
dateInput.value = today.toISOString().split('T')[0]
SetDates(today)

document.querySelector('.app-header').addEventListener('click', (event) => {
  const arrowButton = event.target.closest('.arrow-button')
  
  if (arrowButton) {
    let currentDate = new Date(dateInput.value + 'T00:00:00Z')

    if (arrowButton.dataset.action === 'prior') {
      currentDate.setUTCDate(currentDate.getUTCDate() - 7)
    } else if (arrowButton.dataset.action === 'next') {
      currentDate.setUTCDate(currentDate.getUTCDate() + 7)
    }

    dateInput.value = currentDate.toISOString().split('T')[0]
    SetDates(dateInput.value)
  }
})

dateInput.addEventListener('change', (event) => {
  SetDates(dateInput.value)
})

function SetDates(date) {
  const week = GetWeek(date)
  
  for (let i = 0; i < datePs.length; i++) {
    const formattedDate = week[i].getFullYear() + '-' +
                          (week[i].getMonth() + 1).toString().padStart(2, '0') + '-' +
                          week[i].getDate().toString().padStart(2, '0')
    datePs[i].innerHTML = week[i].getDate().toString().padStart(2, '0') + '/' +
                          (week[i].getMonth() + 1).toString().padStart(2, '0') + '/' +
                          week[i].getFullYear()
    addButtons[i].dataset.date = formattedDate
  }
}

function GetWeek(day) {
  const week = []
  const dayCopy = new Date(day)

  const dayOfWeek = dayCopy.getDay() 
  const monday = new Date(dayCopy.setDate(dayCopy.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))) 

  for (let i = 0; i < 5; i++) {
    const currentDay = new Date(monday)
    currentDay.setDate(monday.getDate() + i)
    week.push(currentDay)
  }
  return week
}