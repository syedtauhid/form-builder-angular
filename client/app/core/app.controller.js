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
            FormBuilderCtrl
        ]);

    function AppCtrl($scope, $state, $uibModal, $log) {
        $scope.multiFieldTypes = ["choices", "durations", "embedded_list", "files", "links", "text_list", "options"];

        $scope.openFormBuilder = function(inputJson) {
            $scope.formattedJson = inputJson ? formatInputJson(inputJson) : null;

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: "formBuilderTemplate.html",
                controller: "FormBuilderCtrl",
                size: "lg",
                resolve: {
                    inputJSON: function() {
                        console.log($scope.formattedJson);
                        return $scope.formattedJson; // pass input to Dialog
                    }
                }
            });

            modalInstance.result.then(
                function() {},
                function() {
                    $log.info("Modal dismissed at: " + new Date());
                }
            );
        };

        function formatInputJson(inputJson) {
            let arrayJson = [];
            inputJson = JSON.parse(inputJson);
            for(var item in inputJson) {
                let elem = {};
                if(inputJson[item].schema){
                    elem.property = inputJson[item];
                    elem.property.id = item;
                    elem.property.multiField = elem.property.multiField ? elem.property.multiField : checkMutifieldFromType(elem.property.type);
                    elem.property.label = angular.isUndefined(elem.property.label) ? "" : elem.property.label;
                    elem.property.schema = prepareSchemaArr(elem.property.schema);
                } else if(inputJson[item].type == "layout"){
                    elem = prepareSchemaArr(inputJson[item].elements);
                    elem = elem[0];
                    elem.id = item;
                    elem.type = "layout";
                } else {
                    elem.property = inputJson[item];
                    elem.property.id = item;
                    elem.property.multiField = elem.property.multiField ? elem.property.multiField : checkMutifieldFromType(elem.property.type);
                    elem.property.editable = angular.isUndefined(elem.property.editable) ? true : elem.property.editable;
                    elem.html = {};
                    elem.html.inputType = getInputTypeFromType(elem.property.type);
                    elem.html.inputId = item;
                }
                arrayJson.push(elem);
            }
            return arrayJson;
        }

        var prepareSchemaArr = function(inputSchema){
            let schemaArr = [];
            let sameRowItems = [];
            let columnCount = 0;
            for(var item in inputSchema){
                let elem = {};
                if (inputSchema[item].schema) {
                    elem.property = inputSchema[item];
                    elem.property.id = item;
                    elem.property.multiField = elem.property.multiField ? elem.property.multiField : checkMutifieldFromType(elem.property.type);
                    elem.property.schema = prepareSchemaArr(elem.property.schema);
                } else if (inputSchema[item].type == "layout") {
                    elem = prepareSchemaArr(inputSchema[item].elements);
                    elem = elem[0];
                    elem.id = item;
                    elem.type = "layout";
                } else {
                    elem.property = inputSchema[item];
                    elem.property.id = item;
                    elem.property.multiField = elem.property.multiField ? elem.property.multiField : checkMutifieldFromType(elem.property.type);
                    elem.property.editable = angular.isUndefined(elem.property.editable) ? true : elem.property.editable;
                    elem.html = {};
                    elem.html.inputType = getInputTypeFromType(elem.property.type);
                    elem.html.inputId = item;
                    
                    if (elem.property.columns && elem.property.columns != 12) {
                        sameRowItems.push(elem);
                        columnCount += elem.property.columns;
                    }
                }

                if(!columnCount) {
                    schemaArr.push(elem);
                } else if(columnCount == 12) {
                    schemaArr.push(sameRowItems);
                    sameRowItems = [];
                    columnCount = 0;
                }
            }
            return schemaArr;
        }

        var checkMutifieldFromType = function(type) {
            return $scope.multiFieldTypes.indexOf(type) > -1;
        }
    }

    function FormBuilderCtrl($scope, $uibModalInstance) {
        $scope.formItems = $scope.$resolve.inputJSON ? $scope.$resolve.inputJSON : [];
        $scope.showOutputModal = false;
        $scope.multiValueTypes = prepareTypeNamesForMultiValues();
        $scope.itemProperties = prepareElemTypeProperties();
        $scope.countId = 0;
        $scope.mapEntry = [];
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
            let item = prepareItemBasedOnType(type);
            if (cols) {
                let col = 12 / cols;
                item.property.columns = col;
            }
            $scope.$apply(function() {
                if (arrIndex && position)
                    $scope.formItems[arrIndex][position] = item;
                else $scope.formItems.push(item);
            });
        }

        function addLayoutToForm(cols) {
            let item = prepareItemBasedOnType("layout", cols);
            $scope.$apply(function() {
                $scope.formItems.push(item);
            });
            console.log($scope.formItems);
        }

        $scope.dropOnLayout = function(ev, elem) {
            ev.preventDefault();
            var itemType = ev.dataTransfer.getData("type");
            if(itemType == "embedded") return;
            var arrIndex = elem.getAttribute("data-index");
            var currentPosition = elem.getAttribute("data-position");
            var cols = elem.getAttribute("data-cols");
            addTextItemToForm(itemType, arrIndex, currentPosition, cols);
        };

        $scope.dropOnEmbeddedLayout = function(ev, elem) {
            ev.preventDefault();
            var itemType = ev.dataTransfer.getData("type");
            if(itemType == "embedded") return;
            var arrIndex = elem.getAttribute("data-index");
            var currentPosition = elem.getAttribute("data-position");
            var layoutIndex = elem.getAttribute("data-layout-index");
            var embeddedIndex = elem.getAttribute("data-embedded-index");
            var cols = elem.getAttribute("data-cols");

            let item = prepareItemBasedOnType(itemType);
            item.property.columns = 12 / Number(cols);

            $scope.$apply(function() {
                if (embeddedIndex >= 0)
                    $scope.formItems[arrIndex].property.schema[
                        embeddedIndex
                    ].property.schema[layoutIndex][currentPosition] = item;
                else
                    $scope.formItems[arrIndex].property.schema[layoutIndex][
                        currentPosition
                    ] = item;
            });
        };

        $scope.dropOnEmbedded = function(ev, elem) {
            var arrIndex = elem.getAttribute("data-index");
            var currentPosition = elem.getAttribute("data-position");
            var itemType = ev.dataTransfer.getData("type");
            var cols = ev.dataTransfer.getData("col");
            var item = prepareItemBasedOnType(itemType, cols);
            $scope.$apply(function() {
                if (currentPosition >= 0)
                    $scope.formItems[arrIndex].property.schema[currentPosition].property.schema.push(item);
                else 
                    $scope.formItems[arrIndex].property.schema.push(item);
            });
            console.log($scope.formItems[arrIndex].property);
        };

        $scope.removeItem = function(array, rmIndex) {
            Array.prototype.remove = function(from, to) {
                var rest = this.slice((to || from) + 1 || this.length);
                this.length = from < 0 ? this.length + from : from;
                return this.push.apply(this, rest);
            };
            array.remove(rmIndex);
            console.log(array);
        };

        var prepareItemBasedOnType = function(itemType, cols) {
            let item;
            if (itemType === "layout") {
                item = [];
                item["index"] = 0;
                item["type"] = "layout";
                item["id"] = "layout" + $scope.countId;
                for (var i = 0; i < cols; i++) {
                    item.push({});
                }
            } else {
                item = {};
                let itemProp = $scope.itemProperties[itemType];
                let propJSON = JSON.parse(itemProp);
                let itemId = itemType + $scope.countId;
                let inputType = getInputTypeFromType(itemType);
                propJSON.id = itemId;
                item.html = {};
                item.html.inputType = inputType;
                item.html.inputId = itemId;
                item.property = propJSON;
            }
            $scope.countId++;
            return item;
        };

        $scope.showProperty = function(index, position) {
            let currentProperty =
                position >= 0
                    ? $scope.formItems[index][position].property
                    : $scope.formItems[index].property;
            $scope.formItemProperty = currentProperty;
        };

        $scope.showPropertyFromObject = function(propObject) {
            $scope.formItemProperty = propObject;
        };

        $scope.booleanPropertyChanged = function(key) {
            if (key == "multiField") {
                let currentType = $scope.formItemProperty.type;
                if ($scope.formItemProperty.multiField) {
                    $scope.formItemProperty.type =
                        $scope.multiValueTypes[currentType];
                } else {
                    $scope.formItemProperty.type = findKeyFromVal(currentType);
                }
            }
        };

        $scope.addItemToOptions = function(elem) {
            elem[$scope.mapEntry.key] = $scope.mapEntry.label;
            $scope.mapEntry.key = "";
            $scope.mapEntry.label = "";
        };

        $scope.applyChangedProperty = function(index) {
            console.log($scope.formItemProperty);
        };

        $scope.columnExceed = function(row) {
            let totalLength = 0;
            for (var i = 0; i < row.length; i++) {
                let elem = row[i];
                if (elem.property && elem.property.columns)
                    totalLength += Number(elem.property.columns);
            }

            return totalLength > 12;
        };

        function prepareTypeNamesForMultiValues() {
            let map = [];
            map["choice"] = "choices";
            map["duration"] = "durations";
            map["embedded"] = "embedded_list";
            map["file"] = "files";
            map["link"] = "links";
            map["text"] = "text_list";
            map["option"] = "options";
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
                ',"type": "choice", "multiField": false, "choices": {}'
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
                '{"id": "", "type": "embedded", "label": "Embedded", "multiField": false, "index": 0,"schema": [] }';
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
            properties["options"] = defaultPropertyAsStr.insert(
                insertPos,
                ',"type": "option", "multiField": false, "options": {}'
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
            for (var key in $scope.multiValueTypes) {
                if ($scope.multiValueTypes[key] == typeValue) {
                    typeKey = key;
                    break;
                }
            }
            return typeKey;
        }

        $scope.getLabelForKey = function(key) {
            let label = key;
            if (key == "multiField") label = "Allow Multiple";
            return label;
        };

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

        $scope.isObject = function(item) {
            return angular.isObject(item);
        };

        $scope.getNumber = function(num) {
            console.log(num);
            return new Array(Number(num));
        };

        $scope.viewableProperty = function(val) {
            return "index" != val;
        };

        $scope.checkReadonlyProperty = function(key, val) {
            return key == "type" || (key == "columns" && val == 12);
        };

        $scope.exportToJSON = function() {
            $scope.showOutputModal = true;
            var outputJSON = {};
            for(var i = 0; i < $scope.formItems.length; i++){
                var item = $scope.formItems[i];
                var id = item.property ? item.property.id : item.id;
                // outputJSON[id] = item.property;
                if(item.type == "layout"){
                    var layoutJSON = {};
                    layoutJSON["type"] = item.type;
                    layoutJSON["elements"] = {};
                    for(var j = 0; j < item.length; j++){
                        var layoutItem = item[j];
                        var layoutId = layoutItem.property.id;
                        layoutJSON.elements[layoutId] = layoutItem.property;
                    }
                    outputJSON[id] = layoutJSON;
                } else if(item.property.schema) {
                    outputJSON[id] = item.property;
                    outputJSON[id].schema = processEmbeddedItem(outputJSON[id].schema);
                } else {
                    outputJSON[id] = item.property;
                }
            }
            console.log(outputJSON);
            $scope.jsonOutput = JSON.stringify(outputJSON);
        };

        var processEmbeddedItem = function(schemaArr) {
            let schemaJson = {};
            for(var i = 0; i < schemaArr.length; i++){
                var item = schemaArr[i];
                var id = item.property ? item.property.id : item.id;
                if(item.type == "layout"){
                    var layoutJSON = {};
                    layoutJSON["type"] = item.type;
                    layoutJSON["elements"] = {};
                    for(var j = 0; j < item.length; j++){
                        var layoutItem = item[j];
                        var layoutId = layoutItem.property.id;
                        layoutJSON.elements[layoutId] = layoutItem.property;
                    }
                    schemaJson[id] = layoutJSON;
                } else if(item.property.schema) {
                    schemaJson[id] = item.property;
                    schemaJson[id].schema = processEmbeddedItem(schemaJson[id].schema);
                } else {
                    schemaJson[id] = item.property;
                }
            }
            return schemaJson;
        }

        $scope.cancel = function() {
            $uibModalInstance.dismiss("dismiss");
        };
    }

    var getInputTypeFromType = function(type) {
        let inpTyp = "text";

        if (type == "file") inpTyp = "file";
        else if (type == "email") inpTyp = "email";
        else if (type == "number") inpTyp = "number";

        return inpTyp;
    };
})();