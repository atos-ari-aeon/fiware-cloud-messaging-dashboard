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
	Module to manage the services invocation
*/

var app = angular.module("AEON.services", ['AEON.configuration', 'ngResource', 'ngCookies']);

//Authentication services
app.factory('Authentication', function ($http, $q, $location, $cookies, $cookieStore, $rootScope, config) {

    return {
        //get the user if logged in
        isLoggedIn: function () {
            var deferred = $q.defer();
            //GET
            $http.get("//" + $location.host() + ":" + config.AEON_PORT + "/users/user", {
                withCredentials: true
            }).success(function (responseData) {
                deferred.resolve(responseData);
            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);
            });
            return deferred.promise;
        },
        //Authentication
        login: function (user) {

            var deferred = $q.defer();

            //Set up the headers
            $http.defaults.headers.post['Content-Type'] = 'application/json';
            $http.defaults.headers.post['Set-Cookie'] = '';

            //POST
            $http.post("//" + $location.host() + ":" + config.AEON_PORT + "/login", user, {
                withCredentials: true
            }).success(function (responseData, status, headers, config) {

                deferred.resolve(responseData);

            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);

            });

            return deferred.promise;
        },
        //Logout
        logout: function () {
            var deferred = $q.defer();
            $http.get("//" + $location.host() + ":" + config.AEON_PORT + "/logout", {
                withCredentials: true
            }).success(function (responseData, status, headers, config) {
                deferred.resolve(responseData);
            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);
            });
            return deferred.promise;
        }
    }
});

//Services for cookie management
app.factory('Cookies', function ($q, $timeout) {
    return {
        getCookie: function (name) {
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve($.cookie(name));
            }, 0);
            return deferred.promise;
        },

        getAllCookies: function () {
            return $.cookie();
        },

        setCookie: function (name, value) {
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve($.cookie(name, value));
            }, 0);
            return deferred.promise;
        },

        deleteCookie: function (name) {
            return $.removeCookie(name);
        },
        setCookieNull: function (name) {
            return $.cookie(name, null, {
                path: '/'
            });
        },
        setExpDate: function (name, days) {
            return this.getCookie(name).then(function (value) {
                return $.cookie(name, value, {
                    path: '/',
                    expires: days
                });
            });
        }
    }
});

//Services for the user management
app.factory('Users', function ($http, $q, $rootScope, config, $location) {
    return {
        //List the users
        getUsers: function () {
            var deferred = $q.defer();

            //Set up the headers
            $http.defaults.headers.post['Content-Type'] = 'application/json';

            //GET
            $http.get("//" + $location.host() + ":" + config.AEON_PORT + "/users/", {
                withCredentials: true
            }).success(function (responseData) {

                deferred.resolve(responseData);

            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);

            });

            return deferred.promise;
        },
        //Creates a new user
        newUser: function (user) {
            var deferred = $q.defer();
            //Set up the headers
            $http.defaults.headers.post['Content-Type'] = 'application/json';
            $http.post("//" + $location.host() + ":" + config.AEON_PORT + "/users", user).success(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.resolve(responseData);
            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);
            });
            return deferred.promise;
        },
        //Gets user info
        getUser: function (id) {
            var deferred = $q.defer();

            //Set up the headers
            $http.defaults.headers.post['Content-Type'] = 'application/json';

            //GET
            $http.get("//" + $location.host() + ":" + config.AEON_PORT + "/users/" + id, {
                withCredentials: true
            }).success(function (responseData) {

                deferred.resolve(responseData);

            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);

            });

            return deferred.promise;
        },
        //Resets user password
        resetPassword: function (userId) {
            var deferred = $q.defer();
            $http.get("//" + $location.host() + ":" + config.AEON_PORT + "/users/" + userId + "/rememberPassword").success(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.resolve(responseData);
            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);
            });
            return deferred.promise;

        },
        createPassword: function (user, tempCode) {
            var deferred = $q.defer();
            //Set up the headers
            $http.defaults.headers.post['Content-Type'] = 'application/json';
            $http.put("//" + $location.host() + ":" + config.AEON_PORT + "/users/" + user.username + "/rememberPassword/" + tempCode, user).success(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.resolve(responseData);
            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);
            });

            return deferred.promise;
        },
        changePassword: function (username, user) {
            var deferred = $q.defer();

            //Set up the headers
            $http.defaults.headers.post['Content-Type'] = 'application/json';

            //PUT
            $http.put("//" + $location.host() + ":" + config.AEON_PORT + "/users/" + username + "/updatePassword", user, {
                withCredentials: true
            }).success(function (responseData) {

                deferred.resolve(responseData);

            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);

            });

            return deferred.promise;
        }
    }
})


