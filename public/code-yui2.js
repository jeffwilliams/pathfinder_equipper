/**** Equipment Fields ****/
var AvailableWeaponFields = [
  'Name',
  'Cost',
  'Dmg_S',
  'Dmg_M',
  'Critical',
  'Range',
  'Weight',
  'Type',
  'Special',
  'copper_cost',
  'halfpound_weight'
];

// Fields for display
var AvailableWeaponColumns = [
  { key: 'Name', label: 'Name', sortable: true },
  { key: 'Cost', label: 'Cost' },
  { key: 'Dmg_S', label: 'Dmg (S)' },
  { key: 'Dmg_M', label: 'Dmg (M)' },
  { key: 'Critical', label: 'Critical' },
  { key: 'Range', label: 'Range' },
  { key: 'Weight', label: 'Weight' },
  { key: 'Type', label: 'Type' },
  { key: 'Special', label: 'Special' }
];

var AvailableArmorFields = [
  'Name',
  'Cost',
  'AC_Bonus',
  'Maximum',
  'Check_Penalty',
  'Arcane_Failure',
  'Speed_30',
  'Speed_20',
  'Weight',
  'copper_cost',
  'halfpound_weight'
];

var AvailableArmorColumns = [
  { key: 'Name', label: 'Name', sortable: true },
  { key: 'Cost', label: 'Cost' },
  { key: 'AC_Bonus', label: 'AC', sortable: true },
  { key: 'Maximum', label: 'Max Dex' },
  { key: 'Check_Penalty', label: 'Check Penalty' },
  { key: 'Arcane_Failure', label: 'Arcane Failure' },
  { key: 'Speed_30', label: 'Speed (30 ft)' },
  { key: 'Speed_20', label: 'Speed (20 ft)' },
  { key: 'Weight', label: 'Weight' }
];

var AvailableGoodsFields = [
  'Name',
  'Cost',
  'Weight',
  'copper_cost',
  'halfpound_weight'
];

var AvailableGoodsColumns = [
  { key: 'Name', label: 'Name', sortable: true },
  { key: 'Cost', label: 'Cost' },
  { key: 'Weight', label: 'Weight' }
];

var SelectedEquipmenFields = [
  'Name',
  'Cost',
  'Weight',
  'Type',
  'Qty',
  'orig_equipment_name'
];

var SelectedEquipmentColumns = [
  { key: 'Name', label: 'Name', sortable: true },
  { key: 'Cost', label: 'Cost', sortable: true },
  { key: 'Weight', label: 'Weight', sortable: true },
  { key: 'Type', label: 'Type', sortable: true },
  { key: 'Qty', label: 'Qty', sortable: true }
];

/**** End Equipment Fields ****/
/**** UI Struct ****/

var UI = {};

/**** End UI Struct ****/

/**** Classes ****/

function Label(id)
{
  this.element = document.getElementById(id)
  if(this.element == null)
  {
    throw "No such element with id '"+"id"+"'";
  }
  this.setText = Label_setText;
}

function Label_setText(text)
{
  var children = this.element.childNodes;
  for( var n = 0; n < this.element.childNodes.length; n++)
  {
    var child = this.element.childNodes[n];
    this.element.removeChild(child);
  }
  var newText = document.createTextNode(text);
  this.element.appendChild(newText);
}

/**** End Classes ****/

/**** YUI AJAX Callback class ****/

function LoadDataCallback_success(o){
  try {
    json = YAHOO.lang.JSON.parse(o.responseText);
    this.dataTable.addRows(json['result']);
  }
  catch(e){
    alert(e);
  }
}
function DataCallback_failure(o){
  alert("Ajax failed: " + o.status + " " + o.responseText);
}

// Constructor
function LoadDataCallback(dataTable){
  this.dataTable = dataTable;
  this.success = LoadDataCallback_success;
  this.failure = DataCallback_failure;
}

function SaveDataCallback(){
  this.success = null;
  this.failure = DataCallback_failure;
}

