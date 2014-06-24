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

function pubMobileCtrl($scope, $timeout) {
	var sdk = new aeonSDK();
	var doesErrorExist = false;
	$scope.isAutomaticActive = false;
    $scope.publicationLogs = '';
	$scope.errorText = '';
	$scope.coords = {manuelLat: '', manuelLong: ''};
	$scope.urls = {pubUrl: ''};
	$scope.showCoordsAlert = false;
	$scope.pubUrlEmpty = false;
	
   function showAutoPosition(position){
		var clientDate = moment().format("D/M/YYYY HH:mm:ss:SSS ZZ");
		var clientTime = moment().format("HH:mm:ss");
		var coordinates = {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude,
			clientDate : clientDate
		}
		sdk.publish($scope.urls.pubUrl, coordinates, function(message){
			var locText = "Location" + " ( " + position.coords.latitude + ", " + position.coords.longitude + " ) " + 
						"has sent to publication channel at " + clientTime;
			$scope.publicationLogs += locText + "\n";
			$scope.$apply();
		});
   };
   
   function showManuelPosition(position){
		var clientDate = moment().format("D/M/YYYY HH:mm:ss:SSS ZZ");
		var clientTime = moment().format("HH:mm:ss");
		var coordinates = {
			latitude:  parseFloat($scope.coords.manuelLat),
			longitude: parseFloat($scope.coords.manuelLong),
			clientDate : moment().format("D/M/YYYY HH:mm:ss:SSS ZZ")
		}
		sdk.publish($scope.urls.pubUrl, coordinates, function(message){
			var locText = "Location" + " ( " + coordinates.latitude + ", " + coordinates.longitude + " ) " + 
						"has sent to publication channel at " + clientTime;
			$scope.publicationLogs += locText + "\n";
			//$scope.$apply();
		});
   };
   
    function publishLocation(type) {
		if (type == "automatic"){
			navigator.geolocation.getCurrentPosition(showAutoPosition, showError);
		}else{
			showManuelPosition();
		}
	};
	
	function showError(error) {
	  doesErrorExist = true;
	  switch(error.code) 
		{
		case error.PERMISSION_DENIED:
		  $scope.errorText="User denied the request for Geolocation."
		  $scope.$apply();
		  break;
		case error.POSITION_UNAVAILABLE:
		  $scope.errorText="Location information is unavailable."
		  $scope.$apply();
		  break;
		case error.TIMEOUT:
		  $scope.errorText="The request to get user location timed out."
		  $scope.$apply();
		  break;
		case error.UNKNOWN_ERROR:
		  $scope.errorText="An unknown error occurred."
		  $scope.$apply();
		  break;
		}
	 }
	
	var locUpdater;
	
	$scope.onTimeout = function(){
        publishLocation("automatic");
        locUpdater = $timeout($scope.onTimeout,2000);
    }
   
    $scope.submitLocation = function(){
		if($scope.urls.pubUrl == undefined || $scope.urls.pubUrl == ''){	
			$scope.pubUrlEmpty = true;
			return;
		}
		if($scope.isAutomaticActive){
			$timeout.cancel(locUpdater);
			$scope.isAutomaticActive = false;
		}
		if($scope.coords.manuelLat == '' || $scope.coords.manuelLong == '')	{
			$scope.showCoordsAlert = true;
			return;
		} else {
			$scope.showCoordsAlert = false;
			publishLocation("manuel");
		}
	}
   
   $scope.triggerLocation = function() {
		if($scope.urls.pubUrl == undefined || $scope.urls.pubUrl == ''){	
			$scope.pubUrlEmpty = true;
			return;
		}
	   if($scope.isAutomaticActive){
			$timeout.cancel(locUpdater);
			$scope.isAutomaticActive = false;
	   }else{
			locUpdater = $timeout($scope.onTimeout, 2000);
			$scope.isAutomaticActive = true;
	   } 
   }
   
   $scope.hasErrorRaised = function(){
		return doesErrorExist;	
   }
	
	//Publication url from the url params
	$scope.getURLfromPath = function(){
		$scope.urls.pubUrl = getParameterFromUrl('pubUrl');		
	}
	
	function getParameterFromUrl( name ){
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");  
		var regexS = "[\\?&]"+name+"=([^&#]*)";  
		var regex = new RegExp( regexS );  
		var results = regex.exec( window.location.href ); 
		if( results == null )    
			return "";  
		else    
			return results[1];
	}
	
	
	$scope.$watch('urls.pubUrl',function(){	
			$scope.pubUrlEmpty = false;
	},true);
	
	$scope.getURLfromPath();
	
}