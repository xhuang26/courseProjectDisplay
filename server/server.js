const FileTree = require('./libs/FileTree');
const ProjectNode = require('./libs/ProjectNode');
const RevisionNode = require('./libs/RevisionNode');
const ParserFuncs = require("./libs/FileParser");

const fs = require('fs'),
      util = require('util'),
      xml2js = require('xml2js'),
      bodyParser = require('body-parser'),
      express = require('express'),
      cors = require('cors'),
      sql = require("mssql"),
      validator = require('express-validator');

const router = express.Router();


//real file
const LOG_FILENAME = '../data/svn_log.xml';
const LIST_FILENAME = '../data/svn_list.xml';

//global variable
let rootPath = {};
let projects = {};
let revisions = {};

//config for Azure database
const config = {
  user: 'xhuang62',
  password: '950426#Lisa',
  server: 'webportfolio-server.database.windows.net',
  database: 'web-portfolio-database',
  options: {encrypt: true}  
};




//use express
const app = express();
const port = 4000;

app.use(cors());
//Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST) and exposes the resulting object (containing the keys and values) on req.body
app.use(bodyParser.urlencoded({
  extended: true
}));
//Parses the text as JSON and exposes the resulting object on req.body.
app.use(bodyParser.json());

//use validator
app.use(validator());

///app.use('/', routers);
app.use('/', router);








//routes
const ProjectRouter = router.route('/projects');
const ProjectRouterId = router.route('/projects/*');
const VersionRouterId = router.route('/versions/*');
const FileRouterId = router.route('/files/*');
const CommentRouterId = router.route('/comments/:parentId/*');
const CommentRouter = router.route('/comments');
const IconRouter = router.route('/icons/*');

//initial testing
const homeRoute = router.route('/');
homeRoute.get(function(req, res) {
  //res.json({ message: 'Hello World!' });
});


//create validator and Filter

