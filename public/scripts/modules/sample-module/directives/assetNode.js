/*global define */
define(['angular', 'directives-module'], function(angular, directives) {
	'use strict';

	directives.directive('assetNode', ['$compile', 'ctxGlobal',
	function($compile, ctxGlobal) {
		return {
			restrict : 'EA',
			templateUrl : '../views/assetNode.html',
			replace : true,
			scope : {},

			link : function(scope, element, attrs) {

				scope.nodes = JSON.parse(attrs.enterpriseList);
				scope.parentNode = "";
				scope.treePadding = 21 * (scope.nodes[0].path.split("->").length-1);

				scope.appendChildNode = function (node, el) {

				    scope.newNodes = node.childNodeList;
				    scope.parentNode = node;

				    if (el && scope.newNodes.length !== 0) {
				        var parentEl = el.parentNode;
				        var elem = $compile('<asset-node enterprise-list="{{newNodes}}"></asset-node>')(scope);

				        parentEl.appendChild(elem[0]);

				        el = null;
				        elem = null;
				        parentEl = null;
				    }
				};

				scope.renderChildNodes = function(node, evt) {

				    evt.stopPropagation();
				    var target = evt.target;
				    var targetParent = target.nodeType === 'I' ? target.parentNode.parentNode : target.parentNode;

				    if (!$(targetParent).nextAll(".myddmenu").hasClass("open")) {
				        if (node.childNodeList && node.childNodeList.length) {
				            $(target).removeClass("icon-chevron-right").addClass("icon-chevron-down");
				            scope.appendChildNode(node, targetParent);
				        }
				    }
					else {
						console.log('does not have open class');
				        $(targetParent).nextAll(".myddmenu").remove();
				        $(target).removeClass("icon-chevron-down").addClass("icon-chevron-right");
				    }
				    target = null;
				    targetParent = null;
				};

				scope.selectNode = function(node) {

					//var parentScope = scope.$parent;
					ctxGlobal.setEnterpriseId(node.enterpriseId);
					ctxGlobal.setNodeId(node.id);
					var splitPath = node.name_path.split('->');
					ctxGlobal.setEnterpriseNode(splitPath[0]);
					ctxGlobal.setAssetTree(node.path.split('->'), node.name_path.split('->'))

					scope.$emit('update-selected-node', {
						node : node
					});
				};

				scope.hasChildNodes = function(node) {
					return node.childNodeList.length > 0;
				};

				scope.hasNoChildNodes = function(node) {
					return node.childNodeList.length == 0;
				};

				scope.$on('$destroy', function () {
				    var parentScope = scope.$parent;
				    while (parentScope.$$childScopeClass) {
				        element.parent().remove();
				        parentScope = parentScope.$parent;
				    }
					element.remove();
					element.detach();
				});
			}
		};
	}]);

	return directives;
});
