import * as d3 from "d3";
import React from 'react'
import Request from 'superagent';
import AddComment from './AddComment';
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

require("!style!css!less!./Comment.less");

class Comment extends React.Component{
  constructor(props){
    super(props);
    this.name = this.props.fileName;
    this.parentId = this.props.parentId;
    this.id = this.props.id;
    this.text = this.props.text;
    this.userName = this.props.userName;
    this.paddingLeft = this.props.paddingLeft+15; //index of each comment component

    this.state = {
      replies: null,
      needReplies: false,
      computedText: null //text after checking the flag words and converted back from HTML entities
    }
    
    this.versionInfo = null;
  }
  
  //request comments from a specific file with parentId
  getRepliesFunc(){
    let url = this.props.baseUrl+"comments/"+this.id+"/"+this.name;
    let self = this;
    Request.get(url).end(function(err, res){
      if(err){
        return console.error("failed to get comments");
      }
      var parsedData = JSON.parse(res.text);
      self.setState({
        replies: parsedData.data
      })
      console.log("comments", parsedData.data);
    });
  }
  
  //find the flag words by splittin sentence into words and searching in the database
  findIcons(text){
    let textArray = text.split(" ");
    let self =this;
    let finishedNum = 0;
    for(let i=0; i<textArray.length; i++){
      let url = this.props.baseUrl+"Icons/"+textArray[i];
      Request.get(url).end(function(err, res){
        if(err){
           return console.error("failed to get comments");
        }
        let text = JSON.parse(res.text).data;
        console.log("data", text);
        if(text.length !== 0){
          let unicode = text[0].unicode;
          console.log("unicode", unicode);
          var parsedText = self.convertReplies(unicode);
          textArray[i] = parsedText;
        }
        finishedNum = finishedNum+1;
        if(finishedNum == textArray.length){ //last one
          console.log(textArray.join(" "));
          self.setState({
            computedText: textArray.join(" ")
          });
          return textArray.join(" ");
          
        }
      });
    }
  }
  
  //unescape
  stringFilter(string){
    if(!string){
      return null;
    }  
    string = string.replace(/&amp;/g, "&");
    string = string.replace(/&lt;/g, "<");
    string = string.replace(/&gt;/g, ">");
    string = string.replace(/&quot;/g, '"');
    string = string.replace(/&#39;/g, "'");
    return string;
  }
  
  //expand or collapse the replies
  repliesExpand(){
    let nextState = this.state.needReplies?false:true;
    if(nextState == true){
      this.getRepliesFunc();
    }
    this.setState({
      needReplies: nextState
    })
  }
  
  
  //convert unicode back to text
  convertUnicode(input) {
    return input.replace(/\\u(\w\w\w\w)/g,function(a,b) {
      var charcode = parseInt(b,16);
      return String.fromCharCode(charcode);
    });
    
  }
  
  convertReplies(text){
    let convertedText = this.convertUnicode(text); 
    return convertedText;
  }
  
  render() {
    var replies, widthStyle;
    var pl = this.paddingLeft;
    console.log(pl+"px");
    var widthStyle = {
      marginLeft: pl+"px"
    }
    var computedText;
    if(this.state.computedText){
      computedText = this.state.computedText;
    }else {
      computedText = this.findIcons(this.text)
    }
    if(this.state.replies && this.state.needReplies){
      replies = this.state.replies.map(function (reply, index) {
        return (
          <Comment key={index} paddingLeft={this.paddingLeft} baseUrl={this.props.baseUrl} fileName={reply.fileName} parentId={this.id} id={reply.id} text={reply.text} userName={reply.username} ></Comment>
        );
      }, this);
    }
    return (
      <section className="comment" style={widthStyle}>
        <div className="main">
          <span className="userName">{this.stringFilter(this.userName)}: </span><span className="userText">{this.stringFilter(computedText)}</span>
        </div>
        
        <div className="replies">
          <div className="noRecursion">
            <button  onClick={this.repliesExpand.bind(this)}>{(this.state.needReplies && this.state.replies)?"hide replies":"get replies"}</button>
            <AddComment baseUrl={this.props.baseUrl} fileName={this.name} id={this.id} parentFunc={this.getRepliesFunc.bind(this)}></AddComment>
          </div>
          {replies}
        </div>
      </section>
    )
  }
}

export default Comment;