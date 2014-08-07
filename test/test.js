var should = require("should");
var fs = require("fs");
var pdfPreview = require("../");

describe("Info", function() {
  it ("should return info", function(done) {
    var readStream = fs.createReadStream(__dirname + "/mit.pdf");
    pdfPreview.info(readStream, function(info) {
      info.should.have.property("numPages");
      info.should.have.property("filename");
      done();
    });
  });

  it ("should return null when error", function(done) {
    var readStream = fs.createReadStream(__dirname + "/mit.pd");
    pdfPreview.info(readStream, function(info) {
      should(info).not.be.ok;
      done();
    });
  });

});

describe("Preview", function() {
  it ("should create a png", function(done) {
    var readStream = fs.createReadStream(__dirname + "/mit.pdf");
    var outputStream = fs.createWriteStream(__dirname + "/test.png");
    pdfPreview.preview(readStream, {size: 1000, density: 10, page: 1}, outputStream, function(size) {
      size.should.be.greaterThan(0);
      done();
    });
  });

  it ("should create a png in base64", function(done) {
    var readStream = fs.createReadStream(__dirname + "/mit.pdf");
    var outputStream = fs.createWriteStream(__dirname + "/test.png.base64");
    pdfPreview.preview(readStream, {encoding: "base64", size: 1000, density: 10, page: 1}, outputStream, function(size) {
      size.should.be.greaterThan(0);
      done();
    });
  });

  it ("should return -1 when page is invalid", function(done) {
    var readStream = fs.createReadStream(__dirname + "/mit.pdf");
    var outputStream = fs.createWriteStream(__dirname + "/test.png");
    pdfPreview.preview(readStream, {size: 1000, density: 10, page: 112}, outputStream, function(size) {
      size.should.be.equal(-1);
      done();
    });
  });

  it ("should create a png from png", function(done) {
    var readStream = fs.createReadStream(__dirname + "/mit.pdf");
    var outputStream = fs.createWriteStream(__dirname + "/test.png");
    pdfPreview.preview(readStream, {size: 1000, density: 100, page: 1}, outputStream, function(size) {
      var readStream = fs.createReadStream(__dirname + "/test.png");
      var outputStream = fs.createWriteStream(__dirname + "/test2.png");
      pdfPreview.preview(readStream, {size: 100, density: 10}, outputStream, function(size) {
        size.should.be.greaterThan(0);
        done();
      });
    });
  });


});
