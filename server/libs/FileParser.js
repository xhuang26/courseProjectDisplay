const FileTree = require('./FileTree');
const ProjectNode = require('./ProjectNode');
const RevisionNode = require('./RevisionNode');

const fs = require('fs'),
      util = require('util'),
      xml2js = require('xml2js'),
      sql = require("mssql");



//test files
//const LOG_FILENAME = './data/test_log.xml';
//const LIST_FILENAME = './data/test_list.xml';

//real file
const LOG_FILENAME = './data/svn_log.xml';
const LIST_FILENAME = './data/svn_list.xml';

//output file
const LOG_OUTPUT_FILENAME = "../data/svn_log.json";
const LIST_OUTPUT_FILENAME = "../data/svn_list.json";
//global variable
let rootPath = {};
let projects = {};
let revisions = {};
//functions
const  readInFile = function(filename) {
  const parser = new xml2js.Parser();
  data = fs.readFileSync(__dirname + '/'+filename);
  let res = null;
  parser.parseString(data, function (err, result) { //interesting... callback style, but not async...
    if(err){
      return console.error(err);
    }
    res = result;
    //console.log(util.inspect(result, false, null))
    //console.log('Done reading in %s', filename);
  });
  return res;
}

const writeToFile = function(filename, data){
  jsonData = JSON.stringify(data["lists"]["list"]);
  path = __dirname + '/' + filename;
  fs.writeFile (path, jsonData, function(err) {
    if (err) throw err;
    console.log('complete writing to %s', filename);
  });
}

//config for Azure database
const config = {
  user: 'xhuang62',
  password: '950426#Lisa',
  server: 'webportfolio-server.database.windows.net',
  database: 'web-portfolio-database',
  options: {encrypt: true}  
};


//requests
function projectInsertRequestFunc(name, date, version, author){
  const projectInsertRequest = new sql.Request();
  projectInsertRequest.input('name', sql.VarChar(50), name);
  projectInsertRequest.input('date', sql.VarChar(50), date);
  projectInsertRequest.input('version', sql.Int, version);
  projectInsertRequest.input('author', sql.VarChar, author);
  projectInsertRequest.execute('dbo.ProjectInsert', function(err, recordsets, returnValue) {
    if (err){
      console.log(err);
      return;
    }
    console.log("finish insert project!");
  });
}

function fileInsertRequestFunc(path, size, type, projectName){
  const fileInsertRequest = new sql.Request();
  fileInsertRequest.input('path', sql.VarChar(50), path);
  fileInsertRequest.input('type', sql.VarChar(50), type);
  fileInsertRequest.input('projectName', sql.VarChar(50), projectName);
  fileInsertRequest.input('size', sql.Int, size);
  fileInsertRequest.execute('dbo.FileInsert', function(err, recordsets, returnValue) {
    if (err){
      console.log(err);
      return;
    }
  });
}

function revisionInsertRequestFunc(number, author, message, date){
  const revisionInsertRequest = new sql.Request();
  revisionInsertRequest.input('author', sql.VarChar(50), author);
  revisionInsertRequest.input('message', sql.VarChar(50), message);
  revisionInsertRequest.input('date', sql.VarChar(50), date);
  revisionInsertRequest.input('number', sql.Int, number);
  revisionInsertRequest.execute('dbo.RevisionInsert', function(err, recordsets, returnValue) {
    if (err){
      console.log(err);
      return;
    }
  });
}

function revisionFileInsertRequestFunc(number, filePath){
  const revisionFileInsertRequest = new sql.Request();
  revisionFileInsertRequest.input('number', sql.Int, number);
  revisionFileInsertRequest.input('filePath', sql.VarChar(50), filePath);
  revisionFileInsertRequest.execute('dbo.RevisionFileInsert', function(err, recordsets, returnValue){
    if (err){
      console.log(err);
      return;
    }
    console.log("filePath:", filePath);
  });
}

function ProjectSummaryUpdateFunc(summary, number){
  const ProjectSummaryUpdateRequest = new sql.Request();
  ProjectSummaryUpdateRequest.input('summary', sql.VarChar(50), summary);
  ProjectSummaryUpdateRequest.input('number', sql.VarChar(50), number);
  ProjectSummaryUpdateRequest.execute('dbo.ProjectSummaryUpdate', function(err, recordsets, returnValue){
    if (err){
      console.log(err);
      return;
    }
  });
}

