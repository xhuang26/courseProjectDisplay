const FileNode = module.exports = function FileNode(size, type, path, parent){
  this.path = path;//id
  this.size = size;
  if(path != null){
    let pathArray = path.split("/");
    this.type = this.interpretType(type, pathArray[pathArray.length-1]);
  }else{
    this.type = null;
  }
  this.children = [];
  this.parent = parent;
  
}

FileNode.prototype.isFile = function(){
  return this.type !== 'dir';
};
FileNode.prototype.addChild = function(fileNode){
  this.children.append(fileNode);
};
FileNode.prototype.getName = function(){
  pathArray = this.path.split('/');
  return pathArray[pathArray.length-1];
};
FileNode.prototype.interpretType = function(type, name){
  if(type === "dir"){
    return type;
  }
  let test = "Test."
  let image = ["png", "jpeg", "img"];
  let code = ["ruby", "class", "js", "html", "css"];

  if(name.indexOf(test) !== -1){
    return "test";
  }
  let pieces = name.split(".");
  let postfix = pieces[pieces.length-1];
  if(image.indexOf(postfix) !== -1){
    return "image";
  }
  if(code.indexOf(postfix) !== -1){
    return "code";
  }
  return "others";
}

