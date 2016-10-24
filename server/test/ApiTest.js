//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
let before = require('mocha').before;
var expect = require('chai').expect;
chai.use(chaiHttp);



describe('/GET projects', function(){
  it("should GET all projects", function(done){
    chai.request(server)
        .get("/projects")
        .end((err, res)=>{
          res.should.have.status(200);
          done();
        });
  });
});


describe("/POST comments", function(){
  var parentId, file, legalUserName;
  before(function() {
    parentId = -1;
    file = "fileRandom";
    legalUserName="xhuang62"
  });
  beforeEach(function(){
    //var text = sentenceGenerator();
  });
  it("should be able to subtitude any illegal message in the posted comment", function(done){
    let simpleXSSTestString = "';!--\"<XSS>=&{()}";
    chai.request(server)
      .post('/comments')
      .send({"fileName": file, "parentId": parentId, "text": simpleXSSTestString, "userName": legalUserName})
      .end((err,res)=>{
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal("OK");
        chai.request(server).get('/comments/'+parentId+'/'+file)
          .end((err,res)=>{
            expect(res).to.have.status(200);
            expect(res.body.data, ["&#39;;!--&quot;&amp;lt;XSS&amp;gt;=&amp;{()}"]);
            done();
          });
      });
  });
  
});

describe("/GET comments", function(){
  var parentId;
   before(function() {
    parentId = -1;
  });
  it("should be able to detect the SQL injection attack", function(done){
    chai.request(server)
      .get("/comments/"+parentId+"/'1' OR '1' = '1'")
      .end((err,res)=>{
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal("OK");
        expect(res.body.data).to.deep.equal([]);
        done();
      });
  });
})