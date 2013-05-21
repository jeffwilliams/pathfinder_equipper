/**** IE Hacks ****/
if ( typeof console === "undefined"  )
{
  FakeConsole = function(){
    this.log = function log(s){ };
  }

  console = new FakeConsole();
}

if (!Object.keys) {
  Object.keys = function (obj) {
    var keys = [], k;
    for (k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        keys.push(k);
      }
    }
    return keys;
  };
}

/**** End IE Hacks ****/

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
  'halfpound_weight',
  'last_parent'
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
  'halfpound_weight',
  'last_parent'
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
  'halfpound_weight',
  'last_parent'
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
  'base_name',
  'last_parent'
];

var SelectedEquipmentColumns = [
  { key: 'Name', label: 'Name', sortable: true },
  { key: 'Cost', label: 'Cost', sortable: true },
  { key: 'Weight', label: 'Weight', sortable: true },
  { key: 'Type', label: 'Type', sortable: true },
  { key: 'Qty', label: 'Qty', sortable: true }
];

var WeaponModifiers = [
  { label: "Small", modifier: "small" },
  { label: "Masterwork", modifier: "masterwork" },
  { label: "Silver", modifier: "silver" },
  { label: "Cold Iron", modifier: "cold_iron" },
  { label: "Darkwood", modifier: "darkwood" }
];

