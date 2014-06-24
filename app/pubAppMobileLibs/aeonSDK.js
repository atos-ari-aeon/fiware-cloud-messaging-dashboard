/**
  * Copyright (C) 2013 ATOS
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *         http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *
  * Authors: Javier García Hernández (javier.garcia@atos.net)

  */

//var io = require('socket.io-client');
// var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//Constants
var config = {
	SUBSCRIPTION_HOST : 'localhost',
	SUBSCRIPTION_PORT : '7789',
	REST_SERVER_HOST:'localhost',
	REST_SERVER_PORT:'3000'
}

var SDK_READY = {};
	SDK_READY.code = 200;
	SDK_READY.msg = "SDK Ready";

var INFRASTRUCTURE_DOWN = {};
	INFRASTRUCTURE_DOWN.error = true;
	INFRASTRUCTURE_DOWN.code = 103;
	INFRASTRUCTURE_DOWN.msg = "Communication infrastructure down.";

var URL_ERROR = {};
	URL_ERROR.error = true;
	URL_ERROR.code = 104;
	URL_ERROR.msg = "Bad URL";

var SDK_PUB_MODE = {};
	SDK_PUB_MODE.error = true;
	SDK_PUB_MODE.code = 105;
	SDK_PUB_MODE.msg = "Operation Denied. SDK operating in Publication Mode.";

var SDK_SUB_MODE = {};
	SDK_SUB_MODE.error = true;
	SDK_SUB_MODE.code = 105;
	SDK_SUB_MODE.msg = "Operation Denied. SDK operating in Subscription Mode.";

var SUBSCRIPTION_ERROR = {};
	SUBSCRIPTION_ERROR.error = true;
	SUBSCRIPTION_ERROR.code = 106;
	SUBSCRIPTION_ERROR.msg = "Subscription not found.";

var REST_SERVER_ERROR = {};
	REST_SERVER_ERROR.error = true;
	REST_SERVER_ERROR.code = 107;
	REST_SERVER_ERROR.msg = "Cannot connect with the server.";

//Loads the socket.io library
function loadLibraries(){

	jQuery(document).ready(function($){
	     /**
	     * function to load a given js file 
	     * tip from fisherman: you can use jquery function instead of this custom function 
	     * http://api.jquery.com/jQuery.getScript
	     */ 
	    loadJS = function(src) {
	       var jsLink = $("<script>");
	       $("head").append(jsLink);
	       jsLink.attr({
	           type: "text/javascript",
	           src: src
	       });
	    }; 	    

	    // load the js file 
	    loadJS("http://"+config.SUBSCRIPTION_HOST+":"+config.SUBSCRIPTION_PORT+"/socket.io/socket.io.js");
	    
	});
}

loadLibraries();

function getSubID(url){
	//Example URL: http://endpoint:port/subscribe/:subID
	try{
		var tmp = url.split('/');
		return tmp[tmp.length-1];
	}
	catch(err){
		return URL_ERROR;
	}

}

var controlEmpty = function controlEmpty(){

}

function internalControl(response, control, socket){	

	//Unsubscribe ok
	if(response != undefined){
		if(response.code == 450)
			socket.removeAllListeners();
	}	

	control(response);
}

function setControl(control){
	if(control == null)
			control = controlEmpty;
}

function subscribeToQueue(myObject, subscriptionData, control, deliveredMessage){

	var localSocket = myObject.socket;

	//var subscription = this.subscription;

	//Store the subscription for future needs
	try{					 	
 		subscription = subscriptionData; 	 	

 		myObject.subscription = subscription;				 	 				 	 	

 	}catch(e){
 		//Return the error response
 		subscription = null;
 		
 		internalControl(response, control);			 	 		
 		
 	}			 	 					

	if(!localSocket.socket.connected){						
	    localSocket.once('connect',function subscribeMe(){		
	
			if(subscription != null){
				
				localSocket.emit('subscribeQueue', subscription);
				
			    localSocket.on("message-" + subscription.subkey, function manageDataMessages(data){				
					deliveredMessage(data);
				});	 
			}
		});
	}
	else{
		localSocket.emit('subscribeQueue', subscription);
		localSocket.on("message-" + subscription.subkey, function manageDataMessages(data){				
					deliveredMessage(data);
				});
	}

	localSocket.on('control', function manageControlMessages(data){  				
	   	internalControl(data, control, localSocket);					   	
	});

	localSocket.on('disconnect', function disconnect(){			
		internalControl(INFRASTRUCTURE_DOWN, control, localSocket);
	});
}

function AeonSDK(url, subscriptionData){	

	this.socket_server_endpoint = 'http://'+config.SUBSCRIPTION_HOST+':'+config.SUBSCRIPTION_PORT;
	this.rest_server_endpoint = 'http://'+config.REST_SERVER_HOST+':'+config.REST_SERVER_PORT;
	this.mode = '';		
	this.subscription = null;
	this.control = null;

	//Detects if the url is a publish or a subscription url
	if(url.indexOf("publish") != -1){ //Publish url 		
		this.mode = "publish";

		this.url = url;
		
	}
	else if(url.indexOf("subscribe") != -1 ){ //subscription url

		if(subscriptionData != undefined){
			this.subscriptionData = subscriptionData;

			this.mode = "subscribe";		

			this.url = url;

			this.url += '?id='+this.subscriptionData.id+'&desc='+this.subscriptionData.desc;
		}
		else
			this.mode = "error";

	}		
	else
		this.mode = "error";
		
}

