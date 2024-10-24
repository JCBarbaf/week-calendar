import { deleteEvent, openDatabase } from "./event-handler.js"
import { SetDates } from "./week-handler.js"

const modals = document.querySelectorAll('.modal-background')
const eventsModal = document.querySelector('.modal-background.events')
const form = document.querySelector('.event-form')

document.querySelector('.calendar').addEventListener('click', (event) => {
  if (event.target.closest('.add-button')) {
    document.querySelector('[name="eventDate"]').value = event.target.closest('.add-button').dataset.date
    eventsModal.classList.add('active')
  }
})

modals.forEach(modal => {
  modal.addEventListener('click', async (event) => {
    if (event.target.closest('.close-button') || event.target.closest('.cancel-delete') || !event.target.closest('.modal')) {
      form.reset()
      modal.classList.remove('active')
    } else if (event.target.closest('.confirm-delete')) {
      let db = await openDatabase('EventDB')
      deleteEvent(db, parseInt(event.target.closest('.confirm-delete').dataset.eventId))
      event.target.closest('.confirm-delete').dataset.eventId = null
      SetDates(document.querySelector('.date-input').value)
      event.target.closest('.modal-background').classList.remove('active')
    }
  })
})