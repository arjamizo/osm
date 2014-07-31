var googleImages = require('google-images');
var exif = require('exif2');
var request = require('request');
var fs = require('fs');
var md5 = require('MD5');
var shredfile = require('shredfile')({});
var gui = require('nw.gui');
var exec = require('child_process').exec;
var csv = require('csv-to-json');

// TODO: Check for internet availability.

// Mouse positions; see readMouseMove().
var x;
var y;

function imageSearch(query) {
  var resultsCount = 0;
  var imagesDiv = document.getElementById('images');
  var endOfResults = document.getElementById('eor');
  var eorBreak = document.getElementById('eor-break');

  // The deprecated Google Images API only allows us to recieve a maximum
  // of 60 results.
  for (var i = 0; i < 57; i = i +4) {
    // NOTE: Eventually this should be refactored, but I'm not overly
    // concerned about it at this time.

    /* jshint loopfunc: true */
    googleImages.search(query, { page: i, callback: function(err, images) {
      var resultsDiv = document.getElementById('results');
      if (images[0]) {
      results.className = 'page-header';
      images.forEach(function(image) {
        // NOTE: This is a little hack I implemented to replace imgur
        // thumbnails with the full image.
        if (image.url.substring(0, 19) === 'http://i.imgur.com/') {
          image.url = image.url.replace('b.jpg', '.jpg');
        }

        resultsCount++;
        var file = fs.createWriteStream('./tmp/' + md5(image.url));
        var req = request({url: image.url, proxy: 'http://127.0.0.1:8118'});
        req.pipe(file);

        req.on('end', function() {
          exif ('./tmp/' + md5(image.url), function(err, obj) {
            var exifData = '';
            if (err === null) {
              for(var key in obj) {
                if (obj.hasOwnProperty(key) &&
                    key !== 'exiftool version number' &&
                    key !== 'file name' &&
                    key !== 'directory' &&
                    key !== 'file inode change date time' &&
                    key !== 'file modification date time' &&
                    key !== 'file access date time' &&
                    key !== 'file permissions') {
                    exifData += ucwords(key) + ': ' + obj[key] + '<br>';
                }
              }
            } else {
              exifData = err;
            }
            shredfile.shred('./tmp/' + md5(image.url), function(err, file) {

            });
            results.innerHTML = '<h3>' + resultsCount + ' Results</h3>';
            // Let's pretend I never wrote this...
            /* jshint maxlen: false */
            imagesDiv.innerHTML += '<div class="thumbnail"><img id="' + md5(image.url) + '" src="' + image.url + '" onclick="showExifData(\'' + window.btoa(unescape(encodeURIComponent(exifData))) + '\')" oncontextmenu="showContextMenu(\'' + image.url + '\', \'' + image.from + '\')"><br><br></div>';
            eorBreak.className = '';
            endOfResults.className = 'lead text-center text-muted';
          });
        });
      });
      } else {
        eorBreak.className = 'hidden';
        endOfResults.className = 'lead text-center text-muted hidden';
        results.className = 'page-header';
        results.innerHTML = '<h3>No images found.</h3>';
        return false;
      }
    }});
  }
}

/**
 * Uppercase Words
 * @param string str
 */
function ucwords(str) {
    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function($1) {
        return $1.toUpperCase();
    });
}

// Stolen! Credits go to this chap: http://stackoverflow.com/users/1219011/twist
// Original: http://stackoverflow.com/a/11840120
// Modified to remove non-webkit CSS rules.
function getRotationDegrees(obj) {
  var angle;
  var matrix = obj.css('-webkit-transform') ||
  obj.css('transform');
  if (matrix !== 'none') {
    var values = matrix.split('(')[1].split(')')[0].split(',');
    var a = values[0];
    var b = values[1];
    angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
  } else {
    angle = 0;
  }
  return (angle < 0) ? angle +=360 : angle;
}

function showExifData(data) {
  var exifData = document.getElementById('exif-data');
  exifData.innerHTML = window.atob(data);
  $('#exif-data-modal').modal('show');
}

