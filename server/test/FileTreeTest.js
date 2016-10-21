var assert = require("assert");
var expect = require('chai').expect;
var FileTree = require("../libs/FileTree");
var FileNode = require("../libs/FileNode");

describe("FileTree", function(){
  it("should be able to create new file tree", function(){
    let name = "testProject";
    let fileTree = new FileTree(name);
    expect(fileTree.projectName).to.equal(name);
    //root node is a directory
    expect(fileTree.root.size).to.equal(-1);
    expect(fileTree.root.path).to.equal(name);
    expect(fileTree.root.type).to.equal('dir');
  });
  it("should be able to add a file and find the added file", function(){
    let name = "testProject";
    let fileTree = new FileTree(name);
    let size = "123";
    let type = "file";
    let path = name + "/test.file";
    fileTree.add(size, type, path);
    expect(fileTree.find(path)).to.deep.equal(new FileNode(size, type, path, name));
  });
  it("should be able to add more than one files and find the added files", function(){
    let name = "testProject";
    let fileTree = new FileTree(name);
    let size = "123";
    let type = "file";
    let file1 = name + "/dir1/test.file";
    let file2 = name + "/dir1/dir2/test.file";
    let dir1 = name + "/dir1";
    let dir2 = name + "/dir1/dir2";
    fileTree.add(size,type,file1);
    fileTree.add(size,type, file2);
    //check dir1 and its child
    expect(fileTree.find(dir1).parent).to.deep.equal(name);
    expect(fileTree.find(dir1).size).to.deep.equal(-1); 
    expect(fileTree.find(dir1).path).to.deep.equal(dir1); 
    expect(fileTree.find(dir1).children.length).to.equal(2);
    expect(fileTree.find(dir1).children[0]).to.deep.equal(fileTree.find(file1));
    expect(fileTree.find(dir1).children[1]).to.deep.equal(fileTree.find(dir2));
    //check file1
    expect(fileTree.find(file1)).to.deep.equal(new FileNode(size, type, file1, dir1));
    //check file2
    expect(fileTree.find(file2)).to.deep.equal(new FileNode(size, type, file2, dir2));
    
  });
});