AeonSDK.prototype.getSubscription = function(){
	return this.subscription;
}

AeonSDK.prototype.setSubscription = function(subscription){
	this.subscription = subscription;
}

AeonSDK.prototype.subscribe = function subscribe(control, deliveredMessage){	

	var myObject = this;

	setControl(control);

	this.control = control;

	if(this.mode == 'subscribe'){

		// else
		// 	this.control = controlEmpty;
		
		if(this.subscriptionData != null){

			this.subID = getSubID(this.url);								

			var socketServer = this.socket_server_endpoint;

			//Connect to the SocketIO server			 	 	
			this.socket = io.connect(socketServer, {'force new connection': true});
													

			//Subscribe throught the API to the mongoDB
			doHTTPRequest(this.url,'GET', null, function(response){
								
				if(response.code == 200){			

					//Subscribe to a queue
					subscribeToQueue(myObject, response.result[0], control, deliveredMessage);
					
				}
				else
					internalControl(response, control);					
			});					

			
		}
		
	}
	else if(this.mode == "publish")
		internalControl(SDK_PUB_MODE, control);		
	else
		internalControl(URL_ERROR, control);
    		
}

AeonSDK.prototype.pauseSubscription = function pauseSubscription(control){
	
	setControl(control);

	if(this.mode == 'subscribe'){
		if(this.subscription != null)
			this.socket.emit('unSubscribeQueue', this.subscription);	
	}
	else
		internalControl(SDK_PUB_MODE, control);			
	
}

AeonSDK.prototype.continueSubscription = function continueSubscription(subscription, control){	

	setControl(control);

	if(this.mode == 'subscribe'){
		this.subscription = subscription;

		if(this.subscription != null)
			this.socket.emit('subscribeQueue', this.subscription);
	}
	else
		internalControl(SDK_PUB_MODE, control);					
	
}

AeonSDK.prototype.deleteSubscription = function deleteSubscription(control){
	
	setControl(control);

	if(this.mode == 'subscribe'){
		this.socket.emit('unSubscribeQueue', this.subscription);

		//Delete Queue from the API
		var url = this.rest_server_endpoint+'/subscribe/'+this.subID;
		
		doHTTPRequest(url, 'DELETE', this.subscription);			
						
	}
	else
		internalControl(SDK_PUB_MODE, control);				
}

AeonSDK.prototype.publish = function publish(data,control){	

	setControl(control);

	if(this.mode == 'publish'){
		doHTTPRequest(this.url, 'POST', data, function (response){
			
			//if(response.code == 107)
				internalControl(response, control);

			
		});			
	}
	else	
		internalControl(SDK_SUB_MODE, control);			

}

//Internal function to manage the XHR requests
var doHTTPRequest = function doHTTPRequest(url, method, data, next){

	var http = null;
	
	http = new XMLHttpRequest();

	http.addEventListener('error', function(error){		
		next(REST_SERVER_ERROR);
	}, false);

	if(method == 'GET'){
		http.open(method, url, true);
		
		http.onreadystatechange = function() {			
		    if (http.readyState == 4 && http.status==200) {				    		      
		        	next(JSON.parse(http.responseText));
		    }
		}

		http.send(null);	

		
	}		

	if(method == 'POST' || method == 'DELETE'){
		
		http.open(method, url, true);
		
		http.setRequestHeader("Content-Type","application/json");

		http.onreadystatechange = function() {			
		    if (http.readyState == 4 && http.status==200) {				    
		        if(method == "POST")
		        	next(JSON.parse(http.responseText));
		    }
		}

		http.send(JSON.stringify(data));

	}
}

/************/
/* DEMO APP */
/************/

// var data = {id:"webapp", desc:"webapp"};
// var code = 0;
// var sdk_subscribe = new AeonSDK("http://localhost:3000/subscribe/4e59b362-67d6-4220-808d-5e3857f278c7", data, function controlFn(data){
// 	 console.log("Control_SUB:");
// 	 console.log(data);		 
// });

// var sdk_publish = new AeonSDK('http://localhost:3000/publish/29b85779-4e6f-43cc-9d77-0e4eca4b06b5', null, function controlFn2(data){
// 	 console.log("Control_PUB:");
// 	 console.log(data);		 
// });


// sdk_subscribe.subscribe(function deliveredMessage(data){
// 	console.log("Message:");
// 	console.log(data);
// });

// setTimeout(function() {
// 	sdk_subscribe.publish({message:"Esto mola"});
// }, 1000);

// setTimeout(function() {
// 	console.log("Pausando...")
//     sdk_subscribe.pauseSubscription();

//     sdk_publish.publish({message:"Parece q estamos pausados"});

// 	setTimeout(function() {
// 		console.log("Continue...")
// 	    sdk_subscribe.continueSubscription();

// 	    sdk_publish.publish({message:"Ahora recibo todo!"});

// 		setTimeout(function() {
// 			console.log("Borrando...")
// 		    sdk_subscribe.deleteSubscription();

// 		}, 3000);
// 	}, 3000);

// }, 3000);


// sdk_publish.subscribe(function deliveredMessage(data){
// 		console.log("Message:");
// 		console.log(data);
// });