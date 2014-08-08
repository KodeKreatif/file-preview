var pdfInfo = require("pdfinfo");
var gm = require("gm");

var getFilename = function(stream) {
  if (stream.path) {
    filename = stream.path;
  } else if (stream.gstore && stream.gstore.filename) {
    filename = stream.gstore.filename;
  } else {
    filename = "";
  }

  return filename;
}

var info = function(inputStream, cb) {
  var file = pdfInfo(inputStream);

  inputStream.on("error", function() {
    cb(null);
  });

  if (file && file.info) {
    file.info(function(err, data) {
      if (err) {
        console.log(err);
        cb(null);
      } else {
        var filename = getFilename(inputStream);
        var result = {
          filename: filename,
          numPages: data.pages
        }
        cb(result);
      }
    });
  } else {
    cb(null);
  }
}

var previewPdf = function(inputStream, options, outputStream, cb, secondPipe) {
  var options = options || {};
  var density = options.density || 600;
  var size = options.size || 1024;
  var page = options.page || 1;
  var filename = getFilename(inputStream);
  var base64Stream;

  if (options.type == "pdf") {
    filename += "[" + (page - 1) + "]";
  }
  if (options.encoding == "base64") {
    base64Stream = require("base64-stream").encode();
  }
  var dataSize = 0;

  var output = gm(inputStream, filename)
    .density(density, density)
    .resize(size)
    .stream("png");

  outputStream.on("error", function(e) {
    console.log(e);
    cb(-1);
  });

  output.on("error", function(e) {
    cb(-1);
  });

  output.on("end", function() {
    if (dataSize < 127) {
      dataSize = -1;
    }
    cb(dataSize);
    if (base64Stream) {
      base64Stream.end();
    } else {
      outputStream.end();
    }
  });

  output.on("data", function(data) {
    dataSize += data.length;
    if (secondPipe) {
      secondPipe.write(data);
    }
  });

  if (base64Stream) {
    output.pipe(base64Stream).pipe(outputStream);
  } else {
    output.pipe(outputStream);
  }
}

var preview = function(inputStream, options, outputStream, cb, secondPipe) {
  var filename = getFilename(inputStream);

  if (filename.toLowerCase().lastIndexOf(".pdf") == (filename.length - 4)) {
    options.type = "pdf";
  } else if (filename.toLowerCase().lastIndexOf(".png") == (filename.length - 4)) {
    options.type = "png";
  }
  previewPdf(inputStream, options, outputStream, cb, secondPipe);

}


module.exports = {
  info: info,
  preview: preview
};

