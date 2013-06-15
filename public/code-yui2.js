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
  'set',
  'category',
  'business_end_material',
  'holding_end_material'
];

// Fields for display
var AvailableWeaponColumns = [
  { key: 'Name', label: 'Name', sortable: true, width: 150 },
  { key: 'Cost', label: 'Cost' },
  { key: 'Dmg_S', label: 'Dmg (S)' },
  { key: 'Dmg_M', label: 'Dmg (M)' },
  { key: 'Critical', label: 'Critical' },
  { key: 'Range', label: 'Range' },
  { key: 'Weight', label: 'Weight' },
  { key: 'Type', label: 'Type' },
  { key: 'Special', label: 'Special', width: 150 }
];

var AvailableAmmunitionColumns = [
  { key: 'Name', label: 'Name', sortable: true},
  { key: 'Cost', label: 'Cost' },
  { key: 'Weight', label: 'Weight' }
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
  'set',
  'category',
  'business_end_material',                                                                                                                                                                                                                                                                                                     
  'holding_end_material'
];

var AvailableArmorColumns = [
  { key: 'Name', label: 'Name', sortable: true, width: 150 },
  { key: 'Cost', label: 'Cost', width: 50 },
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
  'set',
  'category'
];

var AvailableGoodsColumns = [
  { key: 'Name', label: 'Name', sortable: true, width: 150 },
  { key: 'Cost', label: 'Cost', width: 50 },
  { key: 'Weight', label: 'Weight' }
];

var AvailableAlchemicalWeaponsFields = [
  'Name',
  'Cost',
  'Dmg',
  'Critical',
  'Range',
  'Weight',
  'Type',
  'Special',
  'copper_cost',
  'halfpound_weight',
  'set',
  'category'
];

var AvailableAlchemicalWeaponsColumns = [
  { key: 'Name', label: 'Name', sortable: true, width: 150 },
  { key: 'Cost', label: 'Cost', width: 50 },
  { key: 'Dmg', label: 'Dmg' },
  { key: 'Critical', label: 'Critical' },
  { key: 'Range', label: 'Range' },
  { key: 'Weight', label: 'Weight' },
  { key: 'Type', label: 'Type' },
  { key: 'Special', label: 'Special', width: 150 }
];

var AvailablePoisonsFields = [
  'Name',
  'Cost',
  'Fort_DC',
  'Onset',
  'Frequency',
  'Effect',
  'Cure',
  'Weight',
  'Type',
  'copper_cost',
  'halfpound_weight',
  'set',
  'category'
];

var AvailablePoisonsColumns = [
  { key: 'Name', label: 'Name', sortable: true, width: 150 },
  { key: 'Cost', label: 'Cost', width: 50 },
  { key: 'Fort_DC', label: 'Fort DC' },
  { key: 'Onset', label: 'Onset' },
  { key: 'Frequency', label: 'Frequency' },
  { key: 'Effect', label: 'Effect' },
  { key: 'Cure', label: 'Cure' },
  { key: 'Weight', label: 'Weight' },
  { key: 'Type', label: 'Type' }
];

