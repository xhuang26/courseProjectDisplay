var assert = require("assert");
var expect = require('chai').expect;
var ProjectNode = require("../libs/ProjectNode");

describe("ProjectNode", function(){
  it("should be able to create new project node with summary specified", function(){
    let name = "test.js";
    let date = "Thu Oct 13 2016 15:07:49 GMT-0500 (CDT)";
    let version = "1234";
    let summary ="test";
    projectNode = new ProjectNode(name, date, version, summary);
    expect(projectNode.name).to.equal(name);
    expect(projectNode.summary).to.equal(summary);
    expect(projectNode.date).to.be.a('date');
    expect(projectNode.date.toString()).to.equal(date);
    expect(projectNode.version).to.equal(version);
  });
  it("should be able to create new project node without summary specified", function(){
    projectNode = new ProjectNode();
    expect(projectNode.summary).to.equal("(no commit message)");
  });
  it("should be able to set summary", function(){
    let projectNode = new ProjectNode();
    let summary = "test";
    projectNode.setSummary(summary);
    expect(projectNode.summary).to.equal(summary);
  });
});