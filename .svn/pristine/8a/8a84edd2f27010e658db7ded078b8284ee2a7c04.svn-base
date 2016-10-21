var assert = require("assert");
var expect = require('chai').expect;
var ParserFuncs = require("../libs/FileParser");
var FileTree = require("../libs/FileTree");

describe("FileParser", function(){
  it("should handle multiple revision of a file", function(){
    let LIST_FILENAME = '../data/multipleRevision_list.xml';
    let LOG_FILENAME = '../data/multipleRevision_log.xml';
    let projectName = "ProjectA";
    var rootPath = {};
    var projects = {};
    var revisions = {};
    ParserFuncs.parserListFile(LIST_FILENAME, projects, rootPath);
    ParserFuncs.parserLogFile(LOG_FILENAME, revisions);
    let project = projects[projectName];
    expect(project).to.not.be.null;
    expect(rootPath["path"]).to.equal("https://subversion.ews.illinois.edu/svn/fa16-cs242/xhuang62");
    expect(project.name).to.equal(projectName);
    expect(project.fileTree.projectName).to.deep.equal(projectName);
    expect(revisions['1233'].files[0]).to.equal(revisions['1234'].files[0]);
  });
});