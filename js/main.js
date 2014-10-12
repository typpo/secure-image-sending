var canvas = document.getElementById('canvas');
var context = context = canvas.getContext('2d');
var img = img = document.createElement('img');

// Image for loading
img.addEventListener('load', function () {
  clearCanvas();
  context.drawImage(img, 0, 0);
}, false);

// To enable drag and drop
canvas.addEventListener('dragover', function (evt) {
  evt.preventDefault();
}, false);

// Handle dropped image file - only Firefox and Google Chrome
canvas.addEventListener('drop', function (evt) {
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
  var s='';
  // Removes alpha to save space.
  for (var i=0; i<pix.length; i+=4) {
    s+=(String.fromCharCode(pix[i])
        + String.fromCharCode(pix[i+1])
        + String.fromCharCode(pix[i+2]));
  }
  return s;
}

function setCanvasDataFromString(s) {
  // Build array
  var p=[];
  for (var i=0; i<s.length; i+=3) {
    for (var j=0; j<3; j++) {
      p.push(s.substring(i+j,i+j+1).charCodeAt());
    }
    p.push(255); // Hardcodes alpha to 255.
  }

  // Set it
  var arr = p;
  for (var i=0; i<arr.length; i++) { arr[i]-=0; }
  var imgd = context.getImageData(0, 0, canvas.width, canvas.height);
  imgd.data = arr;
  context.putImageData(imgd, 0, 0);
}

window.onload = function() {
  var btnEncrypt = document.getElementById('btnEncrypt');
  var btnDecrypt = document.getElementById('btnDecrypt');
  var btnClear = document.getElementById('btnClear');

  btnEncrypt.onclick = function() {
    var passcode = 'foobar';
    var data = getCanvasDataString();

    var encryptedString = sjcl.encrypt(passcode, data);

    document.getElementById('inout').value = encryptedString;
  };

  btnDecrypt.onclick = function() {
    var passcode = 'foobar';

    var data = document.getElementById('inout').value;
    var decryptedString = sjcl.decrypt(passcode, data);

    setCanvasDataFromString(decryptedString);
    document.getElementById('inout').value = '';
  };

  btnClear.onclick = function() {
    clearCanvas();
  };
};
