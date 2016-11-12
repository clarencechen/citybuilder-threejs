
var done = [];

postMessage('');

onmessage = function(e) {
	console.log('Message received from main script');
	var result;
	console.log('Posting message back to main script');
	postMessage(result);
}