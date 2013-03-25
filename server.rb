#!/usr/bin/env ruby
require 'rubygems'
require 'sinatra'
require 'haml'
require 'json'
require 'nokogiri'
require 'prawn'
require 'htmlentities'

settings.port = 5555

DynamicDataDir = "dynamic_data"

class EquipmentManager
  WeaponsFile = "data/weapons.xml"
  ArmorFile = "data/armor.xml"
  GoodsFile = "data/goods-and-services.xml"

  def initialize
    @weaponList = read(WeaponsFile)
    @armorList = read(ArmorFile)
    @goodList = read(GoodsFile)

    @weaponHash = listToHash(@weaponList)
    @armorHash = listToHash(@armorList)
    @goodHash = listToHash(@goodList)
  end

  attr_reader :weaponList, :armorList, :goodList
  attr_reader :weaponHash, :armorHash, :goodHash

  private 
  # Load the equipment from the specified XML file into a list of property hashes.
  def read(file)
    doc = nil
    File.open(file,"r") do |file|
      doc = Nokogiri::XML.parse(file)
    end

    equipment = []
    doc.css("item").each do |item|
      hash = {}
      item.attributes.each do |k,v|
        hash[k] = v.to_s
      end
      equipment.push hash
    end
    equipment
  end

  # Create a hash from the given equipment list, where the key is the name
  # and the value is the equipment hash
  def listToHash(list)
    hash = {}
    list.each do |e|
      hash[e['Name']] = e
    end
    hash
  end
  
end

class FilenameGenerator
  def initialize
    @mutex = Mutex.new
  end
  def generateNewPdfFilename
    tries = 3
    while tries > 0
      
      filename = "#{Thread.current.object_id}-#{rand(10000)}.pdf"
      path = DynamicDataDir + "/" + filename
      @mutex.synchronize do
        if ! File.exists?(path)
          # Reserve
          File.open(path, "w"){ |file| file.puts("reserved")}
          return filename
        end
      end
      tries -= 1
    end
    nil
  end
end

# Start a thread to clean up old files.
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
  request.body.rewind  # in case someone already read it
  # Ignore 'data='
  equipment = request.body.read
  equipment = equipment[5,equipment.length] if equipment =~ /^data=/
  equipment.chomp!
  equipment = JSON.parse equipment
    
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
    e[:original_equipment] = $equipmentManager.weaponHash[e['Name']]
  end
  armor.each do |e|
    e[:original_equipment] = $equipmentManager.armorHash[e['Name']]
  end
  goods.each do |e|
    e[:original_equipment] = $equipmentManager.goodHash[e['Name']]
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

  puts "/get_pdf: making armor cells"
  
  armorCells = []
  armorCells.push ["Name ","Cost ","AC ", "Max. Dex", "Check Penalty ", "Arcane Failure", "30 ft.", "20 ft. ", "Weight ", "Qty " ]
  armor.each do |e|
    orig = e[:original_equipment]
    cells = [
      e['Name'],
      e['Cost'],
      orig['AC_Bonus'],
      orig['Maximum'],
      orig['Check_Penalty'],
      orig['Arcane_Failure'],
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

  pdfName = $filenameGenerator.generateNewPdfFilename
  if !pdfName
    status 500
    puts "/make_pdf: Generating new unique PDF filename failed"
    break
  end

  puts "/get_pdf: making PDF #{pdfName}"

  # Now create the PDF!
  Prawn::Document.generate "#{DynamicDataDir}/#{pdfName}" do |pdf|
    pdf.font_families.update("LiberationSerif" => {
      :normal => "/usr/share/fonts/truetype/ttf-liberation/LiberationSerif-Regular.ttf",
      :bold => "/usr/share/fonts/truetype/ttf-liberation/LiberationSerif-Bold.ttf"
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

#debug
system("cp '#{DynamicDataDir}/#{pdfName}' /tmp")

  "/get_pdf?file=#{pdfName}"
end

get "/get_pdf" do
  fileName = params[:file]
  # Security:
  fileName.gsub!(/\//,'')

  path = "#{DynamicDataDir}/#{fileName}"
  puts "/get_pdf: reading file #{path}"
  data = nil
  File.open("#{DynamicDataDir}/#{fileName}","r") do |file|
    data = file.read
    # To have the PDF act as a download, use the Content-Disposition header. TO have it display in a new window/tab
    # Do not send that header.
    headers "Content-Type" => "application/pdf",
      "Content-Disposition" => "attachment; filename=\"Pathfinder-Equipment.pdf\""
  end
  # Delete file
  File.delete(path)
    
  data
end