function GeneratePdf_success(o){
  // Redirect the browser to the returned specified URL; this is the download link for the PDF file.
  newWindow = window.open(o.responseText,'PDF');
  if (window.focus) {
    newWindow.focus();
  }
  return false;
}

function GeneratePdfCallback(){
  this.success = GeneratePdf_success;
  this.failure = DataCallback_failure;
}

/**** END YUI AJAX Callback class ****/

/**** Utility functions ****/
function cloneArray(a){
  return a.slice(0);
}

// Format a copper cost into gp, sp, etc as appropriate.
function formatCopperCost(cost){
  cost = Math.floor(Number(cost));
  var silver = Math.floor(cost / 10);
  var copper = cost % 10;

  var gold = Math.floor(silver / 10);
  silver = silver % 10;

  console.log("formatCopperCost: raw=" + cost);
  console.log("formatCopperCost: gold=" + gold);
  console.log("formatCopperCost: silver=" + silver);
  console.log("formatCopperCost: copper=" + copper);

  result = ""

  if ( gold > 0 ){
    result = result + gold + " gp";
  }
  if ( silver > 0 ){
    if ( result.length > 0 )
      result = result + ", "
    result = result + silver + " sp";
  }
  if ( copper > 0 ){
    if ( result.length > 0 )
      result = result + ", "
    result = result + copper + " cp";
  }
 
  if( result.length == 0 ){
    result = "0 gp";
  }
 
  return result;
}

// Format a halfpound weight in pounds
function formatHalfpoundWeight(weight){
  weight = Number(weight)/2 + " lbs.";
  return weight;
}

/* Get all the rows of a datatable as hashes. */
function getDataTableRows(dataTable){
  result = []
  records = dataTable.getRecordSet().getRecords();
  for( var i = 0; i < records.length; i++ ) {
    row = {};
    for( var j = 0; j < SelectedEquipmenFields.length; j++ ){
      var field = SelectedEquipmenFields[j];
      row[field] = records[i].getData(field);
    }
    result.push(row);
  }
  return result;
}

/* Convert an available-equipment Datatable Record into a Selected Equipment hash */
function convertAvailableRecordToSelectedHash(record, qty, type)
{
  var result = {}
  result['Name'] = record.getData('Name');
  //result['Cost'] = record.getData('Cost');
  result['Cost'] = formatCopperCost(Number(record.getData('copper_cost'))*qty);
  //result['Weight'] = record.getData('Weight');
  result['Weight'] = Number(record.getData('halfpound_weight'))*qty/2 + " lbs.";
  result['Type'] = type == null ? 'Weapon' : type;
  result['Qty'] = qty;
  result['copper_cost'] = record.getData('copper_cost');
  result['halfpound_weight'] = record.getData('halfpound_weight');
  result['orig_equipment_name'] =  record.getData('Name'); // This is in case we modify the name; like adding the "Silver" modifier

  return result;
}

function makeAvailableEquipmentTable(fieldsDef, columnDef, elementId)
{
  /* Simple Javascript datasource */
  var dataSource = new YAHOO.util.DataSource( null );
  dataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
  dataSource.responseSchema = { fields: cloneArray(fieldsDef) };

  var availEqTable = new YAHOO.widget.ScrollingDataTable(elementId, columnDef, dataSource,
    {height: "400px"});
  availEqTable.showTableMessage("Loading data...");

  // Subscribe to events for row selection
  availEqTable.subscribe("rowMouseoverEvent", availEqTable.onEventHighlightRow);
  availEqTable.subscribe("rowMouseoutEvent", availEqTable.onEventUnhighlightRow);
  availEqTable.subscribe("rowClickEvent", availEqTable.onEventSelectRow);

  // Programmatically select the first row
  availEqTable.selectRow(availEqTable.getTrEl(0));

  return availEqTable;
}

