function ToCamelName(name){
  const lowerName = name.toLowerCase();
  const arr = lowerName.split("-");
  let result = arr[0];
  for (let i = 1;i < arr.length;i++){
    const tmp = arr[i];
    result += tmp.charAt(0).toUpperCase() + tmp.substring(1);
  }
    
  return result;
}

module.exports = { 
  ToCamelName 
};