var budgetController = (function(){
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calPercentage = function (totalIncome){
        if (totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome)*100);
        }else{
            this.percentage = -1;
        }
        
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
             sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        
        totals: {
            exp: 0, 
            inc: 0
        }, 
        budget: 0,
        percent: -1
    };
    
    return {
        addItems: function(type, des, val){
            var newItem, ID;
            //make new ID
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
                data.allItems.exp.push(newItem);
                //data.totals.exp += val;
            }else if(type === 'inc'){
                newItem = new Income(ID, des, val);
                data.allItems.inc.push(newItem);
                //data.totals.inc += val;
            }
            return newItem;    
            
        },
        
        deleteItem: function(type, id){
            var ids, index;
            
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1){
                //deletes item at index and nothing else.
                //1 means its deleting one item, 2 would be deleting
                //the item at the index and the next one.
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: function(){
            //cal total income and expenses
            calTotal('exp');
            calTotal('inc');
            
            data.budget = data.totals.inc - data.totals.exp;
            
            //cal budget: income - expenses
            if (data.totals.inc > 0){
                //cal percentage of income that we spent
                data.percent = Math.round((data.totals.exp / data.totals.inc)*100);
            }
            
            else{
                data.percent = -1;
            }
                    
        },
        
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calPercentage(data.totals.inc);
            });
        },
        
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage(); 
            });
            return allPerc;
        },
        
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percent: data.percent
            };
        },
        
        test: function (){
            console.log(data);
        }
    };
    
})();



var UIController = (function(){
    DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        monthContainer: '.budget__title',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPerLabel: '.item__percentage'
        
        
    };
    
    var formatNumber = function(num, type){
            //for formatting numbers more aestically
            var numSplit, int, dec;
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            int = numSplit[0];
            if(int.length > 3){
                int = int.substr(0, int.length - 3)+','+int.substr(int.length - 3, 3);
            }
            
            dec = numSplit[1];
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        };
    
    return {
        getinput: function (){
            return {
                //use . to get class text
                type: document.querySelector(DOMstrings.inputType).value, //its either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
            
        
        },
        
        addListItem: function(obj, type){
            var html, newHTML, element;
            
            if (type === 'inc'){
            //html string with placeholder tags
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp'){
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percent%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else{
                console.log('Error')
            }
            
            
            //Replace the placeholder tags with actual text
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
            //newHTML = newHTML.replace('%percent%', obj);
            
            //insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },
        
        deleteListItem: function(selectorID){
            
            var elem =  document.getElementById(selectorID);
            console.log('The element is '+elem);
            elem.parentNode.removeChild(elem);
        },
        
        clearFields: function(){
            var fields, fieldsArr;
            //turns array into list
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            //turns list into an array
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
                
            });
            
            //puts focus back on first element of array (add description)
            fieldsArr[0].focus();
            
        },
        
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percent !== -1){
                
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percent+'%';
            }else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },
        
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPerLabel);
            
            var nodeListForEach = function(list, callback){
                for(var i = 0; i < list.length; i++){
                    callback(list[i], i);
                }
            };
            
            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0){
                    current.textContent = percentages[index]+'%'
                }else{
                    current.textContent = '---'
                }          
                
            });
            
        },
        
        
        
        getDOMstrings: function(){
            return DOMstrings;
        }
    }
})();

var controller = (function(budgetCtrl, UICtlr){
    
    var setUpEventListeners = function(){
        
        var DOM = UICtlr.getDOMstrings();
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
    
        //for pressing keyboard key
        document.addEventListener('keypress', function(event){
            //console.log(event);
            if(event.keyCode === 13 || event.which === 13){
                console.log('Enter was pressed');
                ctrlAddItem();
            }
                        
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };
    
    var updatePercentages = function(){
        //Cal percentages
        budgetCtrl.calculatePercentages();
        
        //Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        //Update the UI
        UICtlr.displayPercentages(percentages);
    };
    
    var updateBudget = function(){
        //Calculate the budget
        budgetCtrl.calculateBudget();
        
        //Return the budget
        var budget = budgetCtrl.getBudget();
        //console.log(budget);
        
        //Display the budget on the UI
        UICtlr.displayBudget(budget);
        
    };
    
    //event can be passed into all functions regardless
    //Function for use of delete button
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        //displays where click was on webpage
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID){
            //inc-1 will be split to "inc","1"
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //delete item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            //delete the item from the UI
            UICtlr.deleteListItem(itemID);
            
            //Update and show the new budget
            updateBudget();
            
            //Update percentages
            updatePercentages();
        }
    };
    
    //. is to access a class
    var ctrlAddItem = function (){
        var input, newItem;
        
        //get field input data
        input = UICtlr.getinput();
        //console.log(Math.sign(input.value) === -1);
        
        //Making sure the description is filled and the value is not a number and greater than 0        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
            //console.log(input);
            //add item to cuget controller
            newItem = budgetCtrl.addItems(input.type, input.description, input.value);
            //add item to UI
            //console.log(input);
            //console.log(newItem);
            UICtlr.addListItem(newItem, input.type);

            //clear fields
            UICtlr.clearFields();

            //Calculate budget
            updateBudget();

            //Update percentages
            updatePercentages();
            
        }else{
            console.log("Error ");
            UICtlr.clearFields();
        }
        
        
        
    };
    
    
    var realDate = function (){
            var monthStrl, year;
            var d = new Date();
            d = d.toJSON();
            year = d.slice(0, 4);
            //console.log(year);
            d = d.slice(5,7);
            //d = '12'
            //console.log(d);
                  
            if (d === '01'){
                monthStrl = "January";
            }else if (d === '02'){
                monthStrl = "Febuary";
            }else if (d === '03'){
                monthStrl = "March";
            }else if (d === '04'){
                monthStrl = "April";
            }else if (d === '05'){
                monthStrl = "May";
            }else if (d === '06'){
                monthStrl = "June";
            }else if (d === '07'){
                monthStrl = "July";
            }else if (d === '08'){
                monthStrl = "August";
            }else if (d === '09'){
                monthStrl = "September";
            }else if (d === '10'){
                monthStrl = "October";
            }else if (d === '11'){
                monthStrl = "November";
            }else if (d === '12'){
                monthStrl = "December";
            }else{
                monthStrl = "error"
            }
          
        return monthStrl+' '+year;        
        
    };
    
    return{
        init: function(){
            var html, newHTML, month, element;
            var DOM = UICtlr.getDOMstrings();
            console.log('Application has started');
            html = 'Available Budget in <span class="budget__title--month">%Month%</span>:';
            month = realDate();
            //console.log(month);
            newHTML = html.replace('%Month%', month);
            //console.log(newHTML);
            element = DOM.monthContainer;
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
            document.querySelector(DOM.budgetLabel).textContent = '+ 0';
            document.querySelector(DOM.incomeLabel).textContent = '+ 0';
            document.querySelector(DOM.expenseLabel).textContent = '- 0';
            document.querySelector(DOM.percentageLabel).textContent = '0%';
            
            setUpEventListeners();
        }
    }
    
    
    
})(budgetController, UIController);

controller.init();



