//转换时间格式
function dateType(datetime) {
  function addDateZero(num) {
    return (num < 10 ? "0" + num : num);
  }
  let d = new Date(datetime);
  let formatdatetime = d.getFullYear() + '-' + addDateZero(d.getMonth() + 1) + '-' + addDateZero(d.getDate()) + ' ' + addDateZero(d.getHours()) + ':' + addDateZero(d.getMinutes());
  return formatdatetime;
}


module.exports = {
  dateType
}