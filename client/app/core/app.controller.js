(function() {
    "use strict";

    angular
        .module("app")
        .controller("AppCtrl", [
            "$scope",
            "$state",
            "$uibModal",
            "$log",
            AppCtrl
        ]) // overall control
        .controller("FormBuilderCtrl", [
            "$scope",
            "$uibModalInstance",
            "$log",
            FormBuilderCtrl
        ]);

    function AppCtrl($scope, $state, $uibModal, $log) {
        $scope.openFormBuilder = openFormBuilder;

        function openFormBuilder(inputJson) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: "formBuilderTemplate.html",
                controller: "FormBuilderCtrl",
                controllerAs: "FrmCtrl",
                size: "lg",
                resolve: {
                    inputJson: inputJson
                }
            });

            modalInstance.result.then(
                function() {},
                function() {
                    $log.info("Modal dismissed at: " + new Date());
                }
            );
        }
    }

    function FormBuilderCtrl($scope, $uibModalInstance, $log, model) {
        $scope.formItems = [];
        //$scope.formItemProperty = {};
        $scope.multiValueTypes = prepareTypeNamesForMultiValues();
        $scope.itemProperties = prepareElemTypeProperties();
        $scope.countId = 0;
        // Drag and drop
        $scope.allowDrop = function(ev, obj) {
            ev.preventDefault();
        };

        $scope.drag = function(ev, obj) {
            let fieldType = obj.getAttribute("data-type");
            ev.dataTransfer.setData("type", fieldType);
            if (fieldType == "layout")
                ev.dataTransfer.setData("col", obj.getAttribute("data-cols"));

            ev.dataTransfer.dropEffect = "copy";
        };

        $scope.drop = function(ev, obj) {
            ev.preventDefault();
            var itemType = ev.dataTransfer.getData("type");
            if (itemType == "layout") {
                var cols = ev.dataTransfer.getData("col");
                addLayoutToForm(cols);
            } else {
                addTextItemToForm(itemType);
            }
        };

        function addTextItemToForm(type, arrIndex, position, cols) {
            let item = {};
            let itemProp = $scope.itemProperties[type];
            let propJSON = JSON.parse(itemProp);
            let itemId = type + $scope.countId;
            let inputType = getInputTypeFromType(type);
            propJSON.id = itemId;
            item.html = {};
            item.html.inputType = inputType;
            item.html.inputId = itemId;
            item.property = propJSON;
            if(cols) {
                let col = 12/cols;
                item.property.columns = col;
            }
            $scope.$apply(function() {
                if(arrIndex && position)
                    $scope.formItems[arrIndex][position] = item;
                else
                    $scope.formItems.push(item);
            });

            $scope.$digest();
            $scope.countId++;
        }

        function addLayoutToForm(col) {
            let item = [];
            item["index"] = 0;
            for (var i = 0; i < col; i++) {
                item.push({});
            }
            $scope.$apply(function() {
                $scope.formItems.push(item);
            });
            console.log($scope.formItems);
        }

        $scope.dropOnLayout = function(ev, elem) {
            ev.preventDefault();
            var itemType = ev.dataTransfer.getData("type");
            var arrIndex = elem.getAttribute("data-index");
            var currentPosition = elem.getAttribute("data-position");
            addTextItemToForm(itemType, arrIndex, currentPosition);
        }

        var getInputTypeFromType = function(type) {
            let inpTyp = "text";

            if (type == "file") inpTyp = "file";
            else if (type == "email") inpTyp = "email";

            return inpTyp;
        };

        $scope.showProperty = function(index, position) {
            let currentProperty = position >=0 ? $scope.formItems[index][position].property : $scope.formItems[index].property;
            $scope.formItemProperty = currentProperty;
        };

        $scope.booleanPropertyChanged = function(key) {
            if(key == "multiField"){
                let currentType = $scope.formItemProperty.type;
                if($scope.formItemProperty.multiField) {
                    $scope.formItemProperty.type = $scope.multiValueTypes[currentType];
                } else {
                    $scope.formItemProperty.type = findKeyFromVal(currentType);
                }
            }
        }

        $scope.applyChangedProperty = function(index) {
            console.log($scope.formItemProperty);
        };

        function prepareTypeNamesForMultiValues() {
            let map = [];
            map["choice"] = "choices";
            map["duration"] = "durations";
            map["embedded"] = "embedded_list";
            map["file"] = "files";
            map["link"] = "links";
            map["text"] = "text_list";
            return map;
        }

        function prepareElemTypeProperties() {
            let properties = [];
            let defaultPropertyAsJSON = {
                id: "",
                label: "Label",
                description: "",
                placeholder: "",
                required: false,
                columns: 12,
                header: "",
                helpText: "",
                visible: true,
                editable: true,
                index: 0
            };
            String.prototype.insert = function(position, text) {
                return this.slice(0, position) + text + this.slice(position);
            };
            var defaultPropertyAsStr = JSON.stringify(defaultPropertyAsJSON);
            var insertPos = defaultPropertyAsStr.indexOf("}");

            properties["address"] = defaultPropertyAsStr.insert(
                insertPos,
                ',"type": "address"'
            );
            properties["boolean"] = defaultPropertyAsStr.insert(
                insertPos,
                ',"type": "boolean"'
            );
            properties["choice"] = defaultPropertyAsStr.insert(
                insertPos,
                ',"type": "choice", "choices": {}, "multiField": false'
            );
            properties["date"] = defaultPropertyAsStr.insert(
                insertPos,
                ',"type": "date"'
            );
            properties["duration"] = defaultPropertyAsStr.insert(
                insertPos,
                ',"type": "duration", "multiField": false'
            );
            properties["email"] = defaultPropertyAsStr.insert(
                insertPos,
                ',"type": "email"'
            );
            properties["embedded"] =
                '{"type": "embedded", "label": "embedded", "multiField": false,"schema": []';
            properties["file"] = defaultPropertyAsStr.insert(
                insertPos,
                ',"type": "file", "multiField": false, "mime": "", "maxFileSize":""'
            );
            properties["html"] = defaultPropertyAsStr.insert(
                insertPos,
                ',"type": "html"'
            );
            properties["impacts"] = defaultPropertyAsStr.insert(
                insertPos,
                ',"type": "impacts"'
            );
            properties["link"] = defaultPropertyAsStr.insert(
                insertPos,
                ',"type": "link", "multiField": false, "component": "", "resourceType": "","creatable": false, "linkLabel":"", "linkType": "", "linkScope": "", "filter": ""'
            );
            properties["locale"] = defaultPropertyAsStr.insert(
                insertPos,
                ',"type": "locale", "choices": {}'
            );
            properties["number"] = defaultPropertyAsStr.insert(
                insertPos,
                ',"type": "number", "minimum":1, "maximum": 11'
            );
            properties["percent"] = defaultPropertyAsStr.insert(
                insertPos,
                ',"type": "percent"'
            );
            properties["text"] = defaultPropertyAsStr.insert(
                insertPos,
                ',"type": "text", "multiField": false'
            );
            properties["timezone"] = defaultPropertyAsStr.insert(
                insertPos,
                ',"type": "timezone"'
            );
            properties["url"] = defaultPropertyAsStr.insert(
                insertPos,
                ',"type": "url"'
            );

            return properties;
        }

        function findKeyFromVal(typeValue) {
            let typeKey = "";
            for(var key in $scope.multiValueTypes){
                if($scope.multiValueTypes[key] == typeValue)
                {
                    typeKey = key;
                    break;
                }
            }
            return typeKey;
        }

        $scope.getLabelForKey = function(key) {
            let label = key;
            if(key == "multiField")
                label = "Allow Multiple"
            return label;
        }

        $scope.isString = function(item) {
            return angular.isString(item);
        };

        $scope.isNumber = function(item) {
            return angular.isNumber(item);
        };

        $scope.isArray = function(item) {
            return angular.isArray(item);
        };

        $scope.isBoolean = function(item) {
            return typeof item == "boolean";
        };

        $scope.isEmptyObject = function(item) {
            return angular.equals(item, {});
        };

        $scope.getNumber = function(num) {
            console.log(num);
            return new Array(Number(num));
        };

        $scope.isObject = function(item) {
            return angular.isObject(item);
        };

        $scope.viewableProperty = function(val) {
            return "index" != val;
        };

        $scope.checkReadonlyProperty = function(key, val) {
            return key == "type" || (key == "columns" && val == 12);
        };

        $scope.ok = function() {
            console.log("ok");
        };
    }
})();
