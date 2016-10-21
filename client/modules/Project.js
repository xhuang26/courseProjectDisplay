import * as d3 from "d3";
import React from 'react'
import Request from 'superagent';
import AddComment from './AddComment';
import Comment from './Comment';
import classNames from 'classnames';
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

require("!style!css!less!./Project.less");

class Project extends React.Component{
  constructor(){
    super();
    
    this.state = {
      detailInfoObj: null, //file project modal detial info
      shouldViewVersion: false, //hide or show version info
      iframeUrl: null, 
      comments: [],
      tabState: 0
    }
    
    //info for tab changes
    this.tabNames = ["information", "documents", "comment"];
    this.tabClass = {
        "clicked": classNames("tabChanged"),
        "default": classNames("tab")
    }
    this.tabClassNames = [this.tabClass.clicked, this.tabClass.default, this.tabClass.default];
    this.versionInfo = null;
  }
  
  //request all the files in the current project and build tree
  componentWillMount(){
    this.name = this.props.params['filePath'];
    let self = this;
    let url = this.props.baseUrl+"projects/"+this.name;
    Request.get(url).end(function(err, res){
      if(err){
        return console.error("failed to load file information")
      }
      console.log("data", res.text);
      let parsedData = JSON.parse(res.text);
      
      let jsonData = parsedData.data;
      //console.log("json data", jsonData);
      self.treeData = jsonData.root;
      self.createTree.call(self);
    });
  }
  