var ArmorModifiers = [
  { label: "Small", modifier: "small" },
  { label: "Masterwork", modifier: "masterwork" },
  { label: "Mithral", modifier: "mithral" },
  { label: "Darkwood", modifier: "darkwood" },
  { label: "Dragonhide", modifier: "dragonhide" }
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

// Class representing an item modifier.
function Modifier(name)
{
  this.name = name;
  
  // For small weapons
  this.weightFactor = 1;

  // Silver, Masterwork (depends on type of weapon)
  this.costModifier = 0;

  // Armor
  this.checkPenaltyModifier = 0;
  this.arcaneFailureModifier = 0;
  this.maxDexModifier = 0;



  this.apply = Modifier_apply;
  this.unapply = Modifier_unapply;
}

// Factory function. Create a Modifier object of the specified modifierName
// (silver, masterwork, etc) and if needed use the specified rowData for the row
// being modified to help build the object.
function createModifier(modifierName, rowData)
{
  // Create some regex as static variables
  if ( typeof(createModifier.ammunitionRegex) == 'undefined' ) 
  {
    createModifier.ammunitionRegex = /\((\d+)\)$/
  }

  var modifier = new Modifier(modifierName);
  if( modifierName == "masterwork" )
  {
    // Is it for a weapon?
    if( rowData['Type'] == "Weapon" )
    {
      // "The masterwork quality adds 300 gp to the cost of a normal weapon (or 6 gp to the cost of a single unit of ammunition)"
      // We detect ammunition here by looking for a quantity in parenthesis after the name, i.e. "Arrows (20)"
      match = matchAmmunition(rowData['Name']);
      if ( match != null )
      {
        // Ammunition. Add 6gp per unit.
        modifier.costModifier = parseInt(match[1])*600;
      } 
      else
      {
        modifier.costModifier = 30000;
      }
    } 
    else
    {
      // Armor
      modifier.costModifier = 15000;
      if ( Number(rowData['Check_Penalty']) < 0 )
        modifier.checkPenaltyModifier = 1; 
    }
  }
  else if ( modifierName == "silver" )
  {
    match = matchAmmunition(rowData['Name']);
    if ( match != null ){
      // Ammunition
      modifier.costModifier = 200;
    }
    else if ( rowData['last_parent'] == 'Light Melee Weapons' )
    {
      modifier.costModifier = 2000;
    }
    else if ( rowData['last_parent'] == 'One-Handed Melee Weapons' )
    {
      modifier.costModifier = 9000;
    }
    else if ( rowData['last_parent'] == 'Two-Handed Melee Weapons' )
    {
      modifier.costModifier = 18000;
    }

    console.log("Last parent: " + rowData['last_parent']);  
  }
  else if ( modifierName == "cold_iron" )
  {
    modifier.costModifier = Number(rowData['base_copper_cost']);
  }
  else if ( modifierName == "mithral" )
  {
    modifier.checkPenaltyModifier = 3;
    if ( modifier.checkPenaltyModifier + Number(rowData['Check_Penalty']) > 0 )
      modifier.checkPenaltyModifier -= modifier.checkPenaltyModifier + Number(rowData['Check_Penalty']);

    modifier.arcaneFailureModifier = -10;
    // We use parseInt here since arcane_failure is of the form 30%, and we want to ignore the %. 
    if ( modifier.arcaneFailureModifier + parseInt(rowData['Arcane_Failure']) < 0 )
      modifier.arcaneFailureModifier -= modifier.arcaneFailureModifier + Number(rowData['Arcane_Failure']);

    modifier.maxDexModifier = 2;
    modifier.weightFactor = 0.5;

    if( rowData['last_parent'] == 'Light armor' )
    {
       modifier.costModifier = 100000;
    }
    else if( rowData['last_parent'] == 'Medium armor' )
    {
       modifier.costModifier = 400000;
    }
    else if( rowData['last_parent'] == 'Heavy armor' )
    {
       modifier.costModifier = 900000;
    }
    else if( rowData['last_parent'] == 'Shields' )
    {
       modifier.costModifier = 100000;
    }
  }
  else if( modifierName == "small" )
  {
    modifier.weightFactor = 0.5;
  }
  else if( modifierName == "darkwood" )
  {
    // Is it for a shield?
    if( rowData['last_parent'] == "Shields" )
    {
      modifier.checkPenaltyModifier = 2;
      if ( modifier.checkPenaltyModifier + Number(rowData['Check_Penalty']) > 0 )
        modifier.checkPenaltyModifier -= modifier.checkPenaltyModifier + Number(rowData['Check_Penalty']);
    }
    modifier.weightFactor = 0.5;
    // "To determine the price of a darkwood item, use the original weight but add 10 gp per pound to the price of a masterwork version of that item."
    tempModifier = createModifier("masterwork", rowData);
    modifier.costModifier = tempModifier.costModifier + 1000*Number(rowData['base_halfpound_weight'])/2;
  }
  else if( modifierName == "dragonhide" )
  {
    tempModifier = createModifier("masterwork", rowData);
    modifier.costModifier = tempModifier.costModifier *2;
  }
  else 
  {
    console.log("Unknown modifier " + modifierName + ". Using unit modifier.");
  }

  // Multiply cost modifiers by quantity
  modifier.costModifier *= Number(rowData['Qty']);

  return modifier;
}

function Modifier_apply(rowData)
{
  try
  {
    rowData['copper_cost'] = Number(rowData['copper_cost']) + this.costModifier;
    rowData['halfpound_weight'] = Number(rowData['halfpound_weight']) * this.weightFactor;
    setDisplayCost(rowData);
    setDisplayWeight(rowData);
    if ( "Check_Penalty" in rowData )
      rowData['Check_Penalty'] = Number(rowData['Check_Penalty']) + this.checkPenaltyModifier;

    if ( "Arcane_Failure" in rowData )
      rowData['Arcane_Failure'] = String(parseInt(rowData['Arcane_Failure']) + this.arcaneFailureModifier) + "%";

    if ( "Maximum" in rowData )
      rowData['Maximum'] = "+" + String(Number(rowData['Maximum']) + this.maxDexModifier);
    
  }   
  catch(e)
  {
    console.log("Modifier_apply: exception: " + e); 
    if ( ! (typeof(e.stack) === 'undefined') )
      console.log(e.stack);
  }
}

function Modifier_unapply(rowData)
{
  rowData['copper_cost'] = Number(rowData['copper_cost']) - this.costModifier;
  rowData['halfpound_weight'] = Number(rowData['halfpound_weight']) / this.weightFactor;
  setDisplayCost(rowData);
  setDisplayWeight(rowData);
  if ( "Check_Penalty" in rowData )
    rowData['Check_Penalty'] = Number(rowData['Check_Penalty']) - this.checkPenaltyModifier;

  if ( "Arcane_Failure" in rowData )
    rowData['Arcane_Failure'] = String(parseInt(rowData['Arcane_Failure']) - this.arcaneFailureModifier) + "%";

  if ( "Maximum" in rowData )
    rowData['Maximum'] = "+" + String(Number(rowData['Maximum']) - this.maxDexModifier);
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
  var listname = getSelectedListName();
  // Redirect the browser to the returned specified URL; this is the download link for the PDF file.
  url = o.responseText + "&download_name=" + listname + ".pdf";
  /*
  newWindow = window.open(url,'PDF');
  if (window.focus) {
    newWindow.focus();
  }
  */
  frame = document.getElementById("downloadframe");
  if ( frame ){
    frame.src = url;
  }
  return false;
}

function GeneratePdfCallback(){
  this.success = GeneratePdf_success;
  this.failure = DataCallback_failure;
}

function GenerateXml_success(o){
  var listname = getSelectedListName();
  // Redirect the browser to the returned specified URL; this is the download link for the PDF file.
  url = o.responseText + "&download_name=" + listname + ".xml";

  /*
  newWindow = window.open(url,'XML');
  if (window.focus) {
    newWindow.focus();
  }
  */
  frame = document.getElementById("downloadframe");
  if ( frame ){
    frame.src = url;
  }

  return false;
}

function GenerateXmlCallback(){
  this.success = GenerateXml_success;
  this.failure = DataCallback_failure;
}

/**** END YUI AJAX Callback class ****/

/**** Utility functions ****/
function cloneArray(a){
  return a.slice(0);
}

/**
 Given a weapon name, perform a check to see if the name is for ammunition.
 If it is not, null is returned. If it is, a regex match is returned, with
 element 1 set to the quantity of ammunition in the name (i.e. for Arrows (20)
 the quantity is 20)
*/
function matchAmmunition(name){
  // Create some regex as static variables
  if ( typeof(matchAmmunition.ammunitionRegex) == 'undefined' ) 
  {
    matchAmmunition.ammunitionRegex = /\((\d+)\)$/
  }

  return matchAmmunition.ammunitionRegex.exec(name);
}


function getSelectedListName()
{
  var nameElem = document.getElementById('selected_list_name');
  var listname = null;
  if ( nameElem ) {
    listname = nameElem.value;
  } 
      
  if( null == listname || listname.length == 0 )
  {   
    listname = "equipment";
  }   

  return listname;
}

function setSelectedListName(listname)
{
  var nameElem = document.getElementById('selected_list_name');
      
  if( null == listname || listname.length == 0 )
  {   
    listname = "equipment";
  }   

  if ( nameElem ) {
    nameElem.value = listname;
  } 
}

// Format a copper cost into gp, sp, etc as appropriate.
function formatCopperCost(cost){
  cost = Math.floor(Number(cost));
  var silver = Math.floor(cost / 10);
  var copper = cost % 10;

  var gold = Math.floor(silver / 10);
  silver = silver % 10;

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
    row = records[i].getData();
    result.push(row);
  }
  return result;
}

