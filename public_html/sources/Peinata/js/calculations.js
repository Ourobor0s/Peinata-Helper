//JS for Calculations
function PeinataDiscountCalculate(totalPrice) {
    if (totalPrice >= 15 && totalPrice < 20) {
        return 5;
    } else if (totalPrice >= 20 && totalPrice < 30) {
        return 7;
    } else if (totalPrice >= 30) {
        return 10;
    }
    //ConsoleOut("PeinataDiscountCalculate: Your total price is too low to have a peinata discount.",ConsoleType.warn);
    return 0;
}

function GetOldSchoolData() {
    var user_data = GetLocalData(localStorageType.Users);
    var data = {noErrors: false, priceTotal: "", priceDiscounted: "", peinataDiscount: "", priceDiscountPerc: "", priceDiscountValue: "", Users: []};
    for (var i = 0; i < user_data.Users.length; i++) {
        data.Users.push({name: user_data.Users[i].name, price: "", priceFinal: ""});
    }
    return data;
}

function ResultsOldSchoolCalculate(data) {
    for (var user in data.Users) {
        var tmpPrice_Obj = CalculateStringPrice(data.Users[user].price, "+");
        if (tmpPrice_Obj.noErrors) {
            var tmpPrice = (parseFloat(tmpPrice_Obj.sum) * parseFloat(data.priceDiscountValue)).toFixed(2);
            if (isNumeric(tmpPrice)) {
                data.Users[user].price = tmpPrice;
                data.Users[user].priceFinal = tmpPrice;
            } else {
                data.noErrors = false;
            }
        } else {
            data.noErrors = false;
        }
        if (!data.noErrors) {
            ConsoleOut("Cannot calculate price!",
                    "calculations.resultsOldSchool: function used: CalculateStringPrice(" + data.Users[user].price + ",'+') , Error! Could not calculate the price."
                    , "Calculation Error", ConsoleType.warn);
        }
    }
    return data;
}

function ValidateOldSchoolCalculations(data_obj, oldSchoolData_obj) {
    var priceDiscounted_calc = 0;
    var priceDiscounted_txt = parseFloat(oldSchoolData_obj.priceDiscounted);
    var priceTotal_txt = parseFloat(oldSchoolData_obj.priceTotal);
    var priceDiscountValue_txt = parseFloat(oldSchoolData_obj.priceDiscountValue);
    for (var user in data_obj.Users) {
        var tmp1 = parseFloat(data_obj.Users[user].priceFinal);
        var tmp2 = parseFloat(priceDiscounted_calc);
        priceDiscounted_calc = parseFloat(tmp1) + parseFloat(tmp2);
    }
    //checks the offset of the text discounted price and the discounted price after calculations
    var tmpPriceOffset = priceDiscounted_calc - priceDiscounted_txt;
    if (tmpPriceOffset < (-0.02) || tmpPriceOffset > 0.02) {
        ConsoleOut("There has to be a mistake, check the prices!",
                "ValidateOldSchoolCalculations : Error! The price offset for discounted price is " + tmpPriceOffset + "and it considered too large to continue!",
                "Calculations Error", ConsoleType.warn);
        return false;
    }
    //checks the offset of the text total price and the total price after calculations
    var tmpPriceOffset = (priceDiscounted_calc / priceDiscountValue_txt) - priceTotal_txt;
    if (tmpPriceOffset < (-0.02) || tmpPriceOffset > 0.02) {
        ConsoleOut("There has to be a mistake, check the prices!",
                "ValidateOldSchoolCalculations : Error! The price offset for total price is " + tmpPriceOffset + "and it considered too large to continue!",
                "Calculations Error", ConsoleType.warn);
        return false;
    }
//        console.log(tmpPriceOffset);
    return true;

}

function CreateOldSchoolTableData(objData) {
    var data = {noErrors: objData.noErrors,
        priceTotal: objData.priceTotal,
        priceDiscountValue: objData.priceDiscountValue,
        Users: GetUsersOldSchoolForResults(objData)
    };
    return data;
}

function GetUsersOldSchoolForResults(obj) {
    var userData = [];
    for (var user in obj.Users) {
        if (HasRealValue(obj.Users[user].price)) {
            userData.push({name: obj.Users[user].name, price: obj.Users[user].price, priceFinal: ""});
        }
    }
    return userData;
}

function EnoughUsers(obj) {
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
}

function GetUsersName() {
    var obj = GetLocalData(localStorageType.Users);
    var data = {lists: {}};
    for (var i = 0; i < obj.Users.length; i++) {
        data.lists[obj.Users[i].name] = [];
    }
    return data;
}

function CalculateStringPrice(text, operator) {
    var data = {};
    var noErrors = true;
    var sum = 0;
    //var tmp1 = text.replace('-',' ');
    var tmp = text.replace(/ /g, '');
    var numbers = tmp.split(operator);
    for (var operand = 0; operand < numbers.length; operand++) {
        var tmpOperand = parseFloat(numbers[operand].replace(",", "."));//parseFloat ignores string after ","
        sum = parseFloat(sum) + tmpOperand;
        if (!isNumeric(sum)) {
            noErrors = false;
            break;
        }
    }
    data.noErrors = noErrors;
    data.sum = sum;
    return data;
}

