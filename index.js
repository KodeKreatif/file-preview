var pdfInfo = require("pdfinfo");
var gm = require("gm");

var info = function(inputStream, cb) {
  var file = pdfInfo(inputStream);
  if (file && file.info) {
    file.info(function(err, data) {
      var result = {
        filename: inputStream.path || inputStream,
        numPages: data.pages
      }
      cb(result);
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
  var filename = inputStream.path || inputStream;
  if (options.type == "pdf") {
    filename += "[" + (page - 1) + "]";
  }
  var dataSize = 0;

  var output = gm(inputStream, filename)
    .density(density, density)
    .resize(size)
    .stream("png");

  outputStream.on("error", function(e) {
    console.log("error");
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
    outputStream.end();
  });

  output.on("data", function(data) {
    dataSize += data.length;
    if (secondPipe) {
      secondPipe.write(data);
    }
  });

  output.pipe(outputStream);
}

var preview = function(inputStream, options, outputStream, cb, secondPipe) {
  var filename = inputStream.path;
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

