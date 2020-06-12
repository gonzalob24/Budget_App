/*  Simple Budget App that allows user to enter incomes and expenses.
    The user can see the incomes and expenses separated on the screen.
    The incomes are on the right and expenses on the left. Once income
    is entered total income and expenses are updated. The user is also
    able to see the percentage of money used per expense. 

    I used 3 modules in which I used a main controller to get information
    from the other two. 

    UI Module used to:
        Get input data
        add the new item to the UI
        update the UI

    Data Module:
        Add new item to the data structure
        calculate budget
        calculate percentages

    Controller Module:
        Add event handlers
        call other modules

    */

////////////////////////////////////////////////////////////////////////

/////////////////////////
// MODULE PATTERN IN JS /
/////////////////////////

// Budget Controller
var budgetController = (function () {

    // Function constructor for each expense
    // Each expense that is entered is treated and
    // stored as an obejct
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    // function to expense prototype
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    // getter method to return percentage
    Expense.prototype.getPctg = function () {
        return this.percentage;
    };

    // Function constructor for each Income
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Calculate totals depending on type of object, inc or exp
    var calcTotal = function (type) {
        var sumAll = 0;
        data.allItems[type].forEach(function (item) {
            sumAll += item.value;
        });

        data.totals[type] = sumAll;
    };

    // I can put all items in one place.
    var data = {
        // inc --> expense
        // exp --> expense

        allItems: {
            exp: [],
            inc: [],
        },

        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,

    };

    // Public methods ot be used by other modules
    return {
        // input comes from the UI controller
        // input type will be inc or exp
        addItem: function (type, des, val) {
            var newItem, ID;

            // ID will be last ID number + 1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // create new item if it is inc or exp and push newItem to data structure
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // push the items to the allItems structure in data
            data.allItems[type].push(newItem);

            // return the new item
            return newItem;
        },

        // function to delete an item
        deleteItem: function (type, id) {
            var ids, index;
            // id = 6
            //[1 2 4 6 8]
            // index = 3

            // map returns a new array with stored ids
            ids = data.allItems[type].map(function (current) {
                return current.id;
            })

            // returns index of the element passed
            index = ids.indexOf(id);

            // delete item from the array
            if (index !== -1) {
                // splice is used to remove elements
                data.allItems[type].splice(index, 1);
            }
        },

        // public budget method
        calcBudget: function () {
            // calculate total income and expenses
            calcTotal('exp');
            calcTotal('inc');

            // calculate the budget: inc - exp
            data.budget = data.totals.inc - data.totals.exp;

            // calculate percentage of income spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        // Calculate percentages
        calculatePercentage: function () {
            // calcPercentage comes from the prototype
            data.allItems.exp.forEach(function (item) {
                item.calcPercentage(data.totals.inc);
            });
        },

        // getter method to get percentage
        getPercentage: function () {
            // getPctg comes from the prototype
            var allPercentages = data.allItems.exp.map(function (current) {
                return current.getPctg()
            });
            return allPercentages;
        },

        // return the budget. Can return an object since I
        // will return a few things related to budget
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },

        // used to help with debugging
        testing: function () {
            console.log(data);
        }
    };

})();