function ValidateCalculations(calculation_obj, order_obj) {

    var priceDiscount_calc = 0;
    var priceDiscount_txt = parseFloat(order_obj.info.discountedPrice).toFixed(2);
    var priceTotal_txt = parseFloat(order_obj.info.totalPrice).toFixed(2);
    var priceDiscountPerc_txt = parseFloat(order_obj.info.discountedPer).toFixed(6);
    for (var user in calculation_obj.results) {
        var tmp = parseFloat(priceDiscount_calc);
        var tmp2 = parseFloat(calculation_obj.results[user].price).toFixed(2);
        priceDiscount_calc = parseFloat(tmp) + parseFloat(tmp2);
    }
    //checks the offset of the text discounted price and the discounted price after calculations
    var tmpPriceOffset = parseFloat(priceDiscount_calc - priceDiscount_txt).toFixed(2);
    if (tmpPriceOffset < (-0.02) || tmpPriceOffset > 0.02) {
        ConsoleOut("There has to be a mistake, check the prices!",
                "ValidateCalculations : Error! The price offset for discounted price is " + tmpPriceOffset + "and it considered too large to continue!",
                "Calculations Error"
                , ConsoleType.warn);
        return false;
    }
    //checks the offset of the text total price and the total price after calculations
    var tmpPriceOffset = (priceDiscount_calc / (1 - priceDiscountPerc_txt)) - priceTotal_txt;
    if (tmpPriceOffset < (-0.02) || tmpPriceOffset > 0.02) {
        ConsoleOut("There has to be a mistake, check the prices!",
                "ValidateCalculations : Error! The price offset for total price is " + tmpPriceOffset + "and it considered too large to continue!",
                "Calculations Error"
                , ConsoleType.warn);
        return false;
    }
    return true;
}


function ResultsCalculate(models_Obj, order_Obj) {
    var data = {info: {}, results: []};
    var discount = 1 - parseFloat(order_Obj.info.discountedPer).toFixed(6);
    var tmpPersonalTotalPrice;
    for (var user in models_Obj.lists) {
        tmpPersonalTotalPrice = 0;
        for (var item in models_Obj.lists[user]) {
            tmpPersonalTotalPrice = (parseFloat(tmpPersonalTotalPrice) + parseFloat(models_Obj.lists[user][item].price)).toFixed(2);
        }
        if (isNumeric(tmpPersonalTotalPrice)) {
            if (tmpPersonalTotalPrice > 0) {//skips the users that have no order cost/order items
                data.results.push({user: user, price: (tmpPersonalTotalPrice * discount).toFixed(2)}); //, priceFinal: (tmpPersonalTotalPrice * discount).toFixed(2)
            }
        } else {
            ConsoleOut("Cannot convert number!", "ResultsCalculate: Error! Failed to parse string to float.", "Parse Error", ConsoleType.warn);
            data.info.noErrors = false;
            return data;
        }
    }
    data.info.noErrors = true;
    return data;
}

function OrderItemsAllAreAssigned(obj) {
    if (obj.lists.Order_Items.length === 0) {
        return true;
    } else {
        return false;
    }
}


function LoadOrderItemsToModel(order) {
    var obj = {lists: {Order_Items: []}};
    if (!angular.equals(order, {})) {
        for (var i = 0; i < order.items.length; i++) {
            if (order.items[i].extraDetails === "") {
                var tmpLabel = order.items[i].desc + ", " + order.items[i].price + " €";
            } else {
                var tmpLabel = order.items[i].desc + ", " + order.items[i].extraDetails + ", " + order.items[i].price + " €";
            }
            obj.lists.Order_Items.push({label: tmpLabel, desc: order.items[i].desc, extraDetails: order.items[i].extraDetails, price: order.items[i].price});
        }
    }
    return obj;
}

function GetUsersName() {
    var obj = GetLocalData(localStorageType.Users);
    var data = {lists: {}};
    for (var i = 0; i < obj.Users.length; i++) {
        data.lists[obj.Users[i].name] = [];
    }
    return data;
}

