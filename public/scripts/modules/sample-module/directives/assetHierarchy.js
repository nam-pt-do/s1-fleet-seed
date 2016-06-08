/*global define */
define(['angular', 'directives-module'], function(angular, directives) {
	'use strict';
	// TODO: This file got checked in accidentally along with java check in, so adding a comment to trigger JS gated check in. Please remove this comment in the next check in.
	directives.directive('assetHierarchy', ['$compile', 'ctxGlobal', '$timeout',
	function($compile, ctxGlobal, $timeout) {
		return {
			restrict : 'EA',
			templateUrl : '../views/assetHierarchy.html',
			replace : true,
			scope : {
				selectedNodeName : '@',
				selectedEnterprise : '=',
				setCustomer : '&',
				enterpriseList : '@',
				nodeSeverity : '@',
				getEnterprises : '&',
				getEnterpriseNodes : '&',
				nodeType : '@',
				showDropDownSpinner : '@',
				nodeNoDatapoints : '@',
				customerId : '@'
			},
			link : function(scope, element, attrs) {
				var childScope;
				var assetTreePath = ctxGlobal.getAssetTreePath();
				scope.customerId = ctxGlobal.getCustomerId();
				scope.type = "enterprise";
				scope.showDropDownSpinner = true;

				scope.$watch('enterpriseList', function(n, o) {
					if (n && n !== o) {
						scope.showDropDownSpinner = false;
						scope.entprList = JSON.parse(n);
					}
				});
				scope.appendChildNode = function(nodes, el, applyScope) {
					var elem;
					if (!el) {
						return;
					}
					childScope = scope.$new();
					scope.nodes = nodes;
					elem = $compile('<asset-node enterprise-list="{{nodes}}"></asset-node>')(childScope);
					el.parent().append(elem[0]);

					if (applyScope) {
						childScope.$apply();
					}
				};
				/**
				 * this function will be called only for Enterprise nodes
				 * clicking different nodes are handled in assetNode js
				 **/
				scope.selectNode = function(node, evt) {

					ctxGlobal.setEnterpriseId(node.id);
					ctxGlobal.setEnterpriseNode(node);
					ctxGlobal.setNodeId(node.id);
					node.type = scope.type;
					scope.selectedNodeName = node.name;
					scope.nodeSeverity = node.highestNormalizedSevLevel;

					/*** Re-setting breadcrumb trail to empty array ***/
					ctxGlobal.setAssetTree();
					scope.$emit('update-selected-node', {
						node : node
					});
				};

				scope.resetHeirarchy = function() {

					scope.customerId = ctxGlobal.getCustomerId();
					scope.setCustomer({
						customerId : scope.customerId
					});
					scope.resetToHierarchy = "true";
					ctxGlobal.setSelectedNode(null);
					scope.$emit('update-selected-node', {
						node : null
					});

				};

				/********************************************
				 * Get all the children nodes of Enterprise
				 * ******************************************/
				scope.getChildNodes = function(node, evt, el) {

					var target;
					// anchor element with carat
					var targetParent;
					// always a div element, parent of anchor element
					var nodeId;

					/*** finding node of clicked event ***/
					if (evt) {
						evt.stopPropagation();
						target = $(evt.target);
						targetParent = $(evt.target.parentNode);
						nodeId = node.id;
					}
					/*** required for auto populating asset tree ***/
					else if (el) {
						target = el.find('a');
						targetParent = $(target).parent();
						nodeId = node;
					}
					/** if not opened ***/
					if (target.hasClass("icon-chevron-right")) {
						$(".hierarchyDropDown").find(".open").remove();
						$(".hierarchyDropDown").find(".icon-chevron-down").removeClass("icon-chevron-down").addClass("icon-chevron-right");
						//target.addClass("open");
						target.removeClass("icon-chevron-right").addClass("icon-chevron-down");

						if (!target.next().hasClass("loadState")) {
							target.next().addClass("loadState");
							scope.getEnterpriseNodes({
								node : nodeId
							}).then(function(response) {
								/** update status of enterprise node  **/
								if (node.id) {
									node.highestNormalizedSevLevel = response.highestNormalizedSevLevel;
								}

								target.removeClass("icon-chevron-right").addClass("icon-chevron-down");
								scope.appendChildNode(response.childNodeList, targetParent);

								/****************************************************
								 * auto rendering of Enterprise child nodes
								 *****************************************************/
								if (el && assetTreePath && assetTreePath.length > 1) {
									var childNodes = response.childNodeList[0].childNodeList;
									$timeout(function() {
										scope.loadAllNodes(childNodes, el.find('li > div'));
										targetParent = null;
										el = null;
										target.next().removeClass("loadState");
										target = null;
									}, 0);
								} else {
									target.next().removeClass("loadState");
								}
							});
						}
					} else {
						target.parents('li').children('ul').empty();
						target.removeClass("icon-chevron-down").addClass("icon-chevron-right");
					}
				};

				scope.fetchEnterprises = function(evt) {

					var selectedEnterpriseNodeId = ctxGlobal.getEnterpriseId();
					var elWrapper;
					var el;
					var btn = evt.currentTarget;

					if ($(btn).parent().hasClass("open")) {
						return
					}

					/***********************************************
					 * Enterprise list will be sent via controller
					 * to render enterprise list
					 ************************************************/

					scope.enterpriseList = "";
					scope.entprList = "";
					assetTreePath = ctxGlobal.getAssetTreePath();
					if (childScope) {
						childScope.$destroy()
					}

					scope.getEnterprises().then(function() {

						/** wait for enterprise to render **/
						$timeout(function() {

							elWrapper = $(evt.currentTarget).siblings('#enterpriseListWrapper');
							/** check if the previously selected node is an Enterprise node **/
							if (selectedEnterpriseNodeId && assetTreePath && assetTreePath.length === 0) {
								el = elWrapper.find("#" + selectedEnterpriseNodeId);
								el.addClass("selected").siblings().removeClass("selected");
							}
							/** if the previously selected node is chide node ofEnterprise node
							 *  get child node data and append it
							 * **/
							else if (assetTreePath && assetTreePath.length > 0) {
								el = elWrapper.find("#" + selectedEnterpriseNodeId);
								scope.getChildNodes(selectedEnterpriseNodeId, null, el);
							}
							elWrapper = null;
							el = null;
						}, 10);
					});
				};

				scope.loadAllNodes = function(nodeData, el) {

					/*******************
					 * el is the div element wrapping signal / icons / labels
					 * el.parentNode (li) is the first child of enterprise node
					 * nodeData contains JSON data of el
					 *******************/
					var i;
					var nodes = _.rest(assetTreePath, 2);
					var lastNodeIdx = nodes.length;
					var selectedNodeInfo = nodeData;
					var elem = el;
					var idx;
					var childEl;
					if (nodes.length) {
						$(elem).find(".chevron-icon-container").removeClass("icon-chevron-right").addClass("icon-chevron-down");
						for ( i = 0; i < nodes.length; i++) {

							var elId = nodes[i];

							scope.appendChildNode(selectedNodeInfo, elem, true);
							// find the element with id
							childEl = elem.parent().find("li#" + elId);

							// find the data for the element
							idx = childEl.attr('data-index');
							//update el
							elem = childEl.children('div');
							if (idx)
								selectedNodeInfo = selectedNodeInfo[idx].childNodeList;

							if (elId === nodes[nodes.length - 1]) {
								elem.addClass('selected');
							} else {
								$(elem).find(".chevron-icon-container").removeClass("icon-chevron-right").addClass("icon-chevron-down");
							}

						}
					} else {
						$(elem).addClass('selected');
					}
				};

				scope.$on('$destroy', function() {
					element.remove();
					element.detach();
				});
			}
		};
	}]);

	return directives;
});