// Update the total cost and total quantity of the selected list
function updateSelectedEquipmentTotals()
{
  console.log("updateSelectedEquipmentTotals: called");
  var totalCost = 0
  var totalWeight = 0
  var dataTable = UI.selectedEquipmentTable;

  try{
    var records = dataTable.getRecordSet().getRecords();
    for( var i = 0; i < records.length; i++ ) {
      totalCost += Number(records[i].getData('copper_cost')) * Number(records[i].getData('Qty'));
      totalWeight += Number(records[i].getData('halfpound_weight')) * Number(records[i].getData('Qty'));
    }

    console.log("updateSelectedEquipmentTotals: total halfpound weight=" + totalWeight);
    UI.selectedTotalCostLabel.setText(formatCopperCost(totalCost));
    UI.selectedTotalWeightLabel.setText(formatHalfpoundWeight(totalWeight));
  } catch(e) {
    console.log("updateSelectedEquipmentTotals: exception updating totals: " + e);
  }
}


/**** End Utility Functions ****/

/**** Event handlers ****/

function toggleItemModifier(type, args, obj){
  var checked = this.cfg.getProperty("checked");
  checked = ! checked;
  this.cfg.setProperty("checked", checked); 
  alert('obj');
}

/* Add a row to the selected equipment table. If a row with the same Name already exists,
   the Qty is increased by one. */
function addRowToSelectedEquipment(row){
  recordSet = UI.selectedEquipmentTable.getRecordSet();
  records = recordSet.getRecords();
  for( var i = 0; i < records.length; i++ ) {
    if ( records[i].getData('Name') == row['Name'] ){
      row['Qty'] = Number(row['Qty']) + Number(records[i].getData('Qty'));
      UI.selectedEquipmentTable.updateRow(records[i], row);
      return;
    }
  }
  UI.selectedEquipmentTable.addRow(selected);

}

function addSelectedEquipment(e)
{
  // Figure out what equipment list we are going to add from, based on the active tab.
  var tabIndex = UI.tabview.get('activeIndex');
  var table = null;
  var type = null;

  if ( tabIndex == 0 ){
    table = UI.availWeaponTable;
    type = "Weapon";
  } 
  else if ( tabIndex == 1 ){
    table = UI.availArmorTable;
    type = "Armor";
  }
  else if ( tabIndex == 2 ){
    table = UI.availGoodsTable
    type = "Good";
  }
  else{
    console.log("addSelectedEquipment: unknown tab index");
    return;
  }

  selectedRowIds = table.getSelectedRows();
  for(var i = 0; i < selectedRowIds.length; i++) {
    var record = table.getRecord(selectedRowIds[i]); 
    var qtyElem = document.getElementById('qty');
    var qty = 1
    if ( qtyElem ){
      //selected.Qty = qtyElem.value
      qty = Number(qtyElem.value)
    }
    selected = convertAvailableRecordToSelectedHash(record, qty, type);
    addRowToSelectedEquipment(selected);
  }
  updateSelectedEquipmentTotals();
}

function removeSelectedEquipment(e)
{
  console.log("removeSelectedEquipment: called");
  selectedRowIds = UI.selectedEquipmentTable.getSelectedRows();

  for(var i = 0; i < selectedRowIds.length; i++) {
    UI.selectedEquipmentTable.deleteRow(selectedRowIds[i]);
  }
  updateSelectedEquipmentTotals();
}

function correctNumberInInputField(type, args, obj){
  var n = Number(this.value);
  if ( isNaN(n) ){
    n = 1;
  }
  this.value = n;
  console.log(this.value);
}

/**** End Event handlers ****/


