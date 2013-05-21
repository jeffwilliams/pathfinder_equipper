#!/usr/bin/env ruby

# Allow inclusion from current directory
if ! $:.include?(".")
  $: << "."
end

require 'rubygems'
require 'sinatra'
require 'haml'
require 'json'
require 'nokogiri'
require 'prawn'
require 'htmlentities'
require 'equipment_manager'
require 'filename_generator'

DynamicDataDir = "dynamic_data"
EnableOldFileCleanup = true

# Start a thread to clean up old files.
if EnableOldFileCleanup
  Thread.new do

    puts "Old file cleanup thread starting. Will clean up files from #{DynamicDataDir}"
    dir = Dir.new(DynamicDataDir)
    while true
      begin
        dir.each do |e|
          path = DynamicDataDir + "/" + e
          # Cleanup files older than 1 minute. If the javascript redirect to donwload the pdf
          # hasn't happened yet something went wrong.
          if File.file?(path) && File.mtime(path) < (Time.new - 60)
            File.delete path
          end
        end
        sleep 600
      rescue
        puts "Exception in old file cleanup thread: #{e}"
      end
    end
  end
else
  puts "WARNING: Not starting old file cleanup thread. This is for debugging only."
end

$equipmentManager = EquipmentManager.new
$filenameGenerator = FilenameGenerator.new

get "/" do
  haml :yui2
end

get "/yui2" do
  haml :yui2
end

get "/equipment" do
  type = params[:type].to_s
  puts "get equipment[#{type}] called (v2)"

  list = nil
  if type == "weapons"
    list = $equipmentManager.weaponList
  elsif type == "armor"
    list = $equipmentManager.armorList
  elsif type == "goods"
    list = $equipmentManager.goodList
  else
    status 500
    puts "Unknown equipment type #{type}"
    break
  end

   result = { "result" => list }

  # Generate the JSON data
  #result = { "result" => [ {'name' => 'sword', 'cost' => '1gp'} ] }
  result = JSON.generate(result)
  result
end

# PDF Generation and download are separate URLs.
post "/make_pdf" do
  equipment = EquipmentManager.parseEquipmentListFromRequest(request)
    
  # Sort
  equipment.sort! do |a,b|
    a['Name'] <=> b['Name']
  end
  
  # Classify
  weapons = []
  armor = []
  goods = []
  equipmentHash = nil
  equipment.each do |e|
    if e['Type'] == 'Weapon'
      weapons.push e
    elsif e['Type'] == 'Armor'
      armor.push e
    elsif e['Type'] == 'Good'
      goods.push e
    else
      status 500
      puts "/make_pdf: Unknown weapon type #{e['Type']}"
      break
    end
  end

  # Resolve. Figure out the original equipment attributes
  weapons.each do |e|
    e[:original_equipment] = $equipmentManager.weaponHash[e['base_name']]
  end
  armor.each do |e|
    e[:original_equipment] = $equipmentManager.armorHash[e['base_name']]
  end
  goods.each do |e|
    e[:original_equipment] = $equipmentManager.goodHash[e['base_name']]
  end
  
  # Generate table cell data
  htmlCoder = HTMLEntities.new

  weaponCells = []
  # The extra spaces at the end of the names is for Prawn to calculate the column width properly 
  # based on these column names being bold.
  weaponCells.push ["Name ","Cost ","Dmg (S) ", "Dmg (M) ", "Critical ", "Range ", "Weight ", "Type ", "Qty " ]
  weapons.each do |e|
    orig = e[:original_equipment]
    cells = [
      e['Name'],
      e['Cost'],
      orig['Dmg_S'],
      orig['Dmg_M'],
      orig['Critical'],
      orig['Range'],
      e['Weight'],
      orig['Type'],
      e['Qty']
    ]
    cells.collect! do |e|
      htmlCoder.decode(e)
    end
    weaponCells.push cells
  end

  puts "/make_pdf: making armor cells"
  
  armorCells = []
  armorCells.push ["Name ","Cost ","AC ", "Max. Dex", "Check Penalty ", "Arcane Failure", "30 ft.", "20 ft. ", "Weight ", "Qty " ]
  armor.each do |e|
    puts "/make_pdf: row: " + e.inspect
    orig = e[:original_equipment]
    cells = [
      e['Name'],
      e['Cost'],
      orig['AC_Bonus'],
      e['Maximum'],
      e['Check_Penalty'],
      e['Arcane_Failure'],
      orig['Speed_30'],
      orig['Speed_20'],
      e['Weight'],
      e['Qty']
    ]
    cells.collect! do |e|
      htmlCoder.decode(e)
    end
    armorCells.push cells
  end

  goodsCells = []
  goodsCells.push ["Name ","Cost ","Weight ", "Qty " ]
  goods.each do |e|
    orig = e[:original_equipment]
    cells = [
      e['Name'],
      e['Cost'],
      e['Weight'],
      e['Qty']
    ]
    cells.collect! do |e|
      htmlCoder.decode(e)
    end
    goodsCells.push cells
  end

  pdfName = $filenameGenerator.generateNewFilename("eq","pdf")
  if !pdfName
    status 500
    puts "/make_pdf: Generating new unique PDF filename failed"
    break
  end

  puts "/make_pdf: making PDF #{pdfName}"

  # Now create the PDF!
  Prawn::Document.generate "#{DynamicDataDir}/#{pdfName}" do |pdf|
    pdf.font_families.update("LiberationSerif" => {
      :normal => "data/LiberationSerif-Regular.ttf",
      :bold => "data/LiberationSerif-Bold.ttf"
    })

    pdf.font "LiberationSerif"
    pdf.text "Equipment", :size => 16, :style => :bold

    if weapons.size > 0
      pdf.move_down 20
      pdf.text "Weapons", :style => :bold
      pdf.move_down 10

      pdf.table weaponCells do |table|
        table.header = true
        table.cell_style = {:borders => [:top,:bottom], :size => 10}
        table.rows(0).style(:font_style => :bold)
      end
    end

    if armor.size > 0
      pdf.move_down 20
      pdf.text "Armor", :style => :bold
      pdf.move_down 10

      columnWidths = { 3 => 60, 4 => 80, 5 => 80 }

      pdf.table armorCells, :column_widths => columnWidths do |table|
        table.header = true
        table.cell_style = {:borders => [:top,:bottom], :size => 10}
        table.rows(0).style(:font_style => :bold)
      end
    end

    if goods.size > 0
      pdf.move_down 20
      pdf.text "Goods and Services", :style => :bold
      pdf.move_down 10

      pdf.table goodsCells do |table|
        table.header = true
        table.cell_style = {:borders => [:top,:bottom], :size => 10}
        table.rows(0).style(:font_style => :bold)
      end
    end
  end

  "/get_file?file=#{pdfName}"
