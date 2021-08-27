function uploadImage(FOLDER_ID, fileObject) {
  var filestore = catalyst.file;
  var folder = filestore.folderId(FOLDER_ID);
  var uploadPromise = folder.uploadFile(fileObject).start();

  return new Promise((resolve, reject) => {
    uploadPromise
      .then((response) => {
        resolve(response.content);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

function generateImageURL(folder_id, file_id) {
  var filestore = catalyst.file;
  var folder = filestore.folderId(folder_id);
  var file = folder.fileId(file_id);
  var downloadPromise = file.getDownloadLink();
  return new Promise((resolve, reject) => {
    downloadPromise
      .then((response) => {
        resolve(response.content);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

function getCurrentUserData() {
  var userManagement = catalyst.userManagement;
  var currentUserPromise = userManagement.getCurrentProjectUser();
  return new Promise((resolve, reject) => {
    currentUserPromise
      .then((response) => {
        resolve(response.content);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}