//Services for the entities management
app.factory('Entity', function ($http, $q, $rootScope, config, $location) {
    return {
        //List of entities
        getEntities: function () {
            var deferred = $q.defer();

            //Set up the headers
            $http.defaults.headers.post['Content-Type'] = 'application/json';

            //GET
            $http.get("//" + $location.host() + ":" + config.AEON_PORT + "/entities/", {
                withCredentials: true
            }).success(function (responseData) {

                deferred.resolve(responseData);

            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);

            });

            return deferred.promise;
        },
        //Creates a new entity
        newEntity: function (entity) {
            var deferred = $q.defer();

            //Set up the headers
            $http.defaults.headers.post['Content-Type'] = 'application/json';

            //POST
            $http.post("//" + $location.host() + ":" + config.AEON_PORT + "/entities", entity, {
                withCredentials: true
            }).success(function (responseData) {
                deferred.resolve(responseData);

            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);

            });

            return deferred.promise;
        },
        //Gets entity info
        getEntity: function (id) {
            var deferred = $q.defer();

            //Set up the headers
            $http.defaults.headers.post['Content-Type'] = 'application/json';

            //GET
            $http.get("//" + $location.host() + ":" + config.AEON_PORT + "/entities/" + id, {
                withCredentials: true
            }).success(function (responseData) {
                deferred.resolve(responseData);

            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);

            });

            return deferred.promise;
        },
        //Update entity
        updateEntity: function (entity) {
            var deferred = $q.defer();
            //Set up the headers
            $http.defaults.headers.post['Content-Type'] = 'application/json';
            //PUT
            $http.put("//" + $location.host() + ":" + config.AEON_PORT + "/entities/" + entity._id, entity, {
                withCredentials: true
            }).success(function (responseData) {
                deferred.resolve(responseData);
            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);
            });
            return deferred.promise;
        },
        //Deletes entity
        deleteEntity: function (entity) {
            var deferred = $q.defer();
            //Set up the headers
            $http.defaults.headers.post['Content-Type'] = 'application/json';
            //DELETE
            // $http.delete("//"+$location.host()+":"+config.AEON_PORT+"/entities/"+entity._id, {withCredentials:true}).success(function(responseData){
            // 	deferred.resolve(responseData);
            // }).error(function(responseData){
            // 	deferred.reject(responseData);
            // });

            $http({
                method: 'DELETE',
                url: "//" + $location.host() + ":" + config.AEON_PORT + "/entities/" + entity._id,
                withCredentials: true
            }).success(function (responseData) {
                deferred.resolve(responseData);
            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);
            });

            return deferred.promise;
        }
    }

})

//Services for the channels
app.factory('Channel', function ($http, $q, $rootScope, config, $location) {
    return {
        //List of channels
        getChannels: function (entity_id) {
            var deferred = $q.defer();

            //Set up the headers
            $http.defaults.headers.post['Content-Type'] = 'application/json';

            //GET
            $http.get("//" + $location.host() + ":" + config.AEON_PORT + "/entities/" + entity_id + '/channels/', {
                withCredentials: true
            }).success(function (responseData) {

                deferred.resolve(responseData);

            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);

            });

            return deferred.promise;
        },
        //Creates a new channel
        newChannel: function (entity_id, channel) {
            var deferred = $q.defer();

            //Set up the headers
            $http.defaults.headers.post['Content-Type'] = 'application/json';

            //POST
            $http.post("//" + $location.host() + ":" + config.AEON_PORT + "/entities/" + entity_id + "/channels/", channel, {
                withCredentials: true
            }).success(function (responseData) {

                deferred.resolve(responseData);

            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);

            });

            return deferred.promise;
        },
        //Get channel info
        getChannel: function (entity_id, channel_id) {
            var deferred = $q.defer();

            //Set up the headers
            $http.defaults.headers.post['Content-Type'] = 'application/json';

            //GET
            $http.get("//" + $location.host() + ":" + config.AEON_PORT + "/entities/" + entity_id + "/channels/" + channel_id, {
                withCredentials: true
            }).success(function (responseData) {

                deferred.resolve(responseData);

            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);

            });

            return deferred.promise;
        },
        //Update channel
        updateChannel: function (entityId, channel) {
            var deferred = $q.defer();
            //Set up the headers
            $http.defaults.headers.post['Content-Type'] = 'application/json';
            //PUT
            $http.put("//" + $location.host() + ":" + config.AEON_PORT + "/entities/" + entityId + "/channels/" + channel._id, channel, {
                withCredentials: true
            }).success(function (responseData) {
                deferred.resolve(responseData);
            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);
            });
            return deferred.promise;
        },
        //Deletes channel
        deleteChannel: function (entityId, channelId) {
            var deferred = $q.defer();
            //Set up the headers
            $http.defaults.headers.post['Content-Type'] = 'application/json';
            //DELETE
            // $http.delete("//"+$location.host()+":"+config.AEON_PORT+"/entities/"+entityId+"/channels/"+channelId, {withCredentials:true}).success(function(responseData){
            // 	deferred.resolve(responseData);
            // }).error(function(responseData){
            // 	deferred.reject(responseData);
            // });

            $http({
                method: 'DELETE',
                url: "//" + $location.host() + ":" + config.AEON_PORT + "/entities/" + entityId + "/channels/" + channelId,
                withCredentials: true
            }).success(function (responseData) {
                deferred.resolve(responseData);
            }).error(function (responseData, status) {
                responseData.httpStatus = status;
                deferred.reject(responseData);
            });

            return deferred.promise;
        }
    }

});

app.factory('alertManager', function () {
    return {
        Alert: {},
        raiseAlert: function (message, type) {
            this.Alert.type = type;
            this.Alert.message = message;
            this.Alert.showAlert = true;
        }
    };
});
