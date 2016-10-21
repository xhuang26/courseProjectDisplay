var assert = require("assert");
var expect = require('chai').expect;
var FileNode = require("../libs/FileNode");

describe("FileNode", function(){
  it("should be able to create new file node", function(){
    let path = "a/b/test.js";
    let size = 123;
    let type = "dir";
    let parent = "parent";
    fileNode = new FileNode(size, type, path, parent);
    expect(fileNode.path).to.equal(path);
    expect(fileNode.size).to.equal(size);
    expect(fileNode.type).to.equal(type);
    expect(fileNode.parent).to.equal(parent);
    expect(fileNode.isFile()).to.be.false;
  });
  it("should be able get name from path", function(){
    let path = "a/b/test.js";
    fileNode = new FileNode(null, null, path);
    expect(fileNode.path).to.equal(path);
    expect(fileNode.getName()).to.equal("test.js");
  });
  it("should be able to detect different type of files", function(){
    let imageFile = "test.img";
    let codeFile = "test.ruby";
    let testFile = "testTest.js"; 
    let otherFile = "Doxygen";
    let fileNode = new FileNode();
    expect(fileNode.interpretType("file", imageFile)).to.equal("image");
    expect(fileNode.interpretType("file", codeFile)).to.equal("code");
    expect(fileNode.interpretType("file", testFile)).to.equal("test");
    expect(fileNode.interpretType("file", otherFile)).to.equal("others");
  });
});