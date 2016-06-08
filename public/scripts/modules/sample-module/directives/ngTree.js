/*global define */
define(['angular', 'directives-module'], function (angular, directives) {
    'use strict';

    directives.directive('treeModel', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                //tree id
                var treeId = attrs.treeId;

                //tree model
                var treeModel = attrs.treeModel;

                //node id
                var nodeId = attrs.nodeId || 'id';

                //node label
                var nodeLabel = attrs.nodeLabel || 'label';

                //children
                var nodeChildren = attrs.nodeChildren || 'children';

                var enterpriseId = attrs.enterpriseId || 'enterpriseId';
                //var primarySystem =attrs.primarySystem || 'true';

                //tree template
                /* var template =
                 '<ul>' +
                 '<li data-ng-repeat="node in ' + treeModel + '">' +
                 '<div class="{{node.type}}" data-ng-class="{node:true, selected: ' + treeId + '.isSelected(node) || node.selected, leafNode: !node.' + nodeChildren + '.length}">' +
                 '<i class="icon-caret-right" data-ng-show="node.' + nodeChildren + '.length && node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                 '<i class="icon-caret-down" data-ng-show="node.' + nodeChildren + '.length && !node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                 '<span class="statusIndicator s_{{node.' + nodeStatus + '}}"></span> ' +
                 '<span data-ng-click="' + treeId + '.selectNodeLabel(node)">{{node.' + nodeLabel + '}}</span>' +
                 '</div>' +
                 '<div data-ng-hide="node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id="' + nodeId + '" data-node-label="' + nodeLabel + '" data-node-children="' + nodeChildren + '"></div>' +
                 '</li>' +
                 '</ul>';
                 */
                var template =
                    '<ul>' +
                    '<li data-ng-repeat="node in ' + treeModel + ' | orderBy:\'name\'"  data-id="{{node.id}}">' +
                    '<div class="{{node.type}}" data-ng-class="{node:true, selected: ' + treeId + '.isSelected(node) || node.selected, leafNode: !node.' + nodeChildren + '.length}">' +
                    '<div myicon class="chevron-icon-container" data-ng-click="' + treeId + '.selectNodeHead(node)"><i myicon class="chevron-placeholder" data-ng-if="node.' + nodeChildren + '.length === 0" ></i>' +
                    '<i myicon class="icon-chevron-right" data-ng-show="node.' + nodeChildren + '.length && node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                    '<i myicon class="icon-chevron-down " data-ng-show="node.' + nodeChildren + '.length && !node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i></div>' +
                        //                            '<i myicon class="normal" data-ng-hide="node.' + nodeChildren + '.length"></i> ' +
                    '<div class="node-meta-container" data-ng-click="' + treeId + '.selectNodeLabel(node)"><span class="statusIndicator s_{{node.highestNormalizedSevLevel}}" tooltip-append-to-body="true" tooltip="Alarm Severity : {{getItemSeverity(node.highestNormalizedSevLevel)}}">&nbsp;</span>' +
                    '<span class="marginRt5" ng-class="getNodeTypeIcon(node.nodeTypeEnum)" tooltip-append-to-body="true"  tooltip="{{node.nodeNamePath || node.nodePath ||node.name}}"></span>' +

                    '<span>{{node.' + nodeLabel + '}}' +
                    '<i class="icon-link" ng-if="node.mappedNodeName " tooltip-append-to-body="true" tooltip="{{node.mappedNodePath}}" tooltip-placement="right"></i>' +
                    '</span>' +
                    '<span ng-if="node.ipNoData > 0;" class="marginRt5 addPaddingTop marginLt5 customIconNoData" tooltip="{{node.ipNoData }} not communicating" tooltip-append-to-body="true"></span>' +
                    '</div></div>' +
                    '<div data-ng-show="!node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
                    '</li>' +
                    '</ul>';



                    //check tree id, tree model
                    if (treeId && treeModel) {
                        //root node
                        if (attrs.angularTreeview) {

                            //create tree object if not exists
                            scope[treeId] = scope[treeId] || {};

                            // Set the 'selected' class
                            scope[treeId].isSelected = scope[treeId].isSelected || function (node) {

                                if (scope.nodeId && node.id
                                    && node.enterpriseId
                                    && scope.nodeId === node.id.toString()
                                    && scope.enterpriseId == node.enterpriseId.toString()) {
                                    // Set the enterprise ID and node type into the scope
                                    scope.nodeType = node.type;
                                    //scope.nodeSelectedType = node.nodeType;
                                    /* if (node.enterpriseId){
                                     scope.enterpriseId = node.enterpriseId.toString();
                                     }*/
                                    return 'selected';
                                } else {
                                    return '';
                                }
                            };
                            //if node head clicks,
                            scope[treeId].selectNodeHead = scope[treeId].selectNodeHead || function (selectedNode) {

                                //Collapse or Expand
                                //selectedNode.collapsed = !selectedNode.collapsed;
                                if (selectedNode[nodeChildren]) {
                                    selectedNode.collapsed = !selectedNode.collapsed;
                                }
                            };

                            //if node label clicks,
                            scope[treeId].selectNodeLabel = scope[treeId].selectNodeLabel || function (selectedNode) {
                                //remove highlight from previous node
                                if (scope[treeId].currentNode && scope[treeId].currentNode.selected) {
                                    scope[treeId].currentNode.selected = undefined;
                                }

                                //set highlight to selected node
                                selectedNode.selected = 'selected';

                                //set currentNode
                                scope[treeId].currentNode = selectedNode;
                                selectedNode.collapsed = false;

                                //Set the scope.nodeStatus... This will reflect all the nodes
                                scope.nodeStatus = attrs.nodeStatus;
                                scope.nodeSeverity = selectedNode.highestNormalizedSevLevel;
                                scope.nodeNoDatapoints = selectedNode.ipNoData;
                                scope.nodeId = selectedNode.id.toString();
                                scope.nodeType = selectedNode.type;
                                //console.log("scope.nodeType",scope.nodeType)
                                scope.enterpriseId = selectedNode.enterpriseId.toString();
                                scope.selectedNodeName = selectedNode.name;
                                scope.selectedNodePathName = selectedNode.nodeNamePath;
                                scope.selectedNodePath = selectedNode.nodePath;
                                scope.nodeSelectedType = selectedNode.nodeTypeEnum || selectedNode.nodeType || scope.nodeType;
                                scope.selectedNodeId = selectedNode.id.toString();
                                //console.log("scope.nodeSelectedType",scope.nodeSelectedType)
                            };
                        }
                        /*scope.$watch('selectedNodeId', function(newVal, oldVal){
                         console.log("selectedNodeId",newVal,oldVal)
                         });
                         if (defaultNode && defaultNode!="") {

                         if (scope[treeId].currentNode && scope[treeId].currentNode.selected) {
                         scope[treeId].currentNode.selected = undefined;
                         }

                         defaultNode.selected = 'selected';

                         //set currentNode
                         scope[treeId].currentNode = defaultNode;
                         }*/
                        //Rendering template.
                        element.html('').append($compile(template)(scope));
                    }

            }
        };
    }])

    directives.directive('myicon', [function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.bind('click', function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                });
            }
        };
    }])

    return directives;
});