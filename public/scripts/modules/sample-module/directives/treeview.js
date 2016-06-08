/* global angular, _ *//*


*/
/**
 * Treeview, based on https://github.com/eu81273/angular.treeview
 * with changes to $watch() for changes and update in realtime.
 *
 * Usage:
 *
 * <div
 *   data-angular-treeview="true"
 *   data-tree-id="tree"
 *   data-tree-model="roleList"
 *   data-node-id="roleId"
 *   data-node-label="roleName"
 *   data-node-children="children" >
 *
 * where:
 *
 * angular-treeview (required): the treeview directive
 * tree-id (required) : each tree's unique id.
 * tree-model (required) : the tree model on $scope.
 * node-id (optional) : each node's id, defaults to "id"
 * node-label (optional) : each node's label, defaults to "label"
 * node-children (optional): each node's children, defaults to "children"
 *
 *//*


'use strict';

angular.module('system1fleetApp')
    .directive( 'treeModel',['$compile',  function( $compile ) {
        return {
            restrict: 'A',
            link: function ( scope, element, attrs ) {
                var treeId = attrs.treeId;
                var treeModel = attrs.treeModel;
                var nodeId = attrs.nodeId || 'id';
                var enterpriseId = attrs.enterpriseId || 'enterpriseId';
                var nodeLabel = attrs.nodeLabel || 'label';
                var nodeChildren = attrs.nodeChildren || 'children';
                var primarySystem =attrs.primarySystem || 'true';
                var defaultNode = attrs.defaultNode||'';
          var template =
          '<ul>' +
            '<li data-ng-repeat="node in ' + treeModel + '|orderBy:\'name\'"  data-id="{{node.id}}" >' +
              '<div class="{{node.type}}" data-ng-class="{node:true, selected: ' + treeId + '.isSelected(node) || node.selected, leafNode: !node.' + nodeChildren + '.length}">' +
                '<span class="chevron-placeholder" data-ng-if="node.' + nodeChildren + '.length === 0" ></span>' +
                '<i myicon class="icon-chevron-right icon-large" data-ng-if="node.' + nodeChildren + '.length > 0" data-ng-show="node.' + nodeChildren + '.length && node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                '<i myicon class="icon-chevron-down icon-large" data-ng-if="node.' + nodeChildren + '.length > 0" data-ng-show="node.' + nodeChildren + '.length && !node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                '<span class="statusIndicator s_{{node.highestNormalizedSevLevel}}" tooltip-append-to-body="true" tooltip="Severity Level : {{node.highestNormalizedSevLevel}}">&nbsp;</span>'+
                '<span class="marginRt5" ng-class="getNodeTypeIcon(node.nodeTypeEnum)"></span>' +
              '<span data-ng-click="' + treeId + '.selectNodeLabel(node)"  class="childHeader ">{{node.' + nodeLabel + '}}' +
                '<i class="icon-link icon-large" ng-if="node.mappedNodeName " tooltip-append-to-body="true" tooltip="{{node.mappedNodeName}}" tooltip-placement="right"></i></span>' +
              '</div>' +
              '<div data-ng-hide="node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id="' + nodeId + '" data-node-label="' + nodeLabel + '" data-node-children="' + nodeChildren + '">' +
              '</div>' +
            '</li>' +
          '</ul>';

                scope.$watch('treeModel', function() {
                    //check tree id, tree model
                    if( treeId && treeModel ) {
                        //root node
                        if( attrs.angularTreeview ) {
                            //create tree object if not exists
                            scope[treeId] = scope[treeId] || {};
                            // Set the 'selected' class
                            // NOTE: If you're using things that look like numbers for your IDs, Javascript
                            // is probably going to coerce node.id to a number. That's why we're
                            // forcing a toString() here.
                            //
                            // TODO: this only works if we have unique nodeIds. Verify!
                            //
                            scope[treeId].isSelected = scope[treeId].isSelected || function (node){

                                if( scope.nodeId && node.id&& node.enterpriseId && scope.nodeId === node.id.toString()&& scope.enterpriseId ==node.enterpriseId.toString() ){
                                    // Set the enterprise ID and node type into the scope
                                    scope.nodeType = node.type;
                                    //scope.nodeSelectedType = node.nodeType;
                                    */
/* if (node.enterpriseId){
                                     scope.enterpriseId = node.enterpriseId.toString();
                                     }*//*

                                    return 'selected';
                                } else {
                                    return '';
                                }
                            };
                            // Node head clicks,
                            scope[treeId].selectNodeHead = scope[treeId].selectNodeHead || function( selectedNode ){
                                //Collapse or Expand
                                selectedNode.collapsed = !selectedNode.collapsed;
                            };

                            // Node label clicks,

                            scope[treeId].selectNodeLabel = scope[treeId].selectNodeLabel || function( selectedNode ){
                                // Open the node if it's closed
                                selectedNode.collapsed = false;

                                // Set this node's deets into the scope.
                                // NOTE: If you're using things that look like numbers for your IDs, Javascript
                                // is probably going to coerce selectedNode.id to a number. That's why we're
                                // forcing a toString() here.
                                //scope.nodeStatus = selectedNode.nodeStatus.toString();
                                */
/*              scope.nodeStatus = 1;
                                 *//*

                                //Set the scope.nodeStatus... This will reflect all the nodes
                                scope.nodeStatus=attrs.nodeStatus;
                                scope.nodeSeverity = selectedNode.highestNormalizedSevLevel;
                                scope.nodeId = selectedNode.id.toString();
                                scope.nodeType = selectedNode.type;
                                //console.log("scope.nodeType",scope.nodeType)
                                scope.enterpriseId = selectedNode.enterpriseId.toString();
                                scope.selectedNodeName =selectedNode.name;
                                scope.selectedNodePathName = selectedNode.nodeNamePath;
                                scope.selectedNodePath = selectedNode.nodePath;
                                scope.nodeSelectedType = selectedNode.nodeTypeEnum;
                                //console.log("scope.nodeSelectedType",scope.nodeSelectedType)
                            };
                        }

                        scope.findNode = function ( _children, _id, _result ) {

                            for ( var i=0, child; child = _children[i]; i++ ) {
                                if ( child.id === _id ) return child;
                                else _result = findNode( child.children, _id ) || _result;
                            }

                            return _result;
                        }
                        //Rendering template.
                        element.html('').append( $compile( template )( scope ) );
                    }

                });

            }
        };
    }]).directive('myicon', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.bind('click', function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                });
            }
        };
    });
*/
