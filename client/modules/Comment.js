import * as d3 from "d3";
import React from 'react'
import Request from 'superagent';
import AddComment from './AddComment';
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var Up = require('react-icons/lib/fa/chevron-up');
var Down = require('react-icons/lib/fa/chevron-down');
require("!style!css!less!./Comment.less");

class Comment extends React.Component{
  constructor(props){
    super(props);
    this.name = this.props.fileName;
    this.sorts = ["unsorted", "byUpvote", "byReplies"];
    this.parentId = this.props.parentId;
    this.id = this.props.id;
    this.text = this.props.text;
    this.userName = this.props.userName;
    this.repliesNum = this.props.repliesNum;
    this.paddingLeft = this.props.paddingLeft+15; //index of each comment component
    this.sort = this.props.sort;
    this.state = {
      replies: null,
      repliesNum: this.props.repliesNum,
      needReplies: false,
      computedText: null, //text after checking the flag words and converted back from HTML entities,
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
      self.repliesNum = parsedData.data.length;
      /*self.setState({
        replies: parsedData.data
      })*/
      self.changeSort(self.props.sort, parsedData.data);
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
        if(text.length !== 0){
          let unicode = text[0].unicode;
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
  
  updateVote(id, isUp, newVote){
    console.log("updateVote");
    let self = this;
    let url = this.props.baseUrl+"Comment/"+id+"/"+isUp;
      Request.get(url).end(function(err, res){
        if(err){
           return console.error("failed to update comments");
        }
        if(JSON.parse(res.text).data.length !== 0){
          self.props.parentFunc();
        }
    });
  }
  
  changeSort(newSort, oldComments){
    let newComments = oldComments.slice();
    console.log("comment old", newComments);
    if(newSort == this.sorts[1]){//by upvote
      console.info("by upvote");
      newComments = newComments.sort(function(a,b){
        if(b.upVote !== a.upVote){
          return b.upVote-a.upVote;
        } else {
          return a.downVote-b.downVote;
        }
      });
    } else if(newSort == this.sorts[2]){//by replies
      console.info("by replies");
      newComments = newComments.sort(function(a,b){
        return b.repliesNum-a.repliesNum;
      });
    }
    console.log("comment new", newComments);
    this.setState({
      replies: newComments,
      needReplies: true
    });
  }
  
  componentWillUpdate(nextProps, nextState){
    console.log("get here");
    console.log("this sort", this.props.sort);
    console.log("next sort", nextProps.sort);
    if(this.state.replies!== null && this.props.sort !== nextProps.sort){
      this.changeSort(nextProps.sort, this.state.replies);
    }
  }
  
  render() {
    var replies, widthStyle;
    var pl = this.paddingLeft;
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
          <Comment sort = {this.props.sort} parentFunc = {this.getRepliesFunc.bind(this)} repliesNum = {reply.repliesNum} key={reply.id}  paddingLeft={this.paddingLeft} baseUrl={this.props.baseUrl} fileName={reply.fileName} parentId={this.id} id={reply.id} text={reply.text} userName={reply.username} upVote={reply.upVote} downVote={reply.downVote} ></Comment>
        );
      }, this);
    }
    return (
      <section className="comment" style={widthStyle}>
        <div className="main">
          <span className="userName">{this.stringFilter(this.userName)}: </span><span className="userText">{this.stringFilter(computedText)}</span>
          <div className="votes">
            <span className="upvote" onClick={this.updateVote.bind(this, this.id, 1)}>
              <Up />
              <span className="text">{this.props.upVote}</span>
            </span>
            <span className="downvote" onClick={this.updateVote.bind(this, this.id, 0)}>
              <Down />
              <span className="text">{this.props.downVote}</span>
            </span>
          </div>
        </div>
        
        <div className="replies">
          <div className="noRecursion">
            <button  onClick={this.repliesExpand.bind(this)}>{(this.state.needReplies && this.state.replies)?"hide replies":"get replies"}</button>
            <AddComment repliesNum={this.repliesNum} baseUrl={this.props.baseUrl} fileName={this.name} id={this.id} ancestorFunc = {this.props.parentFunc} parentFunc={this.getRepliesFunc.bind(this)}></AddComment>
          </div>
          {replies}
        </div>
      </section>
    )
  }
}

export default Comment;