// Defer instantiation until window load.
YAHOO.util.Event.addListener(window, "load", function() {

  UI.addButton = new YAHOO.widget.Button("add");
  UI.removeButton = new YAHOO.widget.Button("remove");
  UI.generatePdfButton = new YAHOO.widget.Button("generate_pdf");
  // Attach a listener to the #add button
  UI.addButton.on('click', addSelectedEquipment);
  UI.removeButton.on('click', removeSelectedEquipment);
  UI.generatePdfButton.on('click', function(e) {
    /* Save data using AJAX */
    var transaction = YAHOO.util.Connect.asyncRequest('POST', "/make_pdf", new GeneratePdfCallback(),
      "data=" + YAHOO.lang.JSON.stringify(getDataTableRows(UI.selectedEquipmentTable)));
  });
  UI.selectedTotalCostLabel = new Label("selected_cost");
  UI.selectedTotalWeightLabel = new Label("selected_weight");


  // TabView
  UI.tabview = new YAHOO.widget.TabView("available_tabview"); 
  UI.tabview.addTab( new YAHOO.widget.Tab({
    label: 'Weapons',
    content: '<div id="available_weapons">Loading Weapons...</div>',
    active: true
  }));

  UI.tabview.addTab( new YAHOO.widget.Tab({
    label: 'Armor',
    content: '<div id="available_armor">Loading Armor...</div>'
  }));
   
  UI.tabview.addTab( new YAHOO.widget.Tab({
      label: 'Goods and Services',
      content: '<div id="available_goods">Loading Goods...</div>'
  }));
 
  /*** Available Equipment Tables ***/
  UI.availWeaponTable = makeAvailableEquipmentTable(AvailableWeaponFields, AvailableWeaponColumns, "available_weapons");
  UI.availArmorTable = makeAvailableEquipmentTable(AvailableArmorFields, AvailableArmorColumns, "available_armor");
  UI.availGoodsTable = makeAvailableEquipmentTable(AvailableGoodsFields, AvailableGoodsColumns, "available_goods");
  /*** End Available Equipment Tables ***/

  UI.selectedEquipmentTable = makeAvailableEquipmentTable(SelectedEquipmenFields, SelectedEquipmentColumns, "selected_equipment");
  UI.selectedEquipmentTable.showTableMessage("(add some equipment)");

  /* Load data using AJAX */
  var transaction = YAHOO.util.Connect.asyncRequest('GET', "/equipment?type=weapons", new LoadDataCallback(UI.availWeaponTable), null);
  var transaction = YAHOO.util.Connect.asyncRequest('GET', "/equipment?type=armor", new LoadDataCallback(UI.availArmorTable), null);
  var transaction = YAHOO.util.Connect.asyncRequest('GET', "/equipment?type=goods", new LoadDataCallback(UI.availGoodsTable), null);

  /*
  YAHOO.util.Event.addListener("load", "click", function(e) {
    // Clear the table
    UI.availWeaponTable.getRecordSet().reset();
    UI.availWeaponTable.render();
    // Load data using AJAX
    var transaction = YAHOO.util.Connect.asyncRequest('GET', "/equipment?type=weapons", new LoadDataCallback(UI.availWeaponTable), null);
  });

  YAHOO.util.Event.addListener("save", "click", function(e) {
    // Save data using AJAX 
    var transaction = YAHOO.util.Connect.asyncRequest('POST', "/equipment", new SaveDataCallback(), 
      "data=" + YAHOO.lang.JSON.stringify(getDataTableRows(table)));
  });

  YAHOO.util.Event.addListener("generate_pdf", "click", function(e) {
    var transaction = YAHOO.util.Connect.asyncRequest('POST', "/make_pdf", new GeneratePdfCallback(), 
      "data=" + YAHOO.lang.JSON.stringify(getDataTableRows(UI.selectedEquipmentTable)));
  });
  */

  YAHOO.util.Event.addListener("qty", "change", correctNumberInInputField);
 
  // Context menu
  UI.menu = new YAHOO.widget.ContextMenu("available_weapons_menu",{ 
    trigger: "available_weapons",
    lazyload: true
  });
  UI.menu.addItems([
    { text: "Modify",
      submenu: {
        id: 'modifiers',
        itemdata: [
          { text: "Silver", onclick: { fn: toggleItemModifier, obj: "silver", checked: false } }
        ]
      }
    },
  ]);
  UI.menu.render(document.body);
   
});
