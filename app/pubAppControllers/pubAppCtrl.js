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
  Controller for the publication app
*/

function publicationCtrl($scope, $rootScope){			

    var coordinates = {
        "latitude": "",
        "longitude" : ""
    }
    $rootScope.codeContentJSON = JSON.stringify(coordinates,null,2); 

    //define the menu bar tabs
    $scope.tabs = [
        {
            heading: 'Random Position',
            latitude:'',
            longitude:'',
            showFindme: false,
            showRandom: true,
            onlyRead: true,
            coordsEmpty: false,
            serverDown: false,
            tab:''
        },
        {
            heading: 'My Position',
            latitude:'',
            longitude:'',
            showFindme: true,
            showRandom: false,
            onlyRead: true,
            coordsEmpty: false,
            serverDown: false,
            tab:''
        }//,
        // {
        //     heading: 'Manual Position',
        //     latitude:'',
        //     longitude:'',
        //     showFindme: false,
        //     showRandom: false,
        //     onlyRead: false,
        //     coordsEmpty: false,
        //     serverDown: false,
        //     tab:''
        // }	

    ]	

    //Determines if the 'Find me' button has to be shown
    $scope.showFindMeButton = function(index){		
        if($scope.tabs[index].showFindme)
            return true;
        else return false;
    }

    //Determines if the 'Random' button has to be shown
    $scope.showRandomButton = function(index){		
        if($scope.tabs[index].showRandom)
            return true;
        else return false;
    }

    //Determines if the text box has to be readOnly or not
    $scope.isReadOnly = function(index){
        if($scope.tabs[index].onlyRead)
            return true;
        else return false;
    }

    //Publish the coordinates
    $scope.publish = function(index){		

        $rootScope.selectedIndex = index;

        //Controls that the coordinates are filled.		
        if($rootScope.publicationURL == undefined || $rootScope.publicationURL == ''){	
            $rootScope.pubUrlEmpty = true;
            return;
        }

        if($rootScope.startButtonDisabled == false){	
            $rootScope.notAttached = true;
            return;
        }

        if($scope.tabs[index].latitude == '' || $scope.tabs[index].longitude == ''){
            $scope.tabs[index].coordsEmpty = true;
            return;
        }

        //JSON to invoke the method with the coordinates
        var coordinates = {
            latitude: '',
            longitude: '',
            clientDate: moment().format("D/M/YYYY HH:mm:ss:SSS ZZ")
        }

        //Parse to float the values of the coordinates
        coordinates.latitude = parseFloat($scope.tabs[index].latitude);
        coordinates.longitude = parseFloat($scope.tabs[index].longitude);			

        //Publication;
        $rootScope.sdk.publish(coordinates, function(message){

            if(message.code == 0)			 	
                $scope.tabs[index].serverDown = true;			 				 
            else{
                $rootScope.showMessage = true;
                $scope.tabs[index].serverDown = false;			
            }

            $scope.getRandomPoint(0);

            $scope.$apply();
        });


        var tmp = JSON.stringify(coordinates).split(',');
        $rootScope.sentMessage = '';
        for(var i=0;i< tmp.length-1; i++)			
            $rootScope.sentMessage += (tmp[i]+', ');
        $rootScope.sentMessage += (tmp[i]);		

        $rootScope.codeContentJSON = JSON.stringify(coordinates,null,2); 
        console.log($rootScope.codeContentJSON);

    }

    //Gets the current location
    $scope.findme = function(index){		

        $scope.geolocationAvailable = navigator.geolocation ? true : false;

        if($scope.geolocationAvailable){
            navigator.geolocation.getCurrentPosition(function(position){
                $scope.tabs[index].latitude = position.coords.latitude;
                $scope.tabs[index].longitude = position.coords.longitude;
            });
        }
    }

    function getRandomInRange(from, to, fixed) {
        return (Math.random() * (to - from) + from).toFixed(fixed) * 1;	    
    }

    //Gets a random point
    $scope.getRandomPoint = function(index){

        var latitude = 0;
        var longitude = 0;
        var maxLat = 90;
        var minLat = -90;
        var maxLong = 180;
        var minLong = -180;

        //Random value for latitude
        latitude = getRandomInRange(minLat, maxLat, 5);

        //Random value for longitude
        longitude = getRandomInRange(minLong, maxLong, 5);

        $scope.tabs[index].latitude = latitude;
        $scope.tabs[index].longitude = longitude;
    }

    $scope.getRandomPoint(0);

    //Shows an alert message if the coordinates are not filled
    $scope.showCoordsAlert = function(index){		

        return $scope.tabs[index].coordsEmpty;		
    }

    $scope.showServerDown = function(index){		

        return $scope.tabs[index].serverDown;		
    }

    //Watch the change of the tabs
    $scope.$watch('tabs',function(){	

        if($scope.selectedIndex != undefined){

            if($scope.tabs[$scope.selectedIndex].latitude != '' || $scope.tabs[$scope.selectedIndex].longitude != ''){

                $scope.tabs[$rootScope.selectedIndex].coordsEmpty = false;
            }
        }

    },true);
}

