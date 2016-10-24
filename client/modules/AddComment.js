import * as d3 from "d3";
import React from 'react'
import Request from 'superagent';
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

require("!style!css!less!./AddComment.less");

class AddComment extends React.Component{
  constructor(props){
    super(props);
    
    this.name = this.props.fileName;
    this.parentId = this.props.id;
    
    this.repliesNum = this.props.repliesNum;
    this.state = {
      needTextInput: false,//user request to write comment
      text: "", //comment user wrote
      userName: "", //username user chose,
      
    }
  }
  
  //request replies from database and call the parent funcion which will mainly charged for update the view.
  addReply(){
    let url = this.props.baseUrl+"comments";
    let self = this;
    let requestBody = {
      "fileName": self.name,
      "parentId": this.parentId,
      "text": this.state.text,
      "userName": this.state.userName
    }
    Request.post(url).send(requestBody).end(function(err, res){
      if(err){
        return console.error("failed to post comment")
      }
      self.props.parentFunc();
      if(self.props.ancestorFunc){
        self.props.ancestorFunc();
      }
    });
  }
  
  //expand or collapse the textinput box
  TextInputExpand(){
    let nextState = this.state.needTextInput?false:true;
    this.setState({
      needTextInput: nextState
    })
  }
  
  //callback when submit button clicked
  textSubmit(event){
    console.log("text submit", this.state.text);
    this.addReply();
    this.setState({
      needTextInput: false,
      text: ""
    });
    return false;
  }
  
  //change the state of the text
  handleTextChange(event){
    this.setState({
      text: event.target.value
    })
  }
  
  //change the state of the username
  handleUserNameChange(event){
    this.setState({
      userName: event.target.value
    })
  }
  
  componentWillReceiveProps(nextProps){
    if(this.props.repliesNum !== nextProps.repliesNum){
      this.repliesNum = nextProps.repliesNum;
    }
  }
  
  render() {
    var positionStyle;
    if(this.props.topOne){
      positionStyle={left:0,width: "100px"};
    }
    return (
        <div>
          <button style={positionStyle} className="commentButton" onClick={this.TextInputExpand.bind(this)}>{this.state.needTextInput?"hide":"add comment"}</button>
          {this.repliesNum !== undefined?
            <span className="repliesNum">replies: {this.repliesNum}</span>
          :null}
          {this.state.needTextInput?
            <form className="commentForm">
              <input className="name" onChange={this.handleUserNameChange.bind(this)} value={this.state.userName} placeholder="name"/>
              <input className="text" onChange={this.handleTextChange.bind(this)} value={this.state.text} placeholder="add comment"/>
              <button className="submitButton"type="button" onClick={this.textSubmit.bind(this)} >submit</button>
            </form>
          :null}
        </div>
    )
  }
}

export default AddComment;