  //taken from http://javascript.tutorialhorizon.com/2014/09/08/render-a-d3js-tree-as-a-react-component/
  createTree(data){
    console.log(this._element);
    console.log(d3);
    this.convas = d3.select(this._element).append('svg')
        .attr("width", 1000)
        .attr("height", 1200);
    
    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        g = svg.append("g").attr("transform", "translate(100,0)");

    var tree = d3.cluster()
        .size([height, width - 350]);

    var stratify = d3.stratify()
        .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });


      var root = d3.hierarchy(this.treeData);
      tree(root);

      var link = g.selectAll(".link")
          .data(root.descendants().slice(1))
          .enter().append("path")
          .attr("class", "link")
          .attr("d", function(d) {
            console.log("x", d.x, "y", d.y);
            return "M" + d.y + "," + d.x
                + "C" + (d.parent.y + 100) + "," + d.x
                + " " + (d.parent.y + 100) + "," + d.parent.x
                + " " + d.parent.y + "," + d.parent.x;
          });
      let self = this;
      var node = g.selectAll(".node")
          .data(root.descendants())
          .enter()
            .append("g")
            .attr("filePath", function(d){
              console.log(d.data.path)
              return d.data.path;
            })
            .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
            .attr("transform", function(d) { 
              return "translate(" + d.y + "," + d.x + ")"; 
            })
            .on("click", function(){
              var filePath = d3.select(this).attr("filePath");
              console.log("click", filePath);
              self.getDetailInfo(filePath);
              self.versionInfo = null; //make sure version info hide
              self.setState({
                    iframeUrl: null
              });
            });

      node.append("circle")
          .attr("r", 2.5);

      node.append("text")
          .attr("fill", "grey")
          .attr("dy", 3)
          .attr("x", function(d) { return d.children ? -8 : 8; })
          .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
          .text(function(d) { 
            var array = d.data.path.split('/');
            return array[array.length-1];
          });
      
  }
  
  //request for get detail info
  getDetailInfo(filePath){
    console.log("getDetailInfo", filePath);
    let self = this;
    let url = this.props.baseUrl+"files/"+filePath;
    Request.get(url)
      .end(function(err, res){
        if(err){
          return console.error("failed to load project")
        }
        
        var parsedData = JSON.parse(res.text);
        var jsonData = parsedData.data;
        console.log("detailedInfo", jsonData);
        self.getReplies(jsonData.path);
        self.setState({
          detailInfoObj: jsonData
        })
    });
  }
  
  //request for get version info
  getVersions(filePath, callback){
    let self = this;
    let url = this.props.baseUrl+"versions/"+filePath;
    self = this;
    Request.get(url)
      .end(function(err, res){
        if(err){
          return console.error("failed to load project")
        }
        
        var parsedData = JSON.parse(res.text);
        var jsonData = parsedData.data;
        console.log("versionInfo", jsonData);
        self.versionInfo = jsonData;
        callback();
    });
  }
  
  //if user choose to view, then change the state
  toggleVersionsView(shouldView, filePath){
    self = this;
    console.log("shouldView", shouldView);
    if(shouldView){
      if(this.state.versionInfo){
        this.setState({
          shouldViewVersion: true
        });
      } else {
        console.log("need to get version!");
        this.getVersions(filePath, function(){
          self.setState({
            shouldViewVersion: true
          });
        });
      }
    } else {
      this.setState({
          shouldViewVersion: false
        });
    }
  }
  
  //close mmodal
  closeDetail(){
    this.setState({
          detailInfoObj: null,
          iframeUrl: null
    });
  }
  
  
  openIframe(url){
    let fullUrl = "https://subversion.ews.illinois.edu/svn/fa16-cs242/xhuang62/"+url;
    return fullUrl;
  }
  
  //request replies
  getReplies(inputPath){
    console.log("parent getReplies");
    let self = this;
    let path = inputPath?inputPath:this.state.detailInfoObj.path;
    let commentUrl = this.props.baseUrl+"comments/-1/"+path;
    Request.get(commentUrl).end(function(err, res){
      if(err){
        return console.error("failed to load file info")
      }
      var parsedData = JSON.parse(res.text);
      var jsonData = parsedData.data;
      self.setState({
        comments:jsonData
      });
      console.log("comments", jsonData);
    });
  }
  
  //toggle three tabs in the modal
  toggleTab(tabNum){
    this.setState({
      tabState: tabNum
    });
    for(let i=0; i<this.tabClassNames.length; i++){
      if(i == tabNum){
        this.tabClassNames[i] =  this.tabClass.clicked;
      } else {
        this.tabClassNames[i] =  this.tabClass.default;
      }
    }
    console.log("class names", this.tabClassNames);
    
  }
  
  setTabButtonClass(){
    
  }
  
  render() {
    
    var component, subcomponent;
    if(this.state.detailInfoObj !== null){
      if(this.state.tabState == 1){//document
        subcomponent=<div className="subComp"><div className="iframe">
          <iframe src={this.openIframe(this.state.detailInfoObj.path)}>
            <p>Your browser does not support iframes.</p>
          </iframe>
        </div></div>;
      } else if(this.state.tabState == 2){//comments
         subcomponent = <div className="subCompComment">
          <AddComment topOne={true} baseUrl={this.props.baseUrl} fileName={this.state.detailInfoObj.path} id={-1} parentFunc={this.getReplies.bind(this)}></AddComment>
          {this.state.comments.map(function(comment, index){
            return(
              <Comment paddingLeft={-15} key = {index} id={comment.id} baseUrl={this.props.baseUrl} fileName={comment.fileName} parentId={comment.parentId} text={comment.text} userName={comment.username} >
              </Comment>
            )
          }, this)}
        </div>;
      } else {
        subcomponent= <div className="subComp">
        <div className="item" >Size:  {this.state.detailInfoObj.size}</div>
        <div className="item">Type: {this.state.detailInfoObj.type}</div>
        <div className="item">Path:  {this.state.detailInfoObj.path}</div>
        {(this.state.shouldViewVersion && this.versionInfo !== null)? 
         <div>
           <div className="item" onClick={this.toggleVersionsView.bind(this, false)}>Hide Versions</div>
           <div>
            {this.versionInfo.map(function(version, index){
              return (
                <div key={index}>
                  <div className="versionItem">Number:  {version.number}</div>
                  <div className="versionItem">Author:  {version.author}</div>
                  <div className="versionItem">Message:  {version.message}</div><br />
                </div>
              );
            }, this)}
            {subcomponent}
          </div>
        </div>
        :<div className="item"  onClick={this.toggleVersionsView.bind(this,true, this.state.detailInfoObj.path)}>View Versions</div>
        }
        </div>;
      }
      
      //var tabNames = ["information", "documents", "comment"];
      component = <aside>
                <div className="close" onClick={this.closeDetail.bind(this)}>X</div>
                
                <ul className="tabs">
                  {this.tabNames.map(function(tabName, index){
                    return(<li className={this.tabClassNames[index]} key={index} onClick={this.toggleTab.bind(this, index)}>
                      {tabName}
                   </li>
                    );
                  }, this)}
                  
                </ul>
                {subcomponent}
              </aside>;
    }
    return (
      <div>
        <div className="treeGraph" ref={(ref) => this._element = ref}>
        </div>
        <div className="detailedInfo" ref={(ref) => this.detailedInfo = ref}>
            <ReactCSSTransitionGroup transitionName="asideTransition" transitionEnterTimeout={2000} 
          transitionLeaveTimeout={2000}>
		        {component}
            </ReactCSSTransitionGroup>
          </div>
        
      </div>
    )
  }
}

export default Project;