function shorterURL(url){


}
/*
	Controller for the menu bar
*/
function configCtrl($scope, $rootScope, Entity, Channel, config, $location){

    $scope.pubURLLabel = false;
    $scope.noWriteable = false;
    $rootScope.startButtonDisabled = true;
    $scope.stopButtonDisabled = true;
    $scope.channelSelectorDisabled = false;
    $rootScope.showMessage = false;
    $rootScope.pubUrlEmpty = false;
    $scope.channelSelector = true;
    $scope.channelsAvailables = [];

    //Variables for the snippets

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




    $scope.pathSDK = '<script src="path/to/aeonSDK.js"></script>';
    $scope.pathSocketIO = '<script src="path/to/socket.io.js"></script>';
    $scope.codeSnippet =["var sdk = new AeonSDK(pubUrl);","sdk.publish(data, controlFn);"];	

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
                    channelPubURL = channels[j].pubID;
                    $scope.channelsAvailables.push({ "name": channelName,
                                                    "pubURL": "//" + config.AEON_HOST+":"+config.AEON_PORT+"/publish/" + channelPubURL,
                                                    "shortPubURL": "//.../subscribe/"  + channelPubURL
                                                    //                                                    + channelPubURL.substring(0, 8) +"..." 
                                                    //                                                    + channelPubURL.substring(30, 35) + "..."
                                                   });


                }
                $scope.channelSelectorDisabled = false;

            }, function error(){

            })
        }

    }, function error(data){
        $scope.pubURLLabel = false;	
        $scope.noWriteable = false;	
        $rootScope.startButtonDisabled = true;
        $scope.stopButtonDisabled = true;
        $scope.channelSelectorDisabled = true;
        $rootScope.notReachable = true;	
        $rootScope.showMessage = false;

    });


    //Attach to the publication url 
    $scope.attachURL = function(){

        $scope.pubURLLabel = true;	
        $scope.noWriteable = true;	
        $rootScope.startButtonDisabled = true;
        $scope.stopButtonDisabled = false;
        $scope.channelSelectorDisabled = true;
        $rootScope.notAttached = false;

        $rootScope.publicationURL = $scope.publicationURL.pubURL;	

        //Instantiate the SDK
        $rootScope.sdk = new AeonSDK($rootScope.publicationURL);				

        if($rootScope.publicationURL.indexOf("publish")!=-1){
            $scope.pubURLLabel = true;	
            $scope.noWriteable = true;	
            $rootScope.startButtonDisabled = true;
            $scope.stopButtonDisabled = false;
            $rootScope.notAttached = false;
            //$rootScope.showMessage = true;
        }
        else{				
            $scope.pubURLLabel = false;	
            $scope.noWriteable = false;	
            $rootScope.startButtonDisabled = false;
            $scope.stopButtonDisabled = true;
            $rootScope.notAttached = true;	
            $rootScope.showMessage = false;
        }
    }

    //Dettach to the publication url 
    $scope.dettachURL = function(){

        $scope.pubURLLabel = false;
        $scope.noWriteable = false;	
        $rootScope.startButtonDisabled = false;
        $scope.channelSelectorDisabled = false;
        $scope.stopButtonDisabled = true;	

        $rootScope.pubURLLabel = false;

        //$rootScope.unsubscribe();

    }

    //Determines if the field is readOnly
    $scope.isReadOnly = function(){
        if($scope.noWriteable == true)
            return true;
        else return false;
    }

    //Publication url from the url params
    $scope.getURLfromPath = function(){

        var absUrl = $location.absUrl();

        try{
            var args = absUrl.split('?')[1];

            var fields = args.split('=');

            if(fields[0] == 'pubUrl')
                $scope.publicationURL = fields[1];

        }
        catch(err){

        }				
    }

    $scope.$watch('publicationURL',function(){	
        if ($scope.publicationURL == undefined){
            $rootScope.publicationURL = null   
        } else {
            $rootScope.pubUrlEmpty = false;
            $rootScope.publicationURL = $scope.publicationURL.pubURL;
            $rootScope.startButtonDisabled = false;
        }

    },true);

    $scope.getURLfromPath();


}
