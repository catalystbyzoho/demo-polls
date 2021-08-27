function ZCQL (app, query) {
  const zcql = app.zcql()
  const zcqlPromise = zcql.executeZCQLQuery(query)
  return new Promise((resolve, reject) => {
    zcqlPromise
      .then((response) => {
        resolve(response)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

function deleteRow (app, tableName, ROWID) {
  const datastore = app.datastore()
  const table = datastore.table(tableName)
  const rowPromise = table.deleteRow(ROWID)
  return new Promise((resolve, reject) => {
    rowPromise
      .then((response) => {
        resolve(response)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

function deleteFile (app, folderId, fileId) {
  const filestore = app.filestore()
  const folder = filestore.folder(folderId)
  const deletePromise = folder.deleteFile(fileId)
  return new Promise((resolve, reject) => {
    deletePromise
      .then((response) => {
        resolve(response)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

function insertRow (app, tableName, insertData) {
  const datastore = app.datastore()
  const table = datastore.table(tableName)
  const insertPromise = table.insertRow(insertData)
  return new Promise((resolve, reject) => {
    insertPromise
      .then((response) => {
        resolve(response)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
function insertRows (app, tableName, insertData) {
  const datastore = app.datastore()
  const table = datastore.table(tableName)
  const insertPromise = table.insertRows(insertData)
  return new Promise((resolve, reject) => {
    insertPromise
      .then((response) => {
        resolve(response)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
function getRow (app, tableName, ROWID) {
  const datastore = app.datastore()
  const table = datastore.table(tableName)
  const rowPromise = table.getRow(ROWID)
  return new Promise((resolve, reject) => {
    rowPromise
      .then((response) => {
        resolve(response)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

function updateRow (app, tableName, updateData) {
  const datastore = app.datastore()
  const table = datastore.table(tableName)
  const rowPromise = table.updateRow(updateData)
  return new Promise((resolve, reject) => {
    rowPromise
      .then((response) => {
        resolve(response)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

// eslint-disable-next-line camelcase
function downloadFile (app, folderId, file_id) {
  const filestore = app.filestore()
  const folder = filestore.folder(folderId)
  const downloadPromise = folder.downloadFile(file_id)
  return new Promise((resolve, reject) => {
    downloadPromise
      .then((response) => {
        resolve(response)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

module.exports = {
  ZCQL,
  deleteRow,
  deleteFile,
  updateRow,
  insertRow,
  insertRows,
  getRow,
  downloadFile
}