function showContextMenu(url, from) {
  // TODO: Reduce the amount of statements. Yeah, this is a pile of fuck.
  /* jshint maxstatements:25 */
  var menu = new gui.Menu();
  var clipboard = gui.Clipboard.get();

  var flipImageItem = new gui.MenuItem(
    { label: 'Toggle Flip Image',
      click: function() {
        var image = $('img[src="' + url + '"]');
        if (image.hasClass('flipped')) {
          image.removeClass('flipped');
        } else {
          image.addClass('flipped');
        }
      }
    });

  // TODO: Shred images.
  // TODO: Show confidence?
  var genderAgeItem = new gui.MenuItem(
    { label: 'Age/Gender (Experimental)',
      click: function() {
        var file = fs.createWriteStream('./tmp/br/' + md5(url) + '.image');
        var req = request({url: url, proxy: 'http://127.0.0.1:8118'});
        req.pipe(file);

        req.on('end', function() {
          exec('br -algorithm GenderEstimation -enroll ' + process.cwd() +
               '/tmp/br/' + md5(url) + '.image ' + process.cwd() +
               '/tmp/br/gender_' + md5(url) + '.csv', function(err, result) {
            if (err) {
              alert(err);
              return;
            }
            var genderResult = csv.parse('./tmp/br/gender_' + md5(url) +
                                         '.csv');

            var gender = genderResult[0].Gender;
            if (typeof(gender) === 'undefined') {
              gender = 'Unknown';
            }
            var genderSpan = document.getElementById('gender');
            genderSpan.innerHTML = gender;
          });

          exec('br -algorithm AgeEstimation -enroll ' + process.cwd() +
               '/tmp/br/' + md5(url) + '.image ' + process.cwd() +
               '/tmp/br/age_' + md5(url) + '.csv', function(err, result) {
            if (err) {
              alert(err);
              return;
            }
            var ageResult = csv.parse('./tmp/br/age_' + md5(url) + '.csv');

            var age = ageResult[0].Age;
            var ageSpan = document.getElementById('age');
            if (typeof(age) === 'undefined') {
              ageSpan.innerHTML = 'Unknown';
            } else {
              ageSpan.innerHTML = Math.round(age);
            }
          });
          $('#age-gender-modal').modal('show');
        });
      }
    });

  var previewPageItem = new gui.MenuItem(
    { label: 'Preview Page (No Proxy)',
      click: function() {
        // Let's pretend I never wrote this...
        /* jshint maxlen: false */
        var pwin = open('private.html');
        pwin.document.write('<iframe src="' + from + '" style="border: 0; position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%" sandbox></iframe>');
      }
    });

  var rotateRightItem = new gui.MenuItem(
    { label: 'Rotate Right',
      click: function() {
        var degrees = getRotationDegrees($('img[src="' + url + '"]'));
        $('img[src="' + url + '"]').rotate(degrees + 90);
      }
    });

  var rotateLeftItem = new gui.MenuItem(
    { label: 'Rotate Left',
      click: function() {
        var degrees = getRotationDegrees($('img[src="' + url + '"]'));
        $('img[src="' + url + '"]').rotate(degrees - 90);
      }
    });

  var copyImageUrlItem = new gui.MenuItem(
    { label: 'Copy Image URL',
      click: function() {
        clipboard.set(url, 'text');
      }
    });

  var copyPageUrlItem = new gui.MenuItem(
    { label: 'Copy Page URL',
      click: function() {
        clipboard.set(from, 'text');
      }
    });

  // It's my party and I'll cry if I want to.
  menu.append(previewPageItem);
  menu.append(new gui.MenuItem({ type: 'separator' }));
  menu.append(rotateLeftItem);
  menu.append(rotateRightItem);
  menu.append(flipImageItem);
  menu.append(genderAgeItem);
  menu.append(new gui.MenuItem({ type: 'separator' }));
  menu.append(copyImageUrlItem);
  menu.append(copyPageUrlItem);
  // TODO: Implement these functions.
  menu.append(new gui.MenuItem({ label: 'Save Image' }));
  menu.append(new gui.MenuItem({ label: 'Save Exif Data' }));
  menu.popup(x, y);
}

function readMouseMove(e) {
  x = e.clientX;
  y = e.clientY;
}

$(document).ready(function() {
  document.onmousemove = readMouseMove;

  document.onkeydown = function(e) {
    // Debug console (` key)
    if (e.keyCode === 192) {
      e.preventDefault();
      gui.Window.get().showDevTools();
      return false;
    }
  };

  // We need to reset the age and gender otherwise we're left with
  // stale data.
  $('#age-gender-modal').on('hidden.bs.modal', function () {
      $('#age').html('<i>Waiting...</i>');
      $('#gender').html('<i>Waiting...</i>');
  });

  $('a[href="#settings"]').click(function() {
    $('#settings-modal').modal('show');
    return false;
  });

  $('a[href="#top"]').click(function() {
    $('html, body').animate({ scrollTop: 0 }, 'slow');
    return false;
  });

  $('#eor').click(function() {
    $('html, body').animate({ scrollTop: 100 }, 'slow');
    return false;
  });

  $('#search-form').on('submit', function() {
    $('#images').html('');
    imageSearch($('#query').val());
    return false;
  });

});
