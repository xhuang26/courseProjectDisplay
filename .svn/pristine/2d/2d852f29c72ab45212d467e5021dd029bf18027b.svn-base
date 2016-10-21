import React from 'react'
import { Link } from 'react-router'
import Request from 'superagent';
var {EventEmitter} = require('fbemitter');

require("!style!css!less!./App.less");

class App extends React.Component{
  constructor(props){
    super(props);	
    this.state = {
      curProject: ""
    }
    this.baseServerUrl = "http://localhost:4000/";
  };
  componentWillMount(){
    this.emitter = new EventEmitter();
    //this.emitter.addListener("curProjectChange")
  }
  render() {
    return (
      <div className="container">
        <header>
          <div className="title"><p>WEB PORTFOLIO</p></div>
          <div className="nav">
            <div className="nav-item"><Link to="/">main</Link></div>
            <div className="nav-item"><Link to="/projects">projects</Link></div>
          </div>
        </header>
        {this.props.children && React.cloneElement(this.props.children, {
              emitter: this.emitter, baseUrl: this.baseServerUrl
            })}
      </div>
    )
  }
}

export default App;