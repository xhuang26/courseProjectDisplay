var assert = require("assert");
var expect = require('chai').expect;
var RevisionNode = require("../libs/RevisionNode");

describe("RevisionNode", function(){
  it("should be able to create new revision node", function(){
    let number = 123;
    let author = "xhuang62";
    let message = "test";
    let date = "Thu Oct 13 2016 15:07:49 GMT-0500 (CDT)";
    let files = [];
    revisionNode = new RevisionNode(number, author, message, date);
    expect(revisionNode.number).to.equal(number);
    expect(revisionNode.author).to.equal(author);
    expect(revisionNode.message).to.equal(message);
    expect(revisionNode.date.toString()).to.equal(date);
    expect(revisionNode.files).to.be.a("array");
  });
  it("should be able to add file into node", function(){
    revisionNode = new RevisionNode();
    revisionNode.addFile("test.xml");
    expect(revisionNode.containsFile("test.xml")).to.be.true;
  });
});