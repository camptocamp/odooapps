'use strict';

angular.module('pickadoo').factory('picking', ['$q', 'jsonRpc', function ($q, jsonRpc) {

    var picking = jsonRpc.syncImportObject({
        model: 'stock.picking.out',
        func_key: 'pickadoo',
        base_domain: [
            ['type', '=', 'out'],
            ['paid', '=', true],
            '|',
                ['state', '=', 'assigned'],
                '&',
                    ['state', '=', 'confirmed'],
                    ['partial', '=', true],
            '|',
                ['prepared', '=', false],
                '&',
                    ['prepared', '=', true],
                    ['process_in_pickadoo', '=', true],
            ],
        filter_domain: [],
        limit: 500,
        interval: window.pickingConfig.refresh_interval,
        });

    return $q(function(resolve, reject) {
        picking.watch(function () {
            return resolve(picking);
        });
    });
}]);