/* Set the Cost property based on the Qty and unit copper_cost */
function setDisplayCost(data)
{
  data['Cost'] = formatCopperCost(Number(data['copper_cost'])*Number(data['Qty']));
}

function setDisplayWeight(data)
{
  data['Weight'] = formatHalfpoundWeight(Number(data['halfpound_weight'])*Number(data['Qty']));
}

/* Convert an available-equipment Datatable Record into a Selected Equipment hash */
function convertAvailableRecordToSelectedHash(record, qty, type)
{
  var result = {}
  result['Name'] = record.getData('Name');
  result['Type'] = type == null ? 'Weapon' : type;
  result['Qty'] = qty;
  result['copper_cost'] = record.getData('copper_cost');
  result['halfpound_weight'] = record.getData('halfpound_weight');
  result['base_name']  = record.getData('Name'); // This is in case we modify the name; like adding the "Silver" modifier
  result['base_copper_cost'] = record.getData('copper_cost');
  result['base_halfpound_weight'] = record.getData('halfpound_weight');
  result['modifiers']  = {};
  result['last_parent']  = record.getData('last_parent');
  v = record.getData('Check_Penalty');
  if(v)
    result['Check_Penalty'] = v;
  v = record.getData('Maximum');
  if(v)
    result['Maximum'] = v;
  v = record.getData('Arcane_Failure');
  if(v)
    result['Arcane_Failure'] = v;
  console.log("convertAvailableRecordToSelectedHash: data copied");

  setDisplayCost(result);
  setDisplayWeight(result);

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

function getFrameByName(name) {
  for (var i = 0; i < frames.length; i++)
    if (frames[i].name == name)
      return frames[i];
        
  return null;
}     

/**** End Utility Functions ****/

/**** Event handlers ****/
function onModifierMenuShow(type, args)
{
  // When asked to show the modifiers menu, modify it dynamically to contain the correct modifiers
  // for the item type, and to have the modifier checked if it already is applied.

  try{
    console.log("onModifierMenuShow called: this: " + this.id);
    // When the menu is shown, if the submenu with the modifiers has been rendered, set their checkbox status based on the currently
    // selected item.
    var modifiersSubmenu = this.getSubmenus()[0];
    if ( modifiersSubmenu == null )
    {
      console.log("Returning true");
      return true;
    }

    var items = modifiersSubmenu.getItems();

    // Get the modifiers allowed for the selected item type.
    var selectedRowIds = UI.selectedEquipmentTable.getSelectedRows();
    if ( selectedRowIds.length == 0 )
      return true;

    modifiersSubmenu.clearContent();
    console.log("onModifierMenuShow: clearing ");

    var record = UI.selectedEquipmentTable.getRecord(selectedRowIds[0]);
    data = record.getData();
    var modifiers = null;
    if( data['Type'] == "Weapon" )
    {
      console.log("Modifying weapon");
      modifiers = WeaponModifiers;
    }
    else if( data['Type'] == "Armor" )
    {
      console.log("Modifying armor");
      modifiers = ArmorModifiers;
    }
    else if( data['Type'] == "Good" )
    {
      console.log("Modifying good");
      modifiers = [{label: " ", modifierName: " "}];
    }
    else
    {
      console.log("Asked to modify unknown item type. Giving up.");
      return;
    }

    for(var m = 0; m < modifiers.length; m++)
    {
      // Is this row item already modified?
      var modifierName = modifiers[m].modifier;
      var checkedVar = (modifierName in data.modifiers);
      console.log("checked: " + checkedVar);
      console.log("Adding menu item for modifier " + modifierName);
   
      modifiersSubmenu.addItem(
        { text: modifiers[m].label, onclick: { fn: toggleSelectedItemModifier, obj: modifierName, checked: checkedVar } }
      );
      var items = modifiersSubmenu.getItems();
      items[items.length-1].cfg.setProperty("checked", checkedVar);
    }

    modifiersSubmenu.render(document.body);
    return true;
  } 
  catch(e)
  {
    console.log("onModifierMenuShow: exception: " + e); 
    if ( ! (typeof(e.stack) === 'undefined') )
      console.log(e.stack);
  }

}

function toggleSelectedItemModifier(type, args, obj){
  //var checked = this.cfg.getProperty("checked");
  //checked = ! checked;
  //this.cfg.setProperty("checked", checked); 

  try{
    // Find the affected equipment rows
    var selectedRowIds = UI.selectedEquipmentTable.getSelectedRows();
    var table = UI.selectedEquipmentTable;
    for(var i = 0; i < selectedRowIds.length; i++) {
      var record = table.getRecord(selectedRowIds[i]); 
      data = record.getData();
      console.log("Adding modifier "+obj+" to "+data['Name']);
      toggleItemModifier(data, obj);
      UI.selectedEquipmentTable.updateRow(record, data);
    }
    updateSelectedEquipmentTotals();
  }
  catch(e) {
    console.log("toggleSelectedItemModifier: exception: " + e); 
    if ( ! (typeof(e.stack) === 'undefined') )
      console.log(e.stack);
  }
}

function toggleItemModifier(data, modifier)
{
  if ( modifier in data.modifiers ){
    // remove
    data.modifiers[modifier].unapply(data);
    delete data.modifiers[modifier];
  }
  else {
    // add
    data.modifiers[modifier] = createModifier(modifier, data);
    data.modifiers[modifier].apply(data);
  }
  data['Name'] = getItemNameWithModifiers(data);
}

function getItemNameWithModifiers(data)
{
  var result = data['base_name'];
  Object.keys(data.modifiers);
  if( Object.keys(data.modifiers).length > 0 )
    result = result + " (";
  var i = 0;
  for(var modifier in data.modifiers){
    if ( i > 0 )
      result = result + ", ";
    result = result + modifier;
    i++;
  }
  if( Object.keys(data.modifiers).length > 0 )
    result = result + ")";

  return result;
}

/* Add a row to the selected equipment table. If a row with the same Name already exists,
   the Qty is increased by one. */
function addRowToSelectedEquipment(row){
  var recordSet = UI.selectedEquipmentTable.getRecordSet();
  var records = recordSet.getRecords();
  for( var i = 0; i < records.length; i++ ) {
    if ( records[i].getData('Name') == row['Name'] ){
      row['Qty'] = Number(row['Qty']) + Number(records[i].getData('Qty'));
      setDisplayCost(row);
      setDisplayWeight(row);
      UI.selectedEquipmentTable.updateRow(records[i], row);
      return;
    }
  }
  UI.selectedEquipmentTable.addRow(row);

}

function clearSelectedEquipment(){
  UI.selectedEquipmentTable.getRecordSet().reset();
  UI.selectedEquipmentTable.render();
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

  try {
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
  } catch(e)
  {
    console.log("addSelectedEquipment: exception: " + e);
    if ( ! (typeof(e.stack) === 'undefined') )
      console.log(e.stack);
  }
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

function handleIframeLoad(frameName)
{       
  var frame = getFrameByName(frameName);
  if ( frame != null )
  {       
    result = frame.document.getElementsByTagName("body")[0].innerHTML;
          
    // The form's onload handler gets called when the main page is first loaded as well.
    // We detect this condition by checking if the iframes contents are not empty.
    if ( result.length > 0 ){

      json = YAHOO.lang.JSON.parse(result);
      listname = json[0]['listname'];
      console.log("List name: " + listname);
      // Remove first (metadata) element
      json.splice(0,1);

      setSelectedListName(listname);
     
      clearSelectedEquipment();
      for(var i = 0; i < json.length; i++){ 
        addRowToSelectedEquipment(json[i]);
      }
      updateSelectedEquipmentTotals();
    }
  } 
} 

/*
function selectedEquipmentRowSelected(element, record)
{
  // When a row is selected, update the list of modifiers in the context 
  // menu in case the user right-clicks.
  try{
    var selectedRowIds = UI.selectedEquipmentTable.getSelectedRows();
    if ( selectedRowIds.length == 0 )
      return true;
    var record = UI.selectedEquipmentTable.getRecord(selectedRowIds[0]);
    data = record.getData();
    console.log("Selected row " + data['Name']);

    var modifiersSubmenu = UI.menu.getSubmenus()[0];

    modifiersSubmenu.clearContent();
    console.log("onModifierMenuShow: clearing ");

    var modifiers = null;
    if( data['Type'] == "Weapon" )
    {
      console.log("Modifying weapon");
      modifiers = WeaponModifiers;
    }
    else if( data['Type'] == "Armor" )
    {
      console.log("Modifying armor");
      modifiers = [];
    }
    else if( data['Type'] == "Good" )
    {
      console.log("Modifying good");
      modifiers = [];
    }
    else
    {
      console.log("Asked to modify unknown item type. Giving up.");
      return;
    }

    for(var m = 0; m < modifiers.length; m++)
    {
      // Is this row item already modified?
      var modifierName = modifiers[m].modifier;
      var checkedVar = (modifierName in data.modifiers);
      console.log("checked: " + checkedVar);
      console.log("Adding menu item for modifier " + modifierName);
   
      modifiersSubmenu.addItem(
        { text: modifiers[m].label, onclick: { fn: toggleSelectedItemModifier, obj: modifierName, checked: checkedVar } }
      );
      var items = modifiersSubmenu.getItems();
      items[items.length-1].cfg.setProperty("checked", checkedVar);
    }

    modifiersSubmenu.render(document.body);
  }
  catch(e)
  {
    console.log("selectedEquipmentRowSelected: exception: " + e);
    if ( ! (typeof(e.stack) === 'undefined') )
      console.log(e.stack);
  }
}
*/

/**** End Event handlers ****/


// Defer instantiation until window load.
YAHOO.util.Event.addListener(window, "load", function() {

  UI.addButton = new YAHOO.widget.Button("add");
  UI.removeButton = new YAHOO.widget.Button("remove");
  UI.generatePdfButton = new YAHOO.widget.Button("generate_pdf");
  UI.saveXmlButton = new YAHOO.widget.Button("save_xml");
  UI.loadXmlButton = new YAHOO.widget.Button("load_xml");

  // Attach a listener to the #add button
  UI.addButton.on('click', addSelectedEquipment);
  UI.removeButton.on('click', removeSelectedEquipment);
  UI.generatePdfButton.on('click', function(e) {
    /* Save data using AJAX */
    var transaction = YAHOO.util.Connect.asyncRequest('POST', "/make_pdf", new GeneratePdfCallback(),
      "data=" + encodeURIComponent(YAHOO.lang.JSON.stringify(getDataTableRows(UI.selectedEquipmentTable))));
    console.log("POSTed to /make_pdf: data="+YAHOO.lang.JSON.stringify(getDataTableRows(UI.selectedEquipmentTable)));
  });
  UI.saveXmlButton.on('click', function(e) {
    /* Save data using AJAX */
    var transaction = YAHOO.util.Connect.asyncRequest('POST', "/make_xml", new GenerateXmlCallback(),
      "data=" + encodeURIComponent(YAHOO.lang.JSON.stringify(getDataTableRows(UI.selectedEquipmentTable))));
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
  //UI.selectedEquipmentTable.subscribe("rowSelectEvent", selectedEquipmentRowSelected);

  /* Load data using AJAX */
  var transaction = YAHOO.util.Connect.asyncRequest('GET', "/equipment?type=weapons", new LoadDataCallback(UI.availWeaponTable), null);
  var transaction = YAHOO.util.Connect.asyncRequest('GET', "/equipment?type=armor", new LoadDataCallback(UI.availArmorTable), null);
  var transaction = YAHOO.util.Connect.asyncRequest('GET', "/equipment?type=goods", new LoadDataCallback(UI.availGoodsTable), null);

  YAHOO.util.Event.addListener("qty", "change", correctNumberInInputField);
 
  // Context menu
  // Disable the context menu for now
  UI.menu = new YAHOO.widget.ContextMenu("available_weapons_menu",{ 
    trigger: "selected_equipment",
    lazyload: true
  });
  UI.menu.addItems([
    { text: "Modify",
      submenu: {
        id: 'modifiers',
        itemdata: [
          { text: "Silver", onclick: { fn: toggleSelectedItemModifier, obj: "silver", checked: false } },
          { text: "Masterwork", onclick: { fn: toggleSelectedItemModifier, obj: "masterwork", checked: false } },
          { text: "Small", onclick: { fn: toggleSelectedItemModifier, obj: "small", checked: false } },
        ]
      }
    },
  ]);
  //UI.menu.subscribe("show", function (type, args){console.log("Context menu show. arr: " + this.getSubmenus()[0].getItems()[0].cfg.getProperty("text"));});
  UI.menu.subscribe("show", onModifierMenuShow);

  UI.menu.render(document.body);
   
});

