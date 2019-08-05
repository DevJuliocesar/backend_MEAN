var express = require('express');
var mdAuth = require('../middlewares/autentication');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

app.use(fileUpload('createParentPath', false));

// Models
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Object with models
var documents = {
  hospitales: Hospital,
  medicos: Medico,
  usuarios: Usuario
};

/****************************************************************************************
 * Default file upload ssettings
 */
var typeExt = ['jpg', 'jpeg', 'png', 'gif'];
var typeDocuments = ['usuarios', 'hospitales', 'medicos'];

app.put('/:document/:id', mdAuth.verificarToken, (req, res, next) => {
  var document = req.params.document;
  var usuarioID = req.params.id;

  if (typeDocuments.indexOf(document) < 0) {
    return res.status(400).json({
      ok: false,
      message: `El modulo ${document} no existe en la colección de la base de datos`
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      message: 'Archivo no ha sido seleccionado'
    });
  }

  // Get the file extension
  var fileUpload = req.files.imagen;
  var fileExt = fileUpload.name.split('.').pop();

  // Validate the file extension
  if (typeExt.indexOf(fileExt.toLowerCase()) < 0) {
    return res.status(400).json({
      ok: false,
      message: 'Archivo no valido',
      error: {
        message: `Las extensiones validas son ${typeExt.join(', ')}`
      }
    });
  }

  // Set new name to the file
  var newFileName = `${usuarioID}-${new Date().getMilliseconds()}.${fileExt}`;

  // Save file in the new folder
  var usuarioPath = `./uploads/${document}`;
  var savePath = `./uploads/${document}/${newFileName}`;

  // Create usuario folder if this doesn't exist
  if (!fs.existsSync(usuarioPath)) fs.mkdirSync(usuarioPath);

  // Load usuarios files
  var uploadInfo = {
    usuarioID: usuarioID,
    document: document,
    usuarioPath: usuarioPath,
    newFileName: newFileName
  };

  setDateInDocuments(uploadInfo)
    .then(data => {
      fileUpload.mv(savePath, err => {
        if (err) {
          return res.status(500).json({
            ok: false,
            message: `ups!!! The file ${fileUpload.name} could not be uploaded`,
            error: err
          });
        }

        res.status(200).json({
          ok: true,
          message: 'Upload file was successfull',
          ext: fileExt,
          fileUpload: fileUpload.name,
          newFileName: newFileName,
          path: savePath,
          document: document,
          usuario: data
        });
      });
    })
    .catch(err => {
      res.status(500).json({
        ok: false,
        message: `Error finding data in ${document} document`,
        errors: err
      });
    });
});

/*****************************************************************************************
 * @promese
 * Finding by id in the document to remove any existing files in the same route
 */
function setDateInDocuments(uploadInfo) {
  var id = uploadInfo.usuarioID;
  var document = uploadInfo.document;
  var usuarioPath = uploadInfo.usuarioPath;
  var newFileName = uploadInfo.newFileName;

  return new Promise((resolve, reject) => {
    documents[document].findById(id, (err, result) => {
      if (err) {
        reject({
          ok: false,
          message: `Usuario with id: ${id} does not exits`,
          errors: err
        });
      }

      // Validate if file exist in usuario folder
      if (result.img) {
        var oldFilePath = `${usuarioPath}/${result.img}`;
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }

      // Set the new image to the usuario
      result.img = newFileName;

      // Save the new update
      result.save((err, updateResult) => {
        if (err) {
          reject({
            ok: false,
            message: `Error updating data from usuario id: ${id}`,
            errors: err
          });
        }

        // Hidden the password encrypted
        updateResult.password = ':)';

        // Send the usuario's updated data
        resolve(updateResult);
      });
    });
  });
}

module.exports = app;
