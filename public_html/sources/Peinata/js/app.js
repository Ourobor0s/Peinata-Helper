/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// angular
var _ngToast;
var app = angular.module('peinata', ['dndLists', 'ngToast', 'ngAnimate']);
app.config(['ngToastProvider', function (ngToastProvider) {
        ngToastProvider.configure({
            animation: 'slide', // or 'fade'
            timeout: 7000

        });
    }]);

app.controller('basic', ['$scope', 'ngToast', function ($scope, ngToast) {
        _ngToast = ngToast;

        $scope.localData = GetLocalData(localStorageType.Users);
        //handlers
        $scope.keyboardHandler = {};
        $scope.keyboardHandler.enterKey = function (keyEvent) {
            if (keyEvent.which === 13)
                $scope.settings.userAdd();
            else {
                $scope.settings.userDuplicateName = false;
            }
        };
        $scope.keyboardHandler.orderInputEnterKey = function (keyEvent) {
            if ($scope.calculations.orderText !== "") {
                if (keyEvent.which === 13) {
                    $scope.calculations.orderGetObject();
                    $('#orderInputModal').modal('toggle');
                }
            }
            return false;
        };
        //Calculations
        $scope.calculations = {};
        $scope.calculations.orderText = "";
        $scope.calculations.order = {};
        $scope.calculations.orderInfo = {};
        $scope.calculations.orderItems = [];
        $scope.calculations.oldSchoolData = GetOldSchoolData();
        $scope.calculations.oldSchoolTableResultTable = {};
        $scope.calculations.autoTips = "";
        $scope.calculations.oldSchoolTips = "";
        $scope.calculations.resultsOldSchoolData = {};

        $scope.calculations.priceCalcOldSchool = function () {
            if (HasRealValue($scope.calculations.oldSchoolData.priceTotal)) {
                var tmpPriceTotal = parseFloat($scope.calculations.oldSchoolData.priceTotal);

                if (isNumeric(tmpPriceTotal)) {
                    if (tmpPriceTotal >= 15) {
                        var tmpPeinataDiscount = PeinataDiscountCalculate(tmpPriceTotal);
                        $scope.calculations.oldSchoolData.peinataDiscount = tmpPeinataDiscount;
                        $scope.calculations.oldSchoolData.priceDiscounted = (tmpPriceTotal - tmpPeinataDiscount).toFixed(2);
                        $scope.calculations.oldSchoolData.priceDiscountPerc = ((1 - (tmpPriceTotal - tmpPeinataDiscount) / tmpPriceTotal) * 100).toFixed(2);
                        $scope.calculations.oldSchoolData.priceDiscountValue = ((tmpPriceTotal - tmpPeinataDiscount) / tmpPriceTotal).toFixed(6);//6 for bigger precision
                        $scope.calculations.oldSchoolData.noErrors = true;
                    } else {
                        $scope.calculations.oldSchoolData.noErrors = false;
                        $scope.calculations.oldSchoolData.peinataDiscount = "";
                        $scope.calculations.oldSchoolData.priceDiscounted = "";
                        $scope.calculations.oldSchoolData.priceDiscountPerc = "";
                    }
                } else {
                    $scope.calculations.oldSchoolData.noErrors = false;
                    ConsoleOut("Cannot convert total price.", "calculations.priceCalcOldSchool: Error! Cannot parse total price to float. " + $scope.calculations.oldSchoolData.priceTotal, "Parse Error", ConsoleType.warn);
                }
            } else {
                $scope.calculations.oldSchoolData.peinataDiscount = "";
                $scope.calculations.oldSchoolData.priceDiscounted = "";
                $scope.calculations.oldSchoolData.priceDiscountPerc = "";
                $scope.calculations.oldSchoolData.noErrors = false;
            }
        };

        $scope.calculations.orderGetObject = function () {
            //var txt = document.getElementById("clipboardText").value;
            var txt = $scope.calculations.orderText;
            var text = txt.split("\n");
            var objInfo = ConvertToOrderInfo(text);
            if (objInfo.details.noErrors) {
                var objItem = ConvertToOrderItems(text, objInfo.details.itemsDataFirstRow);
            }
            if (objInfo.details.noErrors && objItem.details.noErrors) {
                $scope.calculations.order = {info: objInfo.info, items: objItem.items};
                $scope.calculations.orderAdd();
                $scope.models.modelsRefresh();
            }
            if (!objInfo.details.noError || !objItem.details.noErros) {
                ConsoleOut("", txt, "Invalid Order Text Provided", ConsoleType.developer);
            }
        };

        $scope.calculations.orderAdd = function () {
            if (SetLocalData(localStorageType.LastOrder, $scope.calculations.order)) {
                ConsoleOut("Order saved.", "calculations.orderAdd: LastOrder saved to local storage. ", "Save", ConsoleType.log);
            }
        };

        $scope.calculations.orderLoadLastOrder = function () {
            $scope.calculations.order = GetLocalData(localStorageType.LastOrder);
            $scope.models.modelsReloadLast();
        };

        $scope.calculations.results = function () {
            if (!OrderItemsAllAreAssigned($scope.models.items)) {
                ConsoleOut("All order items must be assigned to a user.", "calculations.results(): Unassigned order items.", "Unassigned order items", ConsoleType.log);
            } else {
                $scope.calculations.resultTableData = ResultsCalculate($scope.models.users, $scope.calculations.order);
                if ($scope.calculations.resultTableData.info.noErrors) {
                    if (ValidateCalculations($scope.calculations.resultTableData, $scope.calculations.order)) {
                        if (SetLocalData(localStorageType.LastUserModel, $scope.models.users)) {
                            ConsoleOut("Model saved.", "calculations.results: Saved model to local storage.", "Save", ConsoleType.log);
                            $scope.calculations.resultsAndTipsAuto();
                            $('#resultsModal').modal('show');
                        }
                    }
                }
            }
        };

        $scope.calculations.resultsOldSchool = function () {
            if (EnoughUsers($scope.calculations.oldSchoolData)) {
                var data = ResultsOldSchoolCalculate(CreateOldSchoolTableData($scope.calculations.oldSchoolData));
                if (data.noErrors) {
                    if (ValidateOldSchoolCalculations(data, $scope.calculations.oldSchoolData)) {
                        $scope.calculations.resultsOldSchoolData = data;
                        $scope.calculations.resultsAndTipsOldSchool();
                        $("#resultsOldSchoolModal").modal('show');
                    }
                }
            } else {
                ConsoleOut("At least 2 users required!", "calculations.resultsOldSchool: At least 2 users required.", "Not enough users", ConsoleType.log);
            }
        };

        $scope.calculations.resultsAndTipsAuto = function () {
            if (!HasRealValue($scope.calculations.autoTips)) {
                for (var user in $scope.calculations.resultTableData.results) {
                    var price = $scope.calculations.resultTableData.results[user].price;
                    $scope.calculations.resultTableData.results[user].priceFinal = price;
                }
            } else {
                var tmpTips = $scope.calculations.autoTips;
                if (isNumeric(tmpTips)) {
//                calculations.resultTableData.results.
                    var tipPerUser = (tmpTips / $scope.calculations.resultTableData.results.length);
                    for (var user in $scope.calculations.resultTableData.results) {
                        var price = parseFloat($scope.calculations.resultTableData.results[user].price);
                        $scope.calculations.resultTableData.results[user].priceFinal = (parseFloat(price) + parseFloat(tipPerUser)).toFixed(2);
                    }
                } else {
                    ConsoleOut("Cannot convert tips!", "calculations.resultsAndTipsAuto: Error! Failed to parse tips to float.", "Parse Error", ConsoleType.warn);
                }
            }
        };

        $scope.calculations.resultsAndTipsOldSchool = function () {
            if (!HasRealValue($scope.calculations.oldSchoolTips)) {
                for (var user in $scope.calculations.resultsOldSchoolData.Users) {
                    var price = $scope.calculations.resultsOldSchoolData.Users[user].price;
                    $scope.calculations.resultsOldSchoolData.Users[user].priceFinal = price;
                }
            } else {
                var tmpTips = $scope.calculations.oldSchoolTips;
                if (isNumeric(tmpTips)) {
                    var tipPerUser = (tmpTips / $scope.calculations.resultsOldSchoolData.Users.length);
                    for (var user in $scope.calculations.resultsOldSchoolData.Users) {
                        var price = parseFloat($scope.calculations.resultsOldSchoolData.Users[user].price);
                        $scope.calculations.resultsOldSchoolData.Users[user].priceFinal = (parseFloat(price) + parseFloat(tipPerUser)).toFixed(2);
                    }
                } else {
                    ConsoleOut("Cannot convert tips!", "calculations.resultsAndTipsOldSchool: Error! Failed to parse tips to float.", "Parse Error", ConsoleType.warn);
                }
            }
        };

        //Navbar Region
        $scope.navbar = {};
        $scope.navbar.navTabActive = {
            auto: 1,
            oldschool: 2,
            log: 3,
            patchnotes: 4,
            contactme: 5
        };
        $scope.navbar.itemActiveTab = 1;
        $scope.navbar.changeTab = function (tabActive) {
            $scope.navbar.itemActiveTab = tabActive;
        };

        //Settings Region
        $scope.settings = {};
        $scope.settings.userDuplicateName = false;
        $scope.settings.userName = "";
        $scope.settings.userGUID = 0;
        $scope.settings.userAdd = function () {
            if ($scope.settings.userName !== '') {
                if (HasRealValue($scope.localData)) {
                    $scope.settings.userGUID = GenerateGUID();
                    for (var i in $scope.localData.Users) {
                        if ($scope.localData.Users[i].name === $scope.settings.userName) {
                            $scope.settings.userDuplicateName = true;
                            //ConsoleOut("testmsg","dpuser","test",ConsoleType.warn);
                            break;
                        } else {
                            $scope.settings.userDuplicateName = false;
                        }
                    }
                    if (!$scope.settings.userDuplicateName) {
                        $scope.localData.Users.push(new User($scope.settings.userGUID, $scope.settings.userName)); //{id: index, name: username}
                        if (SetLocalData(localStorageType.Users, $scope.localData)) {
                            ConsoleOut("User saved.", "settings.userAdd: {name: " + $scope.settings.userName + " ,id: " + $scope.settings.userGUID + "}", "Save", ConsoleType.log);
                            $scope.settings.userName = "";
                            //refresh auto
                            $scope.models.users = GetUsersName();
                            //
                            //refresh oldschool
                            $scope.calculations.oldSchoolData = GetOldSchoolData();
                            //
                        }
                    }
                }
            }
        };

        //called by delete button in users table and deletes that row's user
        $scope.settings.userDelete = function (deleteID) {
            if (HasRealValue($scope.localData)) {
                for (var i in $scope.localData.Users) {
                    if ($scope.localData.Users[i].id === deleteID) {
                        var deletedUsername = $scope.localData.Users[i].name;
                        $scope.localData.Users.splice(i, 1);
                        break;
                    }
                }
                if (SetLocalData(localStorageType.Users, $scope.localData)) {
                    ConsoleOut("User deleted.", "settings.userDelete: {name: " + deletedUsername + ", id: " + deleteID + "}", "Delete", ConsoleType.log);
                    //refresh auto
                    $scope.models.users = GetUsersName();
                    //
                    //refresh oldschool
                    $scope.calculations.oldSchoolData = GetOldSchoolData();
                    //
                }
            }
        };
        //

        $scope.$watch('settings.userDuplicateName', function (newValue) {
            if (newValue === true) {
                $("#userDuplicateName").fadeIn();
            } else {
                $("#userDuplicateName").fadeOut();
            }
        }, true);
        $scope.models = {};
        $scope.models.users = GetUsersName();
        $scope.models.items = {lists: {Order_Items: []}};
        $scope.models.modelsRefresh = function () {
            $scope.models.users = GetUsersName();
            $scope.models.items = LoadOrderItemsToModel($scope.calculations.order);
        };
        $scope.models.modelsReloadLast = function () {
            $scope.models.users = GetLocalData(localStorageType.LastUserModel);
            $scope.models.items = {lists: {Order_Items: []}};
        };

        // Model to JSON for demo purpose
        $scope.$watch('models', function (model) {
            $scope.modelAsJson = angular.toJson(model, true);
        }, true);
    }]);
//end of angular controller

//filters
app.filter('euroSymbol', [function () {
        return function (input) {
            if (input)
                return input + " €";

            return input;
        };
    }]);

app.filter('percentSymbol', [function () {
        return function (input) {
            if (input)
                return input + " %";

            return input;
        };
    }]);

app.filter('orderCalcEnabled', [function () {
        return function (input) {
            if (angular.equals(input, {})) {
                return true;//disabled
            } else {
                return false;
            }
        };
    }]);

app.filter('enoughUsers', [function () {
        return function (obj) {
            var userCounter = 0;
            for (var user in obj.Users) {
                if (obj.Users[user].price !== "") {
                    userCounter++;
                }
                if (userCounter >= 2) {
                    return true;
                }
            }
            return false;
        };
    }]);
//

//interface
$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
});

//event that changes the focus on orderInput modal
$(document).on('shown.bs.modal', function (e) {
    if ($(e.target).is("#orderInputModal")) {
        var clipBoardInput = $(e.target).find("#clipboardText");
        clipBoardInput.focus();
    }
//    console.warn(e, this);
//    //$('#clipboardText').focus();
});
//