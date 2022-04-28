const _ = require('lodash');

module.exports = {
	removeUnicode: (str) => {
		let responseStr;
		responseStr = _.trim(str);
		responseStr = _.replace(responseStr, /:/g, '-');
		responseStr = responseStr.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
		responseStr = responseStr.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
		responseStr = responseStr.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
		responseStr = responseStr.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
		responseStr = responseStr.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
		responseStr = responseStr.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
		responseStr = responseStr.replace(/đ/g, 'd');
		responseStr = responseStr.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
		responseStr = responseStr.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
		responseStr = responseStr.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
		responseStr = responseStr.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
		responseStr = responseStr.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
		responseStr = responseStr.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
		responseStr = responseStr.replace(/Đ/g, 'D');
		responseStr = responseStr.replace(/ /g, '-');
		responseStr = _.replace(responseStr, /[^a-zA-Z0-9\s-]/g, '');
		return responseStr.toLowerCase();
	}
};