var SelectedEquipmenFields = [
  'Name',
  'Cost',
  'Weight',
  'Type',
  'Qty',
  'base_name',
  'set',
  'category'
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

// UI tab to data mapping.
// These entries each specify a tab in a table that will be filled with
// data that matches the specified filter (defined as a query passed to /equipment URL).
var TabsAndData = [
  { parent_tab: "weapons", label: "Simple", div_id: "simple_weapons", query: "type=weapons&set=Simple Weapons", fields: AvailableWeaponFields, columns: AvailableWeaponColumns },
  { parent_tab: "weapons", label: "Martial", div_id: "martial_weapons", query: "type=weapons&set=Martial Weapons", fields: AvailableWeaponFields, columns: AvailableWeaponColumns },
  { parent_tab: "weapons", label: "Exotic", div_id: "exotic_weapons", query: "type=weapons&set=Exotic Weapons", fields: AvailableWeaponFields, columns: AvailableWeaponColumns },
  { parent_tab: "weapons", label: "Ammunition", div_id: "ammunition", query: "type=weapons&set=Ammunition", fields: AvailableWeaponFields, columns: AvailableAmmunitionColumns},

  { parent_tab: "armor", label: "Light", div_id: "light_armor", query: "type=armor&category=Light Armor", fields: AvailableArmorFields, columns: AvailableArmorColumns},
  { parent_tab: "armor", label: "Medium", div_id: "medium_armor", query: "type=armor&category=Medium Armor", fields: AvailableArmorFields, columns: AvailableArmorColumns},
  { parent_tab: "armor", label: "Heavy", div_id: "heavy_armor", query: "type=armor&category=Heavy Armor", fields: AvailableArmorFields, columns: AvailableArmorColumns},
  { parent_tab: "armor", label: "Shields", div_id: "shields", query: "type=armor&category=Shields", fields: AvailableArmorFields, columns: AvailableArmorColumns},
  { parent_tab: "armor", label: "Extras", div_id: "extras_armor", query: "type=armor&category=Extras", fields: AvailableArmorFields, columns: AvailableArmorColumns},

  { parent_tab: "goods", label: "Adventuring Gear", div_id: "goods_adventuring_gear", query: "type=goods&set=Adventuring Gear", fields: AvailableGoodsFields, columns: AvailableGoodsColumns},
  { parent_tab: "goods", label: "Tools and Skill Kits", div_id: "tools_and_skill_kits_goods", query: "type=goods&set=Tools and Skill Kits", fields: AvailableGoodsFields, columns: AvailableGoodsColumns},
  { parent_tab: "goods", label: "Clothing", div_id: "clothing_goods", query: "type=goods&set=Clothing", fields: AvailableGoodsFields, columns: AvailableGoodsColumns},
  { parent_tab: "goods", label: "Food and Drink", div_id: "food_goods", query: "type=goods&set=Food and Drink", fields: AvailableGoodsFields, columns: AvailableGoodsColumns},
  { parent_tab: "goods", label: "Pets and Familiars", div_id: "pets_goods", query: "type=goods&set=Pets and Familiars", fields: AvailableGoodsFields, columns: AvailableGoodsColumns},
  { parent_tab: "goods", label: "Guard and Hunting Animals", div_id: "guard_goods", query: "type=goods&set=Guard and Hunting Animals", fields: AvailableGoodsFields, columns: AvailableGoodsColumns},
  { parent_tab: "goods", label: "Farm and Work Animals", div_id: "farm_goods", query: "type=goods&set=Farm and Work Animals", fields: AvailableGoodsFields, columns: AvailableGoodsColumns},
  { parent_tab: "goods", label: "Mounts", div_id: "mounts_goods", query: "type=goods&set=Mounts", fields: AvailableGoodsFields, columns: AvailableGoodsColumns},
  { parent_tab: "goods", label: "Animal Related Gear", div_id: "animal_gear_goods", query: "type=goods&set=Animal Related Gear", fields: AvailableGoodsFields, columns: AvailableGoodsColumns},
  { parent_tab: "goods", label: "Alchemical Remedies", div_id: "alchemical_remedies_goods", query: "type=goods&set=Alchemical Remedies", fields: AvailableGoodsFields, columns: AvailableGoodsColumns},
  { parent_tab: "goods", label: "Alchemical Tools", div_id: "alchemical_tools_goods", query: "type=goods&set=Alchemical Tools", fields: AvailableGoodsFields, columns: AvailableGoodsColumns},
  { parent_tab: "goods", label: "Alchemical Weapons", div_id: "alchemical_weapons", query: "type=goods&set=Alchemical Weapons", fields: AvailableAlchemicalWeaponsFields, columns: AvailableAlchemicalWeaponsColumns},
  { parent_tab: "goods", label: "Entertainment", div_id: "entertainment_goods", query: "type=goods&set=Entertainment", fields: AvailableGoodsFields, columns: AvailableGoodsColumns},
  { parent_tab: "goods", label: "Poisons", div_id: "poisons_goods", query: "type=goods&set=Poisons", fields: AvailablePoisonsFields, columns: AvailablePoisonsColumns}

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

// Return a list of modifiers as would be shown in the menu
// (each one has a label and modifier (name) field)
function allowedModifiersInMenuFormat(data)
{
  var result = [];
  var modifiers = [];
  if( data['Type'] == "Weapon" )
  {
    console.log("Modifying weapon");
    modifiers = WeaponModifiers;

    for(var i = 0; i < modifiers.length; i++)
    {
      if ( data['business_end_material'] != "metal" ){
        if ( modifiers[i].modifier == 'silver' || 
             modifiers[i].modifier == 'cold_iron')
          continue;
      }
      if ( data['business_end_material'] != "wood" ){
        if ( modifiers[i].modifier == 'darkwood' )
          continue;
      }
      result.push(modifiers[i]);
    }
  }
  else if( data['Type'] == "Armor" )
  {
    console.log("Modifying armor");
    modifiers = ArmorModifiers;

    for(var i = 0; i < modifiers.length; i++)
    {
      if ( data['business_end_material'] != "metal" ){
        if ( modifiers[i].modifier == 'mithral' )
          continue;
      }
      if ( data['business_end_material'] != "wood" ){
        if ( modifiers[i].modifier == 'darkwood' )
          continue;
      }
      result.push(modifiers[i]);
    }
  }
  else if( data['Type'] == "Good" )
  {
    console.log("Modifying good");
    modifiers = [{label: " ", modifierName: " "}];
  }
  else
  {
    console.log("Asked to modify unknown item type. Giving up.");
    return result;
  }

  return result;
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
      modifier.costModifier = 30000;
      if ( rowData['set'] == 'Ammunition' )
      {
        var match = matchAmmunition(rowData['Name']);
        if ( match != null )
        {
          // Ammunition. Add 6gp per unit.
          modifier.costModifier = parseInt(match[1])*600;
        }
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
    if ( rowData['set'] == 'Ammunition' ){
      modifier.costModifier = 200;
    }
    else if ( rowData['category'] == 'Light Melee Weapons' )
    {
      modifier.costModifier = 2000;
    }
    else if ( rowData['category'] == 'One-Handed Melee Weapons' )
    {
      modifier.costModifier = 9000;
    }
    else if ( rowData['category'] == 'Two-Handed Melee Weapons' )
    {
      modifier.costModifier = 18000;
    }

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
      modifier.arcaneFailureModifier -= modifier.arcaneFailureModifier + parseInt(rowData['Arcane_Failure']);

    modifier.maxDexModifier = 2;
    modifier.weightFactor = 0.5;

    if( rowData['category'] == 'Light Armor' )
    {
       modifier.costModifier = 100000;
    }
    else if( rowData['category'] == 'Medium Armor' )
    {
       modifier.costModifier = 400000;
    }
    else if( rowData['category'] == 'Heavy Armor' )
    {
       modifier.costModifier = 900000;
    }
    else if( rowData['category'] == 'Shields' )
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
    if( rowData['category'] == "Shields" )
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
      rowData['Maximum'] = "+" + String(parsePrdNumber(rowData['Maximum']) + this.maxDexModifier);
    
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
    rowData['Maximum'] = "+" + String(parsePrdNumber(rowData['Maximum']) - this.maxDexModifier);
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
  result['set']  = record.getData('set');
  result['category']  = record.getData('category');
  result['business_end_material'] = record.getData('business_end_material');
  result['holding_end_material'] = record.getData('holding_end_material');

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

/** 
This function creates a tab that contains a table of available item information. The tab
is added to the tabView with the tab label 'label'. A div is created for the table with id
'tableElementId' and the table is created with the specified fields and columns.

The YAHOO.widget.ScrollingDataTable created inside the tab is returned from this function.
*/
function makeAvailableEquipmentTab(tabView, label, tableElementId, fieldsDef, columnDef)
{
  tabView.addTab( new YAHOO.widget.Tab({
    label: label,
    content: '<div id="'+tableElementId+'">Loading...</div>',
    active: true
  }));
  // Get the tab we just made
  //var tab = tabView.tabs[tabView.tabs.length-1]
  var tabs = tabView.get('tabs');
  var tab = tabs[tabs.length-1]
  var table = makeAvailableEquipmentTable(fieldsDef, columnDef, tableElementId);
  // Add a reference to the table we just made to the tab
  tab.prdItemTable = table;
  return table;
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

function logSelectedEquipmentInfo(){

  console.log("Highlighted rows in selected equipment:")
  selectedRowIds = UI.selectedEquipmentTable.getSelectedRows();
  for(var i = 0; i < selectedRowIds.length; i++) {
    record = UI.selectedEquipmentTable.getRecord(selectedRowIds[i]);
    hash = record.getData();
    for( var k in hash ){
      if (hash.hasOwnProperty(k)) { 
        console.log("  '"+k+"' = '"+hash[k]+"'");
      }
    }

  } 
}

/* 
  Handles special cases when parsing PRD numbers.
  For example, zero when sent back from the server-side is &amp;mdash;
*/
function parsePrdNumber(num)
{
  if ( num == '&mdash;' )
    return 0;
  return parseInt(num);
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
    var modifiers = allowedModifiersInMenuFormat(data);
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

/**
Based on which top-level tab is selected, return
weapon, armor or good.
*/
function getSelectedItemType()
{
  var type = null;
  var tabIndex = UI.tabview.get('activeIndex');

  if ( tabIndex == 0 ){
    type = "Weapon";
  }
  else if ( tabIndex == 1 ){
    type = "Armor";
  }
  else if ( tabIndex == 2 ){
    type = "Good";
  }
  else{
    console.log("getSelectedItemType: unknown tab index");
    return null;
  }

  return type;
}

/**
Get the table that is shown in the selected tab and subtab.
*/
function getSelectedTable()
{
  try 
  {
    var view = null;
    var tabIndex = UI.tabview.get('activeIndex');

    console.log("getSelectedTable: active tab index = " + tabIndex);

    if ( tabIndex == 0 ){
      view = UI.weaponsTabview;
    } 
    else if ( tabIndex == 1 ){
      view = UI.armorTabview;
    }
    else if ( tabIndex == 2 ){
      view = UI.goodsTabview
    }
    else{
      console.log("addSelectedEquipment: unknown tab index");
      return null;
    } 
    var table = view.get('activeTab').prdItemTable;

    console.log("getSelectedTable: table = " + table);
    // Get the table
    return table;
  } catch(e)
  {
    console.log("getSelectedTable: exception: " + e); 
    if ( ! (typeof(e.stack) === 'undefined') )
      console.log(e.stack);
  }
}

function addSelectedEquipment(e)
{
  // Figure out what equipment list we are going to add from, based on the active tab.
  var tabIndex = UI.tabview.get('activeIndex');
  var table = null;
  var type = null;

  table = getSelectedTable();
  type = getSelectedItemType();
  if( table == null || type == null )
  {
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

/**** End Event handlers ****/


// Defer instantiation until window load.
YAHOO.util.Event.addListener(window, "load", function() {

  UI.addButton = new YAHOO.widget.Button("add");
  UI.removeButton = new YAHOO.widget.Button("remove");
  UI.generatePdfButton = new YAHOO.widget.Button("generate_pdf");
  UI.saveXmlButton = new YAHOO.widget.Button("save_xml");
  UI.loadXmlButton = new YAHOO.widget.Button("load_xml");
  if(document.getElementById("devmode_log_selected_info") != null)
  {
    UI.devmodeShowSelectedInfoButton = new YAHOO.widget.Button("devmode_log_selected_info");
    UI.devmodeShowSelectedInfoButton.on('click', logSelectedEquipmentInfo);
  }

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
    content: '<div id="available_weapons"></div>',
    active: true
  }));

  UI.tabview.addTab( new YAHOO.widget.Tab({
    label: 'Armor',
    content: '<div id="available_armor"></div>'
  }));
   
  UI.tabview.addTab( new YAHOO.widget.Tab({
      label: 'Goods and Services',
      content: '<div id="available_goods"></div>'
  }));

  UI.weaponsTabview = new YAHOO.widget.TabView("available_weapons", { orientation: "left"});
  UI.armorTabview = new YAHOO.widget.TabView("available_armor", { orientation: "left"});
  UI.goodsTabview = new YAHOO.widget.TabView("available_goods", { orientation: "left"});
 
  UI.tables = [];
  for(var i = 0; i < TabsAndData.length; i++)
  {
    descriptor = TabsAndData[i];
    var table = null;
    if (descriptor.parent_tab == "weapons" )
    {
      table = makeAvailableEquipmentTab(UI.weaponsTabview, descriptor.label, descriptor.div_id, descriptor.fields, descriptor.columns);
    }
    else if (descriptor.parent_tab == "armor" )
    {
      table = makeAvailableEquipmentTab(UI.armorTabview, descriptor.label, descriptor.div_id, descriptor.fields, descriptor.columns);
    }
    else if (descriptor.parent_tab == "goods" )
    {
      table = makeAvailableEquipmentTab(UI.goodsTabview, descriptor.label, descriptor.div_id, descriptor.fields, descriptor.columns);
    }

    UI.tables.push(table);
    /* Load data using AJAX */
    var transaction = YAHOO.util.Connect.asyncRequest('GET', "/equipment?" + descriptor.query, new LoadDataCallback(table), null);
  }
  UI.weaponsTabview.selectTab(0);
  UI.armorTabview.selectTab(0);
  UI.goodsTabview.selectTab(0);

  UI.selectedEquipmentTable = makeAvailableEquipmentTable(SelectedEquipmenFields, SelectedEquipmentColumns, "selected_equipment");
  UI.selectedEquipmentTable.showTableMessage("(add some equipment)");
  //UI.selectedEquipmentTable.subscribe("rowSelectEvent", selectedEquipmentRowSelected);

  YAHOO.util.Event.addListener("qty", "change", correctNumberInInputField);
 
  // Context menu
  // Context menu is not working right for Ultimate equipment: the last_parent field no longer exists.

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

