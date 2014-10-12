var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var img = document.createElement('img');

// Image for loading
img.addEventListener('load', function() {
  clearCanvas();
  context.drawImage(img, 0, 0);
}, false);

// To enable drag and drop
canvas.addEventListener('dragover', function(evt) {
  evt.preventDefault();
}, false);

// Handle dropped image file - only Firefox and Google Chrome
canvas.addEventListener('drop', function(evt) {
  var files = evt.dataTransfer.files;
  if (files.length > 0) {
    var file = files[0];
    if (typeof FileReader !== 'undefined' && file.type.indexOf('image') != -1) {
      var reader = new FileReader();
      // Note: addEventListener doesn't work in Google Chrome for this event
      reader.onload = function (evt) {
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  evt.preventDefault();
}, false);

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function getCanvasImageData() {
  return context.getImageData(0, 0, canvas.width, canvas.height).data;
}

function getCanvasDataString() {
  var pix = getCanvasImageData();
  var bytes = []
  // Removes alpha to save space.
  for (var i=0; i<pix.length; i+=4) {
    bytes.push(String.fromCharCode(pix[i]));
    bytes.push(String.fromCharCode(pix[i+1]));
    bytes.push(String.fromCharCode(pix[i+2]));
  }
  return bytes.join('');
}

function setCanvasDataFromString(s) {
  // Build array
  var img = context.createImageData(canvas.width, canvas.height);
  for (var i=0,j=0; j < s.length; j=j+3) {
    img.data[i] = s[j].charCodeAt();
    img.data[i+1] = s[j+1].charCodeAt();
    img.data[i+2] = s[j+2].charCodeAt();
    img.data[i+3] = 255;
    i+=4;
  }

  // Set it
  context.putImageData(img, 0, 0);
}

var btnEncrypt = document.getElementById('btnEncrypt');
var btnDecrypt = document.getElementById('btnDecrypt');
var btnSave = document.getElementById('btnSave');
var btnLoad = document.getElementById('btnLoad');
var btnClear = document.getElementById('btnClear');

btnEncrypt.onclick = function() {
  var passcode = prompt('What is your password?  Make it good.');
  var data = getCanvasDataString();
  var encryptedString = sjcl.encrypt(passcode, data);

  document.getElementById('inout').value = encryptedString;
  clearCanvas();
};

btnDecrypt.onclick = function() {
  var passcode = prompt('Decrypt with password...');
  var data = document.getElementById('inout').value;
  var decryptedString = sjcl.decrypt(passcode, data);

  setCanvasDataFromString(decryptedString);
  document.getElementById('inout').value = '';
};

btnSave.onclick = function() {
  var passcode = prompt('What is your password?  Make it good.');
  var data = getCanvasDataString();
  var encryptedString = sjcl.encrypt(passcode, data);

  saveAs(new Blob([encryptedString], {type: 'text/plain;charset=utf-8'}),
         'encrypted.dat');
};

btnLoad.onclick = function() {

};

btnClear.onclick = function() {
  clearCanvas();
};

function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.dataTransfer.files; // FileList object.

  // files is a FileList of File objects. List some properties.
  var output = [];
  for (var i = 0, f; f = files[i]; i++) {
    output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                f.size, ' bytes, last modified: ',
                f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                '</li>');
  }
  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// Setup the dnd listeners.
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);
