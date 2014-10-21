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
	Controller for the main view
*/


function mainCtrl($rootScope, $scope, $location, $window, Authentication, config, Cookies){	

	//Select the navType format for the menu
	$scope.navType = 'pills';
	$scope.menuOption = 'views/entities.html';
	//set sdks to download using banner
	$scope.sdks = config.QUICK_START;
	for(var i = 0; i < $scope.sdks.length; i++){
        $scope.sdks[i].href = 'http://'+config.AEON_HOST+':'+config.AEON_PORT+$scope.sdks[i].href;
        $scope.sdks[i].example = 'http://'+config.AEON_HOST+':'+config.AEON_PORT+$scope.sdks[i].example;
    }

	//Menu options
	$scope.tabsManagement = [
		{title:'Users',menuOption:'users',active:false},
		{title:'Entities', menuOption:'entities', active:true}
	];

	//Redirects to the main view
	$scope.goHome = function(){		
		if($rootScope.userIdentified) 	
			$location.path('/main');
		else
			$location.path('/');
	}

	//Manage the navigation bar
	$scope.manageMenu = function(option){

		//Manages the selection of the menu options. If one is selected, other has to be deselected.
		if(option == "entities" || option == "home"){
			$scope.menuOption = 'views/entities.html';	

			$("#aboutHref").removeClass("active");				
			$("#homeHref").addClass("active");

			for(var i = 0; i< $scope.tabsManagement.length; i++){
				if($scope.tabsManagement[i].menuOption == "entities")
					$scope.tabsManagement[i].active = true;									
			}

		}

		if(option == "users"){
			$scope.menuOption = 'views/userManagement.html';
			$("#homeHref").removeClass("active");
		}		

		if(option=="subApp"){	
			window.open('indexSubDemo.html') ;
		}	

		if(option=="pubApp"){				
			window.open('indexPubDemo.html') ;					
		}	
		
		if(option == "about"){
			$scope.menuOption = "views/about.html";		

			$("#homeHref").removeClass("active");				
			$("#aboutHref").addClass("active");

			for(var i = 0; i< $scope.tabsManagement.length; i++)
				$scope.tabsManagement[i].active = false;
		}

		if(option == 'documentation'){
			window.open('http://'+config.AEON_HOST+':'+config.AEON_PORT+'/public/doc/html/apidoc/apidoc.html');
		}

	}

	$scope.logOut = function(){
		Authentication.logout().then(function(data){
			if(data.code == 200){
				//delete cookie
				Cookies.setCookieNull(config.COOKIE_NAME);
				$rootScope.userIdentified = false;
				$scope.goHome();
			}
		}, function(){
			Cookies.setCookieNull(config.COOKIE_NAME);
			$rootScope.userIdentified = false;
			$scope.goHome();				
		});
	}
	
}