end

# XML Generation and download are separate URLs.
post "/make_xml" do

  equipment = EquipmentManager.parseEquipmentListFromRequest(request)

  builder = Nokogiri::XML::Builder.new do |xml|
    xml.equipment do
      equipment.each do |e|
        xml.item e
      end
    end
  end

  puts "/make_xml: Generated XML: #{builder.to_xml}"

  xmlName = $filenameGenerator.generateNewFilename("eq","xml")
  if !xmlName
    status 500
    puts "/make_xml: Generating new unique XML filename failed"
    break
  end

  begin
    File.open("#{DynamicDataDir}/#{xmlName}", "w") do |file|
      file.puts builder.to_xml 
    end
  rescue
    status 500
    puts "/make_xml: Writing XML to file #{xmlName} failed"
    break
  end

  "/get_file?file=#{xmlName}"
end

get "/get_file" do
  fileName = params[:file]
  downloadFileName = params[:download_name]

  if ! downloadFileName || downloadFileName.length == 0 
    ext = File.extname(fileName)
    ext = "dat" if !ext || ext.length == 0
    downloadFileName = "equipment.#{ext}"
  end

  # Security:
  fileName.gsub!(/\//,'')
  downloadFileName.gsub!(/[^A-Za-z0-9.\- _]/,'')

  path = "#{DynamicDataDir}/#{fileName}"
  puts "/get_file: reading file #{path}"

  mimeType = "application/octet-stream"
  if fileName =~ /\.pdf$/
    mimeType = "application/pdf"
  elsif fileName =~ /\.xml$/
    mimeType = "application/xml"
  end

  data = nil
  path = "#{DynamicDataDir}/#{fileName}"
  File.open(path,"r") do |file|
    data = file.read
    # To have the PDF act as a download, use the Content-Disposition header. TO have it display in a new window/tab
    # Do not send that header.
    headers "Content-Type" => mimeType,
      "Content-Disposition" => "attachment; filename=\"#{downloadFileName}\""
  end
  # Delete file
  File.delete(path)
    
  data
end

# Handle an upload of a selected XML equipment file.
post "/load_xml" do
  # See http://www.wooptoot.com/file-upload-with-sinatra
  if ! params['eqfile']
    status 500
    puts "/load_xml: No file was passed"
    break
  end

  name = params['eqfile'][:filename]
  path = params['eqfile'][:tempfile].path
  #FileUtils.chmod 0644, path

  doc = nil
  File.open(path,"r") do |file|
    doc = Nokogiri::XML.parse(file)
  end

  equipment = []

  # Put a special metadata hash at the beginning
  hash = {'Name' => 'metadata', 'listname' => File.basename(name,".xml")}
  equipment.push hash

  doc.css("item").each do |item|
    hash = {}
    item.attributes.each do |k,v|
      hash[k] = v.to_s
    end
    equipment.push hash
  end

  result = JSON.generate(equipment)
  result
end