// UI Controller
var uiController = (function () {
    // Private variable to store the DOM strings to keep them all in one place
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    // method to format numbers
    var formatNumber = function (num, type) {
        // + or - before number
        // use 2 decimal places
        // comma for numbers that are in the thousands

        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2); // method of the number prototype to use two decimal places

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            // substring allows me to take part of the string
            int = int.substring(0, int.length - 3) + ',' + int.substring(int.length - 3, int.length)
        }
        dec = numSplit[1];

        // type === 'exp' ? sign = '-' : sign = '+';
        // return type + ' ' + int + dec;
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    // node list function to traverss DOM
    var nodeListForEach = function (list, callback) {
        // for loop that after each iterations calls the callback function
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    // public methods
    return {
        getInput: function () {
            // input comes from:
            // type, description and value entered by user
            return {
                type: document.querySelector(DOMstrings.inputType).value, // the type is withe Income or expense, inc/exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
        },

        // display month using the date object construtor
        displayMonth: function () {
            var year, months, month, day, now;

            now = new Date(); // todays date
            // getFullYear()
            // getMonth()
            // getDay()
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            day = now.getDay();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        // change the UI when the user selects expense or income, change the style of describe and amount
        changeType: function () {
            // This returns a node List use the function that I created 
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function (curr) {
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },

        // pass newItem objects created from user input in the uiController
        addListItem: function (obj, type) {
            var html, newHtml, element;

            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> \
                <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> \
                <button class="item__delete--btn"> <i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> \
                <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> \
                <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> \
                </div> </div> </div>';
            }
            // Repalce the placeholder text with actual data stored in data object
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        // Delete item from the UI
        deleteListItem: function (selectorID) {
            var element;
            // remove child method
            element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        // clear description and value after user enters an item
        clearFields: function () {
            var fields, fieldsArray;
            // returns a list
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            // convert list to an array using slice --> returns a copy
            fieldsArray = Array.prototype.slice.call(fields);

            // selected items in fields is not an array
            fieldsArray.forEach(function (current, index, array) {
                // current element
                current.value = "";
            });

            // returns focus to the input field.
            fieldsArray[0].focus();
        },

        // update the budget
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '--';
            }
        },

        // Display percentages
        displayPercentage: function (percentage) {
            // returns a node list and does not have a forEach method
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {
                // statements for here
                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '--';
                }
            });
        },

        // getter method so that other controllers can use the DOMstrings
        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();

// main controller calls budgetController and uiController
// two parameters to connect budget and ui controller
var controller = (function (budgetCtrler, uiCtrler) {
    var DOM;
    // function to set up the event listeners when they are called
    var setupEventListeners = function () {

        // get the DOMstrings from teh uiController. Where the changes can be made.
        DOM = uiCtrler.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            // when the user hits the return key, keycode = 13
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        // get the container where all inc. and exp are located
        // to delete an item
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', uiCtrler.changeType);
    };

    // update the budget
    var updateBudget = function () {
        // calculate budget
        budgetCtrler.calcBudget();

        // Return the budget
        var budget = budgetCtrler.getBudget();

        // Display the budget on the UI
        uiCtrler.displayBudget(budget);
    };

    // update percentages everytime an item is added or deleted
    var updatePercentage = function () {
        // calcualte percentages
        budgetCtrler.calculatePercentage();

        // Read them from budget controller
        var percentages = budgetCtrler.getPercentage();

        // update the UI with new percentages
        uiCtrler.displayPercentage(percentages);
    };

    // method that will add items.
    var ctrlAddItem = function () {
        var input, newItem;
        // 1. Get input data
        input = uiCtrler.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add item to budget controller
            newItem = budgetCtrler.addItem(input.type, input.description, input.value);

            // 3. Add new item to UI
            uiCtrler.addListItem(newItem, input.type);

            // Clearing the fields
            uiCtrler.clearFields();

            // 5. Calculate and Display the budget in UI
            updateBudget();

            // calculate and update the percentages
            updatePercentage();
        }
    };

    // delete the inc or exp. items from the UI
    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        // get the root node if item ID
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // if item exists
        if (itemID) {
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete the item from data structure
            budgetCtrler.deleteItem(type, ID);

            // delete item from UI
            uiCtrler.deleteListItem(itemID);

            // update new budget in data object
            updateBudget();

            // Calculate and update percentages
            updatePercentage();
        }
    };

    return {
        initFunction: function () {
            console.log('App has started');
            uiCtrler.displayMonth();
            uiCtrler.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0,
            });

            setupEventListeners();
        }
    };


})(budgetController, uiController);

// Calling the initialization function
controller.initFunction();




























// Test Code
/*
var budgetController = (function() {
    var x = 23;

    var add = function(a) {
        return x + a;
    };


    return {
        publicTest: function(b) {
            return (add(b));
        }
    }

})();


// controller that controlls the UI
var uiController = (function() {
    //

})();

// main controller calls budgetController and uiController to connect them
// two parameters to connect budget and ui controller
var controller = (function(budgetCtrler, uiCtrler) {
    var z = budgetCtrler.publicTest(5);

    return {
        publicTest2: function() {
            console.log(z);
        }
    }

})(budgetController, uiController);

*/
