//获取当前时间
let myDate = new Date()
let year = myDate.getFullYear(); //获取完整的年份(4位,1970-????)
let month = myDate.getMonth() + 1; //获取当前月份(0-11,0代表1月)
let day = myDate.getDate(); //获取当前日(1-31)
let hour = myDate.getHours(); //获取当前小时数(0-23)
let minute = myDate.getMinutes(); //获取当前分钟数(0-59)

//获取默认年份
let years = []
for (let i = year; i < (year + 4); i++) {
  years.push(i + '')
}

//获取默认月份
let months = []
for (let i = month; i <= 12; i++) {
  months.push(i > 9 ? (i + '') : ('0' + i))
}

//获取默认日份
let days = []
let end = 31
if (year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)) { //为闰年
  end = 29
} else {
  end = 28
}
switch (month) {
  case 1:
  case 3:
  case 5:
  case 7:
  case 8:
  case 10:
  case 12:
    end = 31
    break;
  case 4:
  case 6:
  case 9:
  case 11:
    end = 30
    break;
}
for (let i = day; i <= end; i++) {
  days.push(i > 9 ? (i + '') : ('0' + i))
}

//获取默认小时
let hourss = []
for (let i = hour; i <= 23; i++) {
  hourss.push(i > 9 ? (i + '') : ('0' + i))
}

//获取默认分钟
let minutes = []
for (let i = minute; i <= 59; i++) {
  minutes.push(i > 9 ? (i + '') : ('0' + i))
}

//时间日期天数
export default {
  initYear: years, //默认年份
  initMonth: months, //默认月份
  initDay: days, //默认日份
  initHour: hourss, //默认小时
  initMinute: minutes, //默认分钟
  month: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'], //月份
  day1: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'], //大月日份
  day2: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'], //小月日份
  day3: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29'], //润年2月日份
  day4: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28'], //平年2月日份
  hours: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'], //小时
  minutes: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'] //分钟
}