function populateTableByListFile(listFileName, rootPath){
  const listObj = readInFile(listFileName);
  //writeToFile(LIST_OUTPUT_FILENAME, listObj);
  rootPath["path"] = listObj['lists']['list'][0]['$']['path'];
  entryArray = listObj['lists']['list'][0]['entry'];
  projects = [];
  sql.connect(config, function(err){
    for(let i=0; i<entryArray.length; i++){
      let cur = entryArray[i];
      let name = cur['name'][0]; //including path info
      let nameArray = name.split('/');
      let projectName = nameArray[0];
      //for creating tree
      type = cur['$']['kind'];
      size = -1;
      if(type != 'dir'){
        size = cur['size'][0];
      } 
      if(projects[projectName] == null){
        projects[projectName] = "exist";
        version = cur['commit'][0]['$']['revision'];
        author = cur['commit'][0]['author'][0];
        date = cur['commit'][0]['date'][0];
        projectInsertRequestFunc(name, date, version, author);
      }
      fileInsertRequestFunc(name, size, type, projectName);
    }
    console.log("finish all!");
  });
  sql.on('error', function(err) {
    throw err;
  });
}

function createFileTree(data, projectName, callback){
  fileTree =new FileTree(projectName);
  for(let i=0; i<data.length; i++){
    let cur = data[i];
    fileTree.add(cur.size, cur.type, cur.path);
  }
  callback(fileTree);
}

//parse files and  create projects array and file tree
function parseListFile(listFileName, projects, rootPath){
  
  const listObj = readInFile(listFileName);
  //writeToFile(LIST_OUTPUT_FILENAME, listObj);
  rootPath["path"] = listObj['lists']['list'][0]['$']['path'];
  entryArray = listObj['lists']['list'][0]['entry'];

  
  for(let i=0; i<entryArray.length; i++){
    let cur = entryArray[i];
    let name = cur['name'][0]; //including path info
    let nameArray = name.split('/');
    let projectName = nameArray[0];
        
    //for creating tree
    type = cur['$']['kind'];
    size = -1;
    if(type != 'dir'){
      size = cur['size'][0];
    } 
    
    //create new project
    if(projects[projectName] == null){
      version = cur['commit'][0]['$']['revision'];
      author = cur['commit'][0]['author'][0];
      date = cur['commit'][0]['date'][0];
      fileTree =new FileTree(projectName);
      projects[projectName] = new ProjectNode(name,date, version, null, fileTree); //cannot set commit message currently 
      
      
    } else {
      projects[projectName].fileTree.add(size, type, name);
    } 
  }
}

function populateTableByLogFile(logFileName){
  const logObj = readInFile(logFileName);
  const revisionArray = logObj['log']['logentry'];
  sql.connect(config, function(err){
    for(let i=0; i<revisionArray.length; i++){
      let cur = revisionArray[i];
      let number = cur['$']['revision'];
      let author = cur['author'][0];
      let date = cur['date'][0];
      let message = cur['msg'][0];
      revisionInsertRequestFunc(number, author, message, date);
      let files = cur['paths'][0]['path'];
      for(let j=0; j<files.length; j++){
        let path = files[j]['_'].split('/').slice(2).join('/'); //remove /xhuang62/ at the beginning
        revisionFileInsertRequestFunc(number, path);
      }
      let projectName = files[0]['_'].split('/').slice(2)[0];
      console.log("projectName:", projectName);
      ProjectSummaryUpdateFunc(message, number);
    }
  });
  sql.on('error', function(err) {
    throw err;
  });
}



function parseLogFile(logFileName, revisions, projects){
  const logObj = readInFile(logFileName);
  const revisionArray = logObj['log']['logentry'];
  for(let i=0; i<revisionArray.length; i++){
    let cur = revisionArray[i];
    let number = cur['$']['revision'];
    let author = cur['author'][0];
    let date = cur['date'][0];
    let message = cur['msg'][0];
    let revisionNode = new RevisionNode(number, author, message, date);
    let files = cur['paths'][0]['path'];
    for(let j=0; j<files.length; j++){
      let path = files[j]['_'].split('/').slice(2).join('/'); //remove /xhuang62/ at the beginning
      revisionNode.addFile(path);
    }
    revisions[number] = revisionNode;
  }
  setSummaryInProjects(revisions, projects);
}

function setSummaryInProjects(revisions, projects){
  for(name in projects){
    let project = projects[name];
    let version = project.version;
    let summary = revisions[version].message;
    project.setSummary(summary);
  }
}

//get all revisions contain a specific file

function getRevisions(filePath, revisions){
  res = [];
  for(num in revisions){
    revision = revisions[num];
    if(revision.containsFile(filePath)){
      
      res.push(revision);
    }
  }
  return res;
}

module.exports={
  "parserListFile": parseListFile, 
  "parserLogFile": parseLogFile,
  "getRevisions": getRevisions,
  "populateTableByListFile": populateTableByListFile,
  "populateTableByLogFile": populateTableByLogFile,
  "createFileTree": createFileTree
};

//call parse functions
//parseListFile(LIST_FILENAME);
//parseLogFile(LOG_FILENAME);
