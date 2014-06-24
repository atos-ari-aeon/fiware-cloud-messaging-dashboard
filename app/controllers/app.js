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
  Configuration for the application's routes and module dependencies
*/

var app = angular.module('AEON', ['AEON.services', 'AEON.directives','ui.bootstrap', 'vcRecaptcha', 'xeditable', 'ui.gravatar']);


app.config(function($routeProvider, $locationProvider) {    
$routeProvider.
    when('/', 
    	{
    		templateUrl: 'views/login.html',   
    		controller: 'loginCtrl'
    	}
    ).
    when('/main', 
    	{
    		templateUrl: 'views/main.html',
    		controller: 'mainCtrl'
    	}
    ). 
    when('/createPassword', 
      {
        templateUrl: 'views/createPassword.html',
        controller: 'createPassCtrl'
      }
    ).    
    otherwise(
    	{
    		redirectTo: '/'            
    	}
    );

   // $locationProvider.html5Mode(true);
});


app.config(['gravatarServiceProvider', function(gravatarServiceProvider) {
    gravatarServiceProvider.defaults = {
      size     : 100,
      "default": 'mm'  // Mystery man as default for missing avatars
    };

    // Use https endpoint
    gravatarServiceProvider.secure = true;
  }
]);

app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        //delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);




/*by listening location change event, page access is maintained*/
app.run(function ($rootScope, $location, $route, Authentication) {
  $rootScope.$on('$locationChangeStart', function (event, next, current) {
    var nextRoute = next.substring(next.lastIndexOf('/'));
    /*when app starts, it's checked if there's a remembered user*/ 
    if($rootScope.userIdentified == undefined){
        Authentication.isLoggedIn().then(function(data){          
        if(data.code == 200){
          $rootScope.userId = data.result[0].username;
          if(data.result[0].imageURL == undefined)
            $rootScope.userImage = 'img/profile-placeholder.png';
          if($rootScope.userId){
            $rootScope.userIdentified = true;
             if(nextRoute == '/'){
              $location.path('/main');
              //$rootScope.$apply();
            }
          } else{
            $rootScope.userIdentified = false;
            if(nextRoute == '/main'){
              $location.path('/');
              $rootScope.$apply();
            }
          }
        } 
      }, function(data){        
        $rootScope.userIdentified = false;
         if(nextRoute == '/main'){
              $location.path('/');
              $rootScope.$apply();
            }
      });
    }else {
      /*logged in users shouldn't see the login page*/
      if(nextRoute == '/' && $rootScope.userIdentified) {
        $location.path('/main');
        //$rootScope.$apply();
      /*logged out users shouldn't see the main page*/
      }else if (nextRoute == '/main' && !$rootScope.userIdentified) {
          $location.path('/');
          $rootScope.$apply();
      }
    }
  });
});

/*xeditable directive theme*/
app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; 
});

/*
  Configuration for the demo applications' module dependencies
*/


var subapp = angular.module('SUBAPP', ['AEON.configuration', 'AEON.services', 'google-maps', 'ui.codemirror']);

var pubapp = angular.module('PUBAPP', ['AEON.configuration', 'AEON.services', 'AEON.configuration', 'ui.bootstrap','google-maps', 'ui.codemirror']);

var pubappmobile = angular.module('PUBAPPMOBILE', ['AEON.configuration','ui.bootstrap']);

pubapp.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true; 
        //delete $httpProvider.defaults.headers.common['X-Requested-With']; 
		}])
	   .config(['$locationProvider', function($locationProvider){
		$locationProvider.html5Mode(true).hashPrefix('!');
		}]);

//prevents to add a hash parameter to the url		
pubappmobile.config(['$locationProvider', function($locationProvider){
    $locationProvider.html5Mode(true).hashPrefix('!');
}]);



