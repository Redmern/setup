/************PROCESS DATA TO/FROM Client****************************/
var toggler = document.getElementById('GPIO26');
var slider = document.getElementById("GPIO12");
var output = document.getElementById("value");


output.innerHTML = slider.value;

slider.oninput = function() {
  socket.emit('GPIO12',this.value)
  output.innerHTML = this.value;
}

var socket = io(); //load socket.io-client and connect to the host that serves the page
window.addEventListener("load", function(){ //when page loads
  if( isMobile.any() ) {
//    alert('Mobile');  
    document.addEventListener("touchstart", ReportTouchStart, false);
    document.addEventListener("touchend", ReportTouchEnd, false);
    document.addEventListener("touchmove", TouchMove, false);
  }else{
//    alert('Desktop');  
    document.addEventListener("mouseup", ReportMouseUp, false);
    document.addEventListener("mousedown", ReportMouseDown, false);
  }
  
});

//Update gpio feedback when server changes LED state
socket.on('GPIO26', function (data) {  
  if	(data){
    data = 0
  }
  else data = 1
//  console.log('GPIO26 function called');
//  console.log(data);
  var myJSON = JSON.stringify(data);
//  console.log(myJSON);
  toggler.checked = data;
//  console.log('GPIO26: '+data.toString());
});

socket.on('GPIO12', function (data){
  console.log('GPIO12 function called');
  var myJSON = JSON.stringify(data);
  slider.value = data
  output.innerHTML = data;
});

function ReportTouchStart(e) {
  var y = e.target.previousElementSibling;
  if (y !== null) var x = y.id;
  if (x !== null) { 
  // Now we know that x is defined, we are good to go.
    if (x === "GPIO26") {
 //     console.log("GPIO26 toggle");
      socket.emit("GPIO26T");  // send GPIO button toggle to node.js server
    } 
  }

  if (e.target.id === "GPIO26M") {
    socket.emit("GPIO26", 0); 
    toggler.checked = 0;
  } 
}

function ReportTouchEnd(e) {
  if (e.target.id === "GPIO26M") {
    socket.emit("GPIO26", 1); 
    toggler.checked = 1;
  } 
}

function ReportMouseDown(e) {
  
  var y = e.target.previousElementSibling;
  if (y !== null) var x = y.id;
  if (x !== null) { 
  // Now we know that x is defined, we are good to go.
    if (x === "GPIO26") {
 //     console.log("GPIO26 toggle");
      socket.emit("GPIO26T");  // send GPIO button toggle to node.js server
    } 
  }
  
  if (e.target.id === "GPIO26M") {
 //   console.log("GPIO26 pressed");
    socket.emit("GPIO26", 0); 
    toggler.checked = 0;
  }
}

function ReportMouseUp(e) {
  if (e.target.id === "GPIO26M") {
    socket.emit("GPIO26", 1); 
    toggler.checked = 1;
  } 
}

function TouchMove(e) {

}

/** function to sense if device is a mobile device ***/
// Reference: https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser

var isMobile = {
  Android: function() {
      return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function() {
      return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function() {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function() {
      return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function() {
      return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
  },
  any: function() {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
  }
};


