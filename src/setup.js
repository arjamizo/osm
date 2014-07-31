var fs = require('fs');
var shredfile = require('shredfile')({});
var mkdirp = require('mkdirp');
var checkInterval;

mkdirp('./tmp/br', function(err) {
  if (err) {
    alert('Error creating temporary directory: ' + err);
  }
});

function percentage(top, current) {
  return ((top - current) / (top)) * 100;
}

// TODO: Delete any files from ./tmp/br/

function checkForFiles() {
  // According to the NodeJS documentation, "readdirSync ... Returns an array
  // of filenames excluding '.' and '..'". A file and a directory are not the
  // same thing, so this is kinda weird. Let's just use their wording, however
  // confusing it may be.
  var files = fs.readdirSync('./tmp/');

  if (Object.keys(files).length === 1) {
    clearInterval(checkInterval);
    window.location = 'main.html';
  }
}

window.onload = function() {
  var progressBar = document.getElementById('progressbar');

  checkInterval = setInterval(checkForFiles, 2500);

  var originalCount = 0;
  var fileCount = 0;
  fs.readdir('./tmp/', function(err, files) {
    // On first run the ./tmp/ directory won't exist, and therefore we won't
    // have any images stored.
    if(typeof(files) === 'undefined') {
      window.location = 'main.html';
      return;
    }
    originalCount = Object.keys(files).length;
    fileCount = Object.keys(files).length;
    if (err) {
      console.log('Error: Failed to list files in `../tmp/`. Reason: ' + err);
      return;
    }
    if (files[0]) {
      files.forEach(function(file) {
        fileCount--;
        shredfile.shred('./tmp/' + file, function(err) {
          // TODO: Handle any errors.
          progressBar.setAttribute('style', 'width: ' +
            percentage(originalCount, fileCount) + '%');
        });
      });
    } else {
      window.location = 'main.html';
    }
  });
};
