
import React from 'react';
import { Link } from 'react-router';
import Request from 'superagent';
import classNames from 'classnames';

require("!style!css!less!./Projects.less");
class Projects extends React.Component{
  constructor(props){
    super(props);	
    this.state = {
      projects: [],
      curProject: null
    }
  };
  
  changeCurProject(){
    
  }
  
  getName(path){
    var nameArray = path.split("/");
    return nameArray[nameArray.length-1];
  }
  
  componentWillMount(){
    let self = this;
    let url = this.props.baseUrl+"projects";
    Request.get(url)
      .end(function(err, res){
        if(err){
          return console.error("failed to load projects")
        }
        
        var parsedData = JSON.parse(res.text);
        
        var jsonData = parsedData.data;
        console.log(jsonData);
        if(jsonData.length > 0){
          self.setState({
            projects: jsonData
          });
        }
        console.log(jsonData);
      });
  }
  render() {
    var nameClass = classNames('text', 'name');
    return (
        <div className="items">
          {this.state.projects.map(function(project, index){
            return (
              <div className="item" key={index}>
                <div className="image"></div>
                <div className="texts">
                  <div className={nameClass}><Link to = {"Project/"+project.name}>{this.getName(project.name)}</Link></div>
                  <div className="text">Revision: {project.version}</div>
                </div>
                <div className="texts">
                  <div className="text">Summary: {project.summary}</div>
                  <div className="text">Path: {project.name}</div>
                </div>
                <div className="texts">
                  <div className="text">{(new Date(project.date)).toDateString()}</div>
                </div>
              </div>
            )
          }, this)}
        </div>
    )
  }
}

export default Projects;