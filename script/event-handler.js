document.querySelector('.submit-event').addEventListener('click', (event) => {
  event.preventDefault()
  const eventData = new FormData(event.target.closest('form'))
  for (const [key, value] of eventData.entries()) {
    console.log(`${key}: ${value}`)
  }
})