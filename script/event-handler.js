import { SetDates } from "./week-handler.js"

const eventForm = document.querySelector('.event-form')
eventForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  const eventData = new FormData(eventForm)
  let data = {}
  for (const [key, value] of eventData.entries()) {
    data[key] = value
  }
  let db = await openDatabase('EventDB')
  data.id = parseInt(data.id)
  if (data.id && data.id != '') {
    await editData(db, data.id, data)
  } else {
    delete data.id
    await writeData(db, data)
  }
  SetDates(document.querySelector('.date-input').value)
  document.querySelector('.modal-background.events').classList.remove('active')
  eventForm.reset()
})

export function openDatabase(dbName, version = 1) {
  return new Promise((resolve, reject) => {
    let request = indexedDB.open(dbName, version)

    request.onerror = (event) => {
        console.error("Error opening IndexedDB", event)
        reject(event)
    }

    request.onsuccess = (event) => {
        // console.log("Database opened successfully")
        resolve(event.target.result)
    }

    request.onupgradeneeded = (event) => {
      // console.log("Database upgrade needed")
      let db = event.target.result
      
      if (!db.objectStoreNames.contains('storeName')) {
          let store = db.createObjectStore('storeName', { keyPath: 'id', autoIncrement: true })
          store.createIndex('eventDateIndex', 'eventDate', { unique: false })
      } else {
          let store = event.target.transaction.objectStore('storeName')
          if (!store.indexNames.contains('eventDateIndex')) {
              store.createIndex('eventDateIndex', 'eventDate', { unique: false })
          }
      }
    }
  })
}

export function writeData(db, data) {
  return new Promise((resolve, reject) => {
      let transaction = db.transaction(['storeName'], 'readwrite')
      let store = transaction.objectStore('storeName')
      let request = store.add(data)

      request.onsuccess = (event) => {
          // console.log("Data written successfully", event)
          resolve(event.target.result)
      }

      request.onerror = (event) => {
          console.error("Error writing data", event)
          reject(event)
      }
  })
}

export function editData(db, id, updatedData) {
  return new Promise((resolve, reject) => {
      let transaction = db.transaction(['storeName'], 'readwrite')
      let store = transaction.objectStore('storeName')
      let request = store.get(id)

      request.onsuccess = (event) => {
          let data = event.target.result
          if (data) {
              Object.assign(data, updatedData)
              let updateRequest = store.put(data)
              updateRequest.onsuccess = () => {
                  resolve(data)
              }
              updateRequest.onerror = (event) => {
                  console.error("Error updating data", event)
                  reject(event)
              }
          } else {
              reject("No entry found with id: " + id)
          }
      }

      request.onerror = (event) => {
          console.error("Error fetching data", event)
          reject(event)
      }
  })
}

export function getWeekData(db, startDate, endDate) {
  return new Promise((resolve, reject) => {
      let transaction = db.transaction(['storeName'], 'readonly')
      let store = transaction.objectStore('storeName')
      let index = store.index('eventDateIndex')

      let range = IDBKeyRange.bound(startDate, endDate, false, false)

      let request = index.openCursor(range)
      let results = []

      request.onsuccess = (event) => {
          let cursor = event.target.result
          if (cursor) {
              results.push(cursor.value)
              cursor.continue()
          } else {
              resolve(results)
          }
      }

      request.onerror = (event) => {
          console.error("Error fetching events", event)
          reject(event)
      }
  })
}

export function getEvent(db, id) {
  return new Promise((resolve, reject) => {
      let transaction = db.transaction(['storeName'], 'readonly')
      let store = transaction.objectStore('storeName')
      let request = store.get(id)

      request.onsuccess = (event) => {
          if (event.target.result) {
              resolve(event.target.result)
          } else {
              resolve(null)
          }
      }

      request.onerror = (event) => {
          console.error("Error fetching event by ID", event)
          reject(event)
      }
  })
}

export function deleteEvent(db, id) {
  return new Promise((resolve, reject) => {
    let transaction = db.transaction(['storeName'], 'readwrite')
    let store = transaction.objectStore('storeName')
    let request = store.delete(id)

    request.onsuccess = () => {
      resolve(true)
    }

    request.onerror = (event) => {
      console.error("Error deleting event", event)
      reject(event)
    }
  })
}