//symbols not allowed in a path
function routeValidator(string){
  const stringPattern = new RegExp(/^[^<>&'"]+$/);
  if (stringPattern.test(string)) {
     return true;
  } else {
    return false;
  }
}
//symbols not allowed in a word
function stringValidator(string){
  const stringPattern = new RegExp(/^[^<>&'"/]+$/);
  if (stringPattern.test(string)) {
     return true;
  } else {
    return false;
  }
}
//escape for XSS attack projection
function stringFilter(string){
  if(!string){
    return null;
  }
  return string.replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/&/g, "&amp;").replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

//methods

//get the icon based on the word user input
IconRouter.get(function(req, res){
  let word = stringFilter(req.params[0]);
  
  let sql_conn = new sql.Connection(config, function(err){
    const iconGetReqeust = new sql.Request(sql_conn);
    iconGetReqeust.input('word', sql.VarChar(50), word);
    iconGetReqeust.execute('dbo.IconGet', function(err, recordsets, returnValue){
      console.log("word", word);
      if (err){
        res.status(404).json({ error: err });
        return;
      }
      console.log(word, "and", recordsets);
      if(recordsets && recordsets[0] && recordsets[0].length !== 0){
        res.json({message: "OK", data: recordsets[0]});
      } else {
        res.json({message: "OK", data: []});
      }
    });
  });
  sql.on('error', function(err) {
    res.status(500).json({message: err.message});
  });
});


//get comment of a specific file with the parent comment id
CommentRouterId.get(function(req, res){
  let fileName = req.params[0];
  let parentId = parseInt(req.params.parentId);
  sql.connect(config, function(err){
    const commentGetRequest = new sql.Request();
    commentGetRequest.input("fileName", sql.VarChar(50), fileName);
    commentGetRequest.input("parentId", sql.Int, parentId);
    commentGetRequest.execute('dbo.CommentGet', function(err, recordsets, returnValue){
      if (err){
        console.log(err);
        return;
      }
      console.log(recordsets);
      res.json({message: "OK", data: recordsets[0]});
    });
  });
  sql.on('error', function(err) {
    res.status(500).json({message: err.message});
  });
});

//post comment with parentId
CommentRouter.post(function(req, res){
  let fileName = req.body.fileName;
  if(!routeValidator(fileName)){
    res.status(404).json({ message: "invalid request params" });
    return;
  }
  sql.connect(config, function(err){
    console.log(stringFilter(req.body.text));
    const commentPostRequest = new sql.Request();
    commentPostRequest.input("fileName", sql.VarChar(50), req.body.fileName);
    commentPostRequest.input("parentId", sql.Int, req.body.parentId);
    commentPostRequest.input("text", sql.VarChar(sql.max), stringFilter(req.body.text));
    commentPostRequest.input("username", sql.VarChar(50), stringFilter(req.body.userName));
    commentPostRequest.execute('dbo.CommentInsert', function(err, recordsets, returnValue){
      if (err){
          res.status(500).json({message: err.message});
          return;
      }
      res.json({message: "OK", data: {"id": returnValue}});
    });
  });
  sql.on('error', function(err) {
    res.status(500).json({ message: "failed to post comment" });
  });
});

//get all the projjects
ProjectRouter.get(function(req, res){

  sql.connect(config, function(err){
    const projectsGetRequest = new sql.Request();
    
    projectsGetRequest.execute('dbo.ProjectsGet', function(err, recordsets, returnValue) {
      if (err){
        res.status(500).json({message: err.message});
        return;
      }
      res.json({message: "OK", data: recordsets[0]});
    });
  });
  sql.on('error', function(err) {
    res.status(500).json({message: err.message});
  });
});


//get files from one project
ProjectRouterId.get(function(req, res){
  
  let filePath = req.params[0];
  console.log(filePath);
  let projectName = filePath.split('/')[0];
  if(!routeValidator(filePath) || !stringValidator(projectName)){
    res.status(404).json({ status: "invalid request params" });
    return;
  }
  sql.connect(config, function(err){
    const filesGetByProjectNameRequest = new sql.Request();
    filesGetByProjectNameRequest.input("projectName", sql.VarChar(50), projectName);
    console.log("projectName", projectName);
    filesGetByProjectNameRequest.execute('dbo.FilesGetByProjectName', function(err, recordset, returnValue){
      console.log("recordset", recordset);
      if(recordset){
        var fileList = recordset[0];
        var fileTree = ParserFuncs.createFileTree(fileList, projectName, function(fileTree){
          console.log("fileTree", fileTree);
          res.json({message: "OK", data: fileTree});
        }); 
      }else{
        res.json({message: "OK", data: []});
      }
    });
  });
  sql.on('error', function(err) {
    res.status(500).json({message: err.message});
  });

});

//get a detail info of a file
FileRouterId.get(function(req, res){

  let filePath = req.params[0];
  console.log(filePath);
  if(!routeValidator(filePath)){
    res.status(404).json({ error: "invalid request params" });
    return;
  }
  const fileGetByFileNameRequest = new sql.Request();
  sql.connect(config, function(err){
    const filesGetByFileNameRequest = new sql.Request();
    filesGetByFileNameRequest.input("fileName", sql.VarChar(50), filePath);
    filesGetByFileNameRequest.execute('dbo.FileGetByFileName', function(err, recordset, returnValue){
      var fileList = recordset[0];
      console.log(recordset);
      res.json({message: "OK", data: fileList[0]});
    });
  });
  sql.on('error', function(err) {
    res.status(500).json({message: err.message});
  });
});


//get version info of a file
VersionRouterId.get(function(req, res){
  let filePath = req.params[0];
  if(!routeValidator(filePath)){
    res.status(404).json({ error: "invalid request params" });
    return;
  }
  sql.connect(config, function(err){
    const RevisionsGetByFileNameRequest = new sql.Request();
    RevisionsGetByFileNameRequest.input("fileName", sql.VarChar(50), filePath);
    RevisionsGetByFileNameRequest.execute('dbo.RevisionsGetByFileName', function(err, recordset, returnValue){
      var revisionList = recordset[0];
      //var fileTree = ParserFuncs.createFileTree(fileList, projectName);
      res.json({message: "OK", data: revisionList});
    });
  });
  sql.on('error', function(err) {
    res.status(500).json({message: err.message});
  });
});


app.listen(port);
console.log('Server running on port ' + port);

module.exports = app;

