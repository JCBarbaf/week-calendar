const modal = document.querySelector('.modal-background')

document.querySelector('.calendar').addEventListener('click', (event) => {
  if (event.target.closest('.add-button')) {
    document.querySelector('[name="eventDate"]').value = event.target.closest('.add-button').dataset.date
    modal.classList.add('active')
  }
})

modal.addEventListener('click', (event) => {
  if (event.target.closest('.close-button') || !event.target.closest('.modal')) {
    modal.classList.remove('active')
  }
})