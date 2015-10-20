/**
    Copyright (C) 2014 ATOS

    This file is part of AEON.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

    Authors: Javier García Hernández (javier.garcia@atos.net)
             Baris Kara (baris.kara@atos.net)

  */

/*
	Controller for the map in the subscription app
*/

function mapCtrl($scope, $rootScope, config){

    // google.maps.visualRefresh = true;
    function initialize() {
        var mapOptions = {
            center: new google.maps.LatLng(40.435510, -3.700371),
            zoom: 3,
            minZoom: 1,
            disableDefaultUI: true,
            mapTypeControl: true,
        };

        $rootScope.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    }

    google.maps.event.addDomListener(window, 'load', initialize);

}

/*
	Controller for the menu bar
*/
function configCtrl($scope, $rootScope, $location, Entity, Channel, config){

    $scope.subscriptionFields = [];
    $rootScope.subscriptionURL = [];
    $scope.startSub = [];
    $scope.startButtonShown = [];
    $scope.pauseButtonShown = [];
    $scope.continueButtonShown = [];
    $scope.stopButtonDisabled = [];
    $scope.channelSelectorDisabled = [];
    $rootScope.sdk = [];
    $scope.subURL = [];
    $scope.showControlMessage = [];
    $scope.controlReceivedMessage = [];
    $scope.notAttached = [];
    $scope.messageColor = [];

    $scope.showMessage = false;

    var coordinates = {
        "latitude": "",
        "longitude" : ""
    }
    $scope.codeContentJSON = JSON.stringify(coordinates,null,2);
    $scope.badMode = false;

    $scope.channelsAvailables = [];

    //Variables for the snippets

    $scope.cmCodeJS = {
        lineWrapping : true,
        lineNumbers: true,
        readOnly: 'nocursor',
        theme: 'default',
        mode: 'javascript',
    };

    $scope.cmCodeHTML = {
        lineWrapping : true,
        lineNumbers: true,
        readOnly: 'nocursor',
        theme: 'default',
        mode: 'xml',
    };

    $scope.cmCodeJSON = {
        lineWrapping : true,
        lineNumbers: true,
        readOnly: 'nocursor',
        theme: 'default',
        mode: 'javascript'
    };

    //Variables for the snippets
    $scope.pathSDK = '<script src="path/to/aeonSDK.js"></script>';
    $scope.pathSocketIO = '<script src="path/to/socket.io.js"></script>';
    $scope.codeSnippet =["var sdk = new AeonSDK(subUrl, \n           subscription);","sdk.subscribe(msgCallback);"];

    $scope.codeContentHTML = $scope.pathSDK + '\n' + $scope.pathSocketIO ;
    $scope.codeContentJS =  $scope.codeSnippet[0] + '\n\n' + $scope.codeSnippet[1];


    Entity.getEntities().then(function ok(data){
        results = data.result;
        for (var i=0; i< results.length; i++){
            entityId = results[i]._id;
            Channel.getChannels(entityId).then(function ok(data){
                channels = data.result;
                for (var j=0; j< channels.length; j++){
                    channelName = channels[j].channelname;
                    channelSubURL = channels[j].subID;
                    $scope.channelsAvailables.push({ "name": channelName,
                                                    "subURL": "//" + $location.host()+":"+config.AEON_PORT+"/subscribe/" + channelSubURL,
                                                    "shortSubURL": "//.../subscribe/" + channelSubURL
                                                    //                                                    + channelSubURL.substring(0, 8) +"..."
                                                    //                                                    + channelSubURL.substring(30, 35) + "..."
                                                   });


                }


            }, function error(){

            })
        }

    }, function error(data){
        $scope.channelSelectorDisabled[0] = true;
        $scope.notReachable = true;
        $scope.addChannelDisabled = true;
        $scope.removeChannelDisabled = true;
    });

    var infowindow;

    function initializeFirstChannel(){

        $scope.startSub.push(false);
        $scope.startButtonShown.push(true);
        $scope.pauseButtonShown.push(false);
        $scope.continueButtonShown.push(false);
        $scope.stopButtonDisabled.push(true);
        $scope.channelSelectorDisabled.push(false);
        $scope.showControlMessage.push(false);
        $scope.controlReceivedMessage.push('');
        $scope.subscriptionURL.push('');
        $scope.subscriptionFields.push(1);
        $scope.subURL.push("");
        $scope.notAttached.push(false);
        $scope.messageColor.push("blue");

    }

    initializeFirstChannel();

    function setDataToMap(message, channel){

         $scope.showMessage = true;

        //Message for the snippet
        var coordinates = {
            "latitude": message.latitude,
            "longitude" : message.longitude
        }

        //Message for the snippet
        //$scope.receivedMessage = '';
        //        var tmp = JSON.stringify(coordinates).split(',');
        //        for(var i=0;i< tmp.length-1; i++)
        //            $scope.receivedMessage += (tmp[i]+', ');
        //        $scope.receivedMessage += (tmp[i]);
        $scope.codeContentJSON = JSON.stringify(coordinates,null,2);
        //$scope.codeContentJSON = coordinates;
        //Add marker to the map with the received coordinates
        //$rootScope.map.markers.push(coordinates);

        var content = '<div id="content">'+
            '<h3>Position</h3>'+
            '<div id="bodyContent">'+
            '<p>'+message.longitude+" , "+message.latitude+'</p>'+
            '</div>'+
            '</div>';





        if(channel == 0)
            var iconType = "//maps.google.com/mapfiles/ms/icons/red-dot.png";
        else if(channel == 1)
            var iconType = "//maps.google.com/mapfiles/ms/icons/blue-dot.png";
        else
            var iconType = "//maps.google.com/mapfiles/ms/icons/green-dot.png";

        var marker = new google.maps.Marker({
            map:$rootScope.map,
            draggable:true,
            animation: google.maps.Animation.DROP,
            icon: iconType,
            position: new google.maps.LatLng(message.latitude, message.longitude)
        });

        google.maps.event.addListener(marker, 'click', function() {
            if(infowindow)
                infowindow.close();

            infowindow = new google.maps.InfoWindow({
                content: content
            });

            infowindow.open($rootScope.map,marker);
        });

        //Measures the time spent in receiving the message
        if("clientDate" in message){

            var now = moment();

            var clientDate = moment(message.clientDate,"D/M/YYYY HH:mm:ss:SSS ZZ");

            $scope.timeOfArrival = now.diff(clientDate);

        }


        //Re-render the map
        $scope.$apply();


    }

    function setMessage(message, index){
        switch(message.code){
                //Sets the message in all the boxes
            case 0:
            case 3:
                for(var i = 0; i < $scope.controlReceivedMessage.length; i++)
                    $scope.controlReceivedMessage[i] = message.msg;
                break;
            case 100:
            case 101:
                $scope.badMode = true;
                break;
                //Sets the message in the selected box
            case 1:
            case 50:
            case 201:
            case 202:
            case 250:
            case 251:
            case 252:
            case 253:
            case 450:
                $scope.controlReceivedMessage[index] = message.msg;
                break;
        }

        if(!$scope.showControlMessage[index])
            $scope.showControlMessage[index] = true;

        if("error" in message){
            if(!message.error)
                $scope.messageColor[index] = "Blue";
            else
                $scope.messageColor[index] = "Red";

            $scope.$apply();
        }
        else
            $scope.messageColor[index] = "Blue";
    }

    //Start listening the subscription url
    $scope.submitURL = function(index){


        $scope.selectedIndex = index;

        if (($scope.subscriptionURL[index] == "") || ($scope.subscriptionURL[index] == null)){
            $scope.notAttached[index] = true;
            return;
        } else {
            $scope.notAttached[index] = false;
        }


        $scope.startSub[index] = true;
        $scope.startButtonShown[index] = false;
        $scope.pauseButtonShown[index] = true;
        $scope.stopButtonDisabled[index] = false;
        $scope.channelSelectorDisabled[index] = true;

        $scope.subscriptionURL[index] = $scope.subscriptionURL[index];

        var data = {
            id:"demo-sub",
            desc:"demo-sub"
        };

        //Instantiates the AEON SDK
        if($rootScope.sdk[index] == null || $rootScope.sdk[index] == undefined || $scope.badMode ){

            $rootScope.sdk[index] = new AeonSDK($rootScope.subscriptionURL[index].subURL, data);
        }

        $rootScope.sdk[index].subscribe(function controlFn(data){
            setDataToMap(data, index);

        }, function deliveriedMessage(message){
            setMessage(message, index);
        });


    }

    //Pauses the current subscription
    $scope.pauseURL = function(index){
        $scope.selectedIndex = index;
        $scope.pauseButtonShown[index] = false;
        $scope.continueButtonShown[index] = true;
        $scope.channelSelectorDisabled[index] = true;

        $rootScope.sdk[index].pauseSubscription();
    }

    //Pauses the current subscription
    $scope.continueURL = function(index){
        $scope.selectedIndex = index;
        $scope.pauseButtonShown[index] = true;
        $scope.continueButtonShown[index] = false;
        $scope.channelSelectorDisabled[index] = true;

        $rootScope.sdk[index].continueSubscription();
    }

    //Stops listening the subscription url
    $scope.stopURL = function(index){

        $scope.startSub[index] = false;
        $scope.startButtonShown[index] = true;
        $scope.pauseButtonShown[index] = false;
        $scope.continueButtonShown[index] = false;
        $scope.stopButtonDisabled[index] = true;
        $scope.channelSelectorDisabled[index] = false;
        $scope.subURL[index] = "";
        $rootScope.sdk[index].deleteSubscription();

        $rootScope.sdk[index] = null;

    }


    $scope.addChannel = function(){
        var num = $scope.subscriptionFields.length;

        if(num < 3){
            $scope.startSub.push(false);
            $scope.startButtonShown.push(true);
            $scope.pauseButtonShown.push(false);
            $scope.continueButtonShown.push(false);
            $scope.stopButtonDisabled.push(true);
            $scope.channelSelectorDisabled.push(false);
            $scope.showControlMessage.push(false);
            $scope.controlReceivedMessage.push('');
            $scope.subscriptionURL.push('');
            $scope.subscriptionFields.push($scope.subscriptionFields[$scope.subscriptionFields.length-1]+1);
            $rootScope.sdk.push(undefined);
        }
    }

    $scope.removeChannel = function(){
        var num = $scope.subscriptionFields.length;
        var index = $scope.subscriptionFields.length - 1;
        if(num > 1){
            $scope.subURL[index] = "";

            if ($rootScope.sdk[index] != undefined)
                $rootScope.sdk[index].deleteSubscription();

            $scope.startSub.splice(num-1,1);
            $scope.startButtonShown.splice(num-1,1);
            $scope.pauseButtonShown.splice(num-1,1);
            $scope.continueButtonShown.splice(num-1,1);
            $scope.stopButtonDisabled.splice(num-1,1);
            $scope.channelSelectorDisabled.splice(num-1,1);
            $scope.showControlMessage.splice(num-1,1);
            $scope.controlReceivedMessage.splice(num-1,1);
            $scope.subscriptionURL.splice(num-1,1);
            $scope.subscriptionFields.splice(num-1,1);
            $scope.notAttached.splice(num-1,1);
        }
    }




}
