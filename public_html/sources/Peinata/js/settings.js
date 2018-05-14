//JS for settings
function ConsoleOut(messageUI, messageLog, details, type) {
    if (type === ConsoleType.log) {
        console.log(messageLog);
        LogSave(messageLog, type, details);
        if (messageUI !== "") {
            _ngToast.info({content: messageUI});
        }
    } else if (type === ConsoleType.warn) {
        console.log(messageLog);
        LogSave(messageLog, type, details);
        if (messageUI !== "") {
            _ngToast.danger({content: messageUI});
        }
    } else if (type === ConsoleType.developer) {
        LogSave(messageLog, type, details);
    }
}

// date prototype constructor customazation
Date.prototype.today = function () {
    return ((this.getDate() < 10) ? "0" : "") + this.getDate() + "/" + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "/" + this.getFullYear();
};
Date.prototype.timeNow = function () {
    return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
};
//

function ValidateStorageSupport() {
    if (typeof (localStorage) !== "undefined") {
        return true;
    } else {
        ConsoleOut("You must enable local storage in your browser!",
                "ValidateStorageSupport: Error! Cannot create local data, your browser does not support local storage!",
                "Local Storage Support Error", ConsoleType.warn);
        return false;
    }
}

function LogSave(message, type, details = "") {//'{"log":{},"warn":{}}'
    var date = new Date();
    var obj = GetLocalData(localStorageType.Console);
    if (!(date.today() in obj[type])) {//if the date isnt already registered, creates todays attribute
        obj[type][date.today()] = [];
    }
    obj[type][date.today()].push({time: date.timeNow(), details: details, message: message});
    SetLocalData(localStorageType.Console, obj);
}

//saves a new instance of local data
function SetLocalData(type, json_obj) {
    try {
        if (type === localStorageType.Users) {
            var oldData = GetLocalData(localStorageType.Users);
            localStorage.setItem("Users", angular.toJson(json_obj));
            if (angular.toJson(json_obj) === angular.toJson(GetLocalData(localStorageType.Users))) {//checks if the saved data saved without errors and is the same as the for saving
                return true;
            } else {//if the validation fails, it restores the old data
                localStorage.setItem("Users", angular.toJson(oldData));
                ConsoleOut("Save failed! Previous data restored.", "SetLocalData(Users,obj): Error! Details: The file was corrupted during the save, previous save data was restored.", "Save Error", ConsoleType.warn);
                return false;
            }
        } else if (type === localStorageType.LastOrder) {
            var oldData = GetLocalData(localStorageType.LastOrder);
            localStorage.setItem("LastOrder", angular.toJson(json_obj));
            if (angular.toJson(json_obj) === angular.toJson(GetLocalData(localStorageType.LastOrder))) {//checks if the saved data saved without errors and is the same as the for saving
                return true;
            } else {//if the validation fails, it restores the old data
                localStorage.setItem("LastOrder", angular.toJson(oldData));
                ConsoleOut("Save failed! Previous data restored.", "SetLocalData(LastOrder,obj): Error! Details: The file was corrupted during the save, previous save data was restored.", "Save Error", ConsoleType.warn);
                return false;
            }
        } else if (type === localStorageType.LastUserModel) {
            var oldData = GetLocalData(localStorageType.LastUserModel);
            localStorage.setItem("LastUserModel", angular.toJson(json_obj));
            if (angular.toJson(json_obj) === angular.toJson(GetLocalData(localStorageType.LastUserModel))) {//checks if the saved data saved without errors and is the same as the for saving
                return true;
            } else {//if the validation fails, it restores the old data
                localStorage.setItem("LastUserModel", angular.toJson(oldData));
                ConsoleOut("Save failed! Previous data restored.", "SetLocalData(LastUserModel,obj): Error! Details: The file was corrupted during the save, previous save data was restored.", "Save Error", ConsoleType.warn);
                return false;
            }
        } else if (type === localStorageType.Console) {
            var oldData = GetLocalData(localStorageType.Console);
            localStorage.setItem("Console", angular.toJson(json_obj));
            if (angular.toJson(json_obj) === angular.toJson(GetLocalData(localStorageType.Console))) {//checks if the saved data saved without errors and is the same as the for saving
                return true;
            } else {//if the validation fails, it restores the old data
                localStorage.setItem("Console", angular.toJson(oldData));
                ConsoleOut("Save failed! Previous data restored.", "SetLocalData(Console,obj): Error! Details: The file was corrupted during the save, previous save data was restored.", "Save Error", ConsoleType.warn);
                return false;
            }
        }
    } catch (e) {
        ConsoleOut("Save Exception!", "SetLocalData: Error! Details: " + e, "Save Error", ConsoleType.warn);
        return false;
    }
}
//

//returns the users from local storage in a json obj format
function GetLocalData(type) {
    if (ValidateStorageSupport()) {
        try {
            if (type === localStorageType.Users) {

                if (!localStorage.Users) {
                    localStorage.setItem("Users", GetRootObject(type));
                }
                return JSON.parse(localStorage.Users);
            } else if (type === localStorageType.LastOrder) {
                if (!localStorage.LastOrder) {
                    localStorage.setItem("LastOrder", GetRootObject(type));
                }
                return JSON.parse(localStorage.LastOrder);
            } else if (type === localStorageType.LastUserModel) {
                if (!localStorage.LastUserModel) {
                    localStorage.setItem("LastUserModel", GetRootObject(type));
                }
                return JSON.parse(localStorage.LastUserModel);
            } else if (type === localStorageType.Console) {
                if (!localStorage.Console) {
                    localStorage.setItem("Console", GetRootObject(type));
                }
                return JSON.parse(localStorage.Console);
            }
        } catch (e) {
            ConsoleOut("Load Error", "GetLocalData Error! Details: " + e, "Load Exception", ConsoleType.warn);
        }
    }
}
//

function GetRootObject(type) {
    if (type === localStorageType.Users) {
        return '{"Users":[], "Columns":["Name","Delete"]}';
    } else if (type === localStorageType.LastOrder) {
        return '{"info":{}, "items":[]}';
    } else if (type === localStorageType.LastUserModel) {
        return angular.toJson(GetUsersName());
    } else if (type === localStorageType.Console) {
        return '{"log":{},"warn":{},"dev{}}';
    }
}

function GenerateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function HasRealValue(val) {
    return (val) ? true : false;
}

Number.prototype.round = function (places) {
    return +(Math.round(this + "e+" + places) + "e-" + places);
};

function isNumeric(num) {
    return !isNaN(num);
}