function ConvertToOrderInfo(text) {
    var noErrors = false;
    var errMessage = "ConvertToOrderInfo(): Error! Could not find the following values: ";
    for (var row = 0; row < text.length; row++) {//finds the row that starts the info
        if (HasRealValue(text[row])) {
            if (text[row].includes("Σύνολο") || text[row].includes('ΣΥΝΟΛΟ')) {
                noErrors = true;
                break;
            }
        }
    }

    if (noErrors) {
        //totalPrice
        if (typeof text[row] !== 'undefined' && text[row].includes("Σύνολο")) {
            var totalPrice = parseFloat(text[row].slice(text[row].lastIndexOf("ο") + 1, text[row].indexOf("€"))).toFixed(2);
        } else {
            errMessage += "totalPrice, ";
        }

        //discountedPrice
        if (typeof text[row + 1] !== 'undefined' && text[row + 1].includes("€")) {
            var discountedPrice = parseFloat(text[row + 1].replace("€", "")).toFixed(2);
        } else {
            errMessage += "discountedPrice, ";
        }

//                  if (text[row + 2].includes("Έκπτωση Πεινάτα:")) {}
        //peinataDiscount
        if (typeof text[row + 3] !== 'undefined' && text[row + 3].includes("€")) {
            var peinataDiscount = parseFloat(text[row + 3].replace("€", "")).toFixed(2);
        } else {
            errMessage += "peinataDiscount, ";
        }

        if (!isNumeric(totalPrice) || !HasRealValue(totalPrice) || !isNumeric(discountedPrice) || !HasRealValue(discountedPrice) || !isNumeric(peinataDiscount) || !HasRealValue(peinataDiscount)) {
            noErrors = false;
            ConsoleOut(errMessage.substring(0, errMessage.length - 2) + ".", errMessage.substring(0, errMessage.length - 2) + ".", "Missing Values", ConsoleType.warn);
        } else if (totalPrice <= 0 || discountedPrice <= 0 || peinataDiscount <= 0) {
            noErrors = false;
            ConsoleOut("There has to be a mistake, check the prices!", "ConvertToOrderInfo: Error! Invalid prices!", "Calculations Error", ConsoleType.warn);
        }
    } else {
        ConsoleOut("Wrong order text!", "ConvertToOrderInfo: Error! Could not find the start of the order.", "Order Text Error", ConsoleType.warn);
    }
    return {info: new Info(totalPrice, discountedPrice, peinataDiscount),
        details: {noErrors: noErrors,
            itemsDataFirstRow: row + 4}
    };
}

function ConvertToOrderItems(text, row) {
    var tmp_obj = {items: [], details: {}};
    var noErrors = true;
    while (row < text.length) {
        if (isEndOfOrder(text[row])) {
            break;
        } else {
            var desc = "";
            var qty = -1;
            var price = -1;
            var extraDetails = "";
            var rowsRead = 0;
            if (typeof text[row] !== 'undefined') {
                desc = text[row];
                rowsRead++;
            }

            if (typeof text[row + 1] !== 'undefined') {
                qty = parseFloat(text[row + 1]);
                rowsRead++;
            }

            if (typeof text[row + 2] !== 'undefined') {
                //removes the € from the string and then returns half of the string which is the price in fixed 2 decimal digits
                if (text[row + 2].includes("€")) {//excludes the chance of the user to copy accidentally until half of this row
                    price = parseFloat(text[row + 2].replace("€", "").slice(0, text[row + 2].replace("€", "").length / 2)).toFixed(2);
                }
                rowsRead++;
            }

            //extra
            var extraDetails_obj = GetItemExtraDetails(text, row + 3);
            var extraDetails = extraDetails_obj.detailsText;
            rowsRead = rowsRead + extraDetails_obj.detailRows;
            //
            if (!HasRealValue(desc) || !isNumeric(qty) || qty <= 0 || !isNumeric(price) || price < 0) {
                noErrors = false;
                ConsoleOut("Invalid item values!", "ConverToOrderItems: Error! One of the items in your order has invalid values.", "Item Values Error", ConsoleType.warn);
                break;
            } else {
                row = row + rowsRead; //shifting the index "rowsRead" times
                for (var i = 0; i < qty; i++) {
                    tmp_obj.items.push(new Item(desc, price, extraDetails));
                }
            }
        }
    }
    tmp_obj.details.noErrors = noErrors;
    return tmp_obj;
}

//determines if the item has extra details
function GetItemExtraDetails(text, row) {
    if (typeof text[row + 1] !== 'undefined') {
        if (!text[row + 1].includes("Τροποποίηση Παραγγελίας")) {
            if (isNumeric(text[row + 2])) {
                return {detailRows: 1, detailsText: text[row]};
            }
        }
    }
    if (typeof text[row + 1] === 'undefined' || text[row + 1].includes("Τροποποίηση Παραγγελίας")) {
        if (typeof text[row] !== 'undefined' && !text[row].includes("Τροποποίηση Παραγγελίας")) {
            return {detailRows: 1, detailsText: text[row]};
        }
    }
    //if efood adds an extra detail row so the user's extra details add a second one
    if (typeof text[row + 2] === 'undefined' || text[row + 2].includes("Τροποποίηση Παραγγελίας")) {//last item
        return {detailRows: 2, detailsText: (text[row] + " " + text[row + 1])};
    }

    if (typeof text[row + 1] !== 'undefined' && text[row + 2] !== 'undefined' && text[row + 3] !== 'undefined' && text[row + 4] !== 'undefined') {//item between others
        if (isNumeric(text[row + 3]) && text[row + 4].includes("€")) {
            return {detailRows: 2, detailsText: (text[row] + " " + text[row + 1])};
        }
    }
    //

    return {detailRows: 0, detailsText: ""};
}
//

function isEndOfOrder(textLine) {
    if (textLine.includes("Τροποποίηση Παραγγελίας")) {
        return true;
    } else {
        return false;
    }
}
