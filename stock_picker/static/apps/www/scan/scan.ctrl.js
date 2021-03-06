'use strict';


angular.module('starter').controller('ScanCtrl', ['$scope', 'jsonRpc', function ($scope, jsonRpc) {

    $scope.picker_id = null;
    $scope.picker_name = null;
    $scope.scan = null;
    $scope.pickings = null;

    $scope.doSearch = function() {
        $scope.message = ''
        var scan = $scope.scan
        $scope.scan = ""
        if (scan.substring(0, 3) == 'PK/') {
            jsonRpc.searchRead(
                'res.partner',
                [['is_picker', '=', true], ['ref', '=', scan]],
                ['id', 'name', 'num_pick_today', 'num_pick_month']
            ).then(function(response) {
                if (response.length) {
                    var picker = response.records[0]
                    $scope.picker_id = picker.id;
                    $scope.picker_name = picker.name;
                    $scope.picker_num_today = picker.num_pick_today
                    $scope.picker_num_month = picker.num_pick_month
                    $scope.get_processing_picking()
                } else {
                    $scope.message = 'Aucun preparateur trouvé'
                }
            })
        } else if (!$scope.picker_id) {
            $scope.message = 'Veuillez scanner votre badge'
        } else {
            jsonRpc.searchRead(
                'stock.picking.out',
                [['name', '=', scan]],
                ['id', 'name', 'picker_id']
            ).then(function(response) {
                if (response.length) {
                    var record = response.records[0]
                    if (record.picker_id) {
                        $scope.message = 'La commande est déjà affecté à ' + record.picker_id[1]
                    } else if ($scope.pickings && record.id in $scope.pickings) {
                        $scope.message = 'Commande déjà scannée'
                    } else {
                        if (!$scope.pickings) {
                            $scope.pickings = {}
                        }
                        $scope.pickings[record.id] = record;
                    }
                } else {
                    $scope.message = 'Aucune commande trouvée';
                }
            })
        }
    }

    $scope.remove = function(pickingId) {
        delete $scope.pickings[pickingId];
    }

    $scope.validate = function() {
        var ids = []
        angular.forEach($scope.pickings, function(value, key) {
            ids.push(parseInt(key))
        });
        console.log(ids)
        if (ids) {
            jsonRpc.call(
                'stock.picking.out',
                'assigned_picker',
                [ids, $scope.picker_id]
            ).then(
                function(response) {
                    $scope.picker_name = null;
                    $scope.picker_id = null;
                    $scope.pickings = null;
                    $scope.refresh_top_five();
                },
                function(error) {
                    var message = error.message.split("<br />");
                    $scope.message = message[message.length -1];
                }
            )
        }
    }

    $scope.refresh_top_five = function() {
        jsonRpc.call(
            'res.partner',
            'get_top_five',
            []).then(
                function(response) {
                    $scope.top_five = response;
            }
        )
    }

    $scope.get_processing_picking = function() {
        jsonRpc.searchRead(
            'stock.picking.out', [
                ['picker_id', '=', $scope.picker_id],
                ['state', '!=', 'done'],
            ],['name']
        ).then(function(response) {
            $scope.processing_pickings = response.records;
            console.log(response)
        })
    }

    $scope.refresh_top_five();
}]);
