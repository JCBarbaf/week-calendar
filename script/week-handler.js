import { openDatabase, getWeekData, getEvent } from "./event-handler.js"

const calendar = document.querySelector('.calendar')
const dateInput = document.querySelector('.date-input')
const datePs = document.querySelectorAll('.day-date')
const dayContainers = document.querySelectorAll('.day-content-container')
const addButtons = document.querySelectorAll('.add-button')
const eventsModal = document.querySelector('.modal-background.events')
const deleteModal = document.querySelector('.modal-background.delete')
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

calendar.addEventListener('click', async (event) => {
  if (event.target.closest('.edit-button')) {
    let db = await openDatabase('EventDB')
    const eventData = await getEvent(db, parseInt(event.target.closest('.edit-button').dataset.eventId))
    for (const [key, value] of Object.entries(eventData)) {
      document.querySelector(`[name="${key}"]`).value = value
    }
    eventsModal.classList.add('active')
  } else if (event.target.closest('.delete-button')) {
    document.querySelector('.confirm-delete').dataset.eventId = event.target.closest('.delete-button').dataset.eventId
    deleteModal.classList.add('active')
  }
})

calendar.addEventListener('dblclick', async (event) => {
  if (event.target.closest('.day-content')) {
    let db = await openDatabase('EventDB')
    const eventData = await getEvent(db, parseInt(event.target.closest('.day-content').dataset.eventId))
    for (const [key, value] of Object.entries(eventData)) {
      document.querySelector(`[name="${key}"]`).value = value
    }
  } else if (event.target.closest('.day')) {
    document.querySelector('[name="eventDate"]').value = event.target.closest('.day-content-container').dataset.date
  }
  eventsModal.classList.add('active')
})

dateInput.addEventListener('change', (event) => {
  SetDates(dateInput.value)
})

export async function SetDates(date) {
  const week = GetWeek(date)
  
  for (let i = 0; i < datePs.length; i++) {
    const formattedDate = week[i].getFullYear() + '-' +
                          (week[i].getMonth() + 1).toString().padStart(2, '0') + '-' +
                          week[i].getDate().toString().padStart(2, '0')
    datePs[i].innerHTML = week[i].getDate().toString().padStart(2, '0') + '/' +
                          (week[i].getMonth() + 1).toString().padStart(2, '0') + '/' +
                          week[i].getFullYear()
    addButtons[i].dataset.date = formattedDate
    dayContainers[i].dataset.date = formattedDate
  }
  let db = await openDatabase('EventDB')
  const monday = week[0].getFullYear() + '-' +
                (week[0].getMonth() + 1).toString().padStart(2, '0') + '-' +
                week[0].getDate().toString().padStart(2, '0')
  const friday = week[4].getFullYear() + '-' +
                (week[4].getMonth() + 1).toString().padStart(2, '0') + '-' +
                week[4].getDate().toString().padStart(2, '0')
  let events = await getWeekData(db, monday, friday)
  dayContainers.forEach(container => {
    container.innerHTML = ''
  })
  events = events.sort((a, b) => {
    if (a.eventTime < b.eventTime) return -1
    if (a.eventTime > b.eventTime) return 1
    return 0
  })
  events.forEach(event => {
    const container = document.querySelector(`.day-content-container[data-date="${event.eventDate}"]`)
    const dayContent = document.createElement('div')
    dayContent.classList.add('day-content')
    dayContent.classList.add(event.eventSubject)
    dayContent.dataset.eventId = event.id
    const contentHeader = document.createElement('header')
    contentHeader.classList.add('content-header')
    const subject = document.createElement('p')
    subject.classList.add('subject')
    subject.innerHTML = event.eventSubject
    const time = document.createElement('p')
    time.classList.add('time')
    time.innerHTML = event.eventTime
    const contentMain = document.createElement('div')
    contentMain.classList.add('content-main')
    const eventName = document.createElement('p')
    eventName.innerHTML = event.eventName
    const contentFooter = document.createElement('footer')
    contentFooter.classList.add('content-footer')
    const editButton = document.createElement('button')
    editButton.classList.add('edit-button')
    editButton.innerHTML = '<svg class="icon" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M338.523 90.7665L90.9009 338.388C90.9009 338.388 51.591 440.5 55.5455 444.454C59.5 448.409 161.612 409.099 161.612 409.099L409.233 161.477L338.523 90.7665Z" fill="black"/><path d="M423.376 147.335L352.665 76.6243L394.957 34.3324C402.767 26.522 415.431 26.5219 423.241 34.3324L465.667 76.7588C473.478 84.5693 473.478 97.2326 465.667 105.043L423.376 147.335Z" fill="black"/></svg>'
    editButton.dataset.eventId = event.id
    const deleteButton = document.createElement('button')
    deleteButton.classList.add('delete-button')
    deleteButton.innerHTML = '<svg class="icon" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M74.9753 139.327C74.152 132.315 79.6198 126.154 86.6661 126.154H413.334C420.38 126.154 425.848 132.315 425.025 139.327L386.248 469.583C385.551 475.523 380.527 480 374.557 480H125.443C119.473 480 114.449 475.523 113.752 469.583L74.9753 139.327Z" fill="black"/><path d="M198.418 20C193.959 20 189.883 22.5241 187.889 26.5201L179.371 43.5897H55.7714C49.2702 43.5897 44 48.8705 44 55.3846V102.564H456V55.3846C456 48.8705 450.73 43.5897 444.229 43.5897H320.629L312.111 26.52C310.117 22.5241 306.041 20 301.582 20H198.418Z" fill="black"/></svg>'
    deleteButton.dataset.eventId = event.id

    contentHeader.appendChild(subject)
    contentHeader.appendChild(time)
    dayContent.appendChild(contentHeader)
    contentMain.appendChild(eventName)
    dayContent.appendChild(contentMain)
    contentFooter.appendChild(editButton)
    contentFooter.appendChild(deleteButton)
    dayContent.appendChild(contentFooter)
    container.appendChild(dayContent)
  })
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