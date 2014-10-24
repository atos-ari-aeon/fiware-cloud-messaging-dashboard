/**
    Copyright (C) 2014 ATOS

    This file is part of AEON.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>


   Authors: Jose Gato Luis (jose.gato@atos.net)
            Javier Garcia Hernandez (javier.garcia@atos.net)

*/

/*
 * exports cofiguration about AEON hosts and port
 *
 */


module.exports = {}

module.exports.AEON_GUI_HOST = 'localhost';
module.exports.AEON_GUI_PORT = '9999';
module.exports.SSL = true;
module.exports.key = 'cert/key.pem'; //only if ssl enabled
module.exports.cert = 'cert/cert.pem'; //only if ssl enabled