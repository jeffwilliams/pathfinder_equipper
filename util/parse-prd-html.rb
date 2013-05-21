#!/usr/bin/env ruby1.9.1
=begin

This script is used to parse the PRD equipment HTML page into machine-readable XML. 
The URL to parse is:  http://paizo.com/pathfinderRPG/prd/equipment.html
This script expects to read equipment.html in the current directory.

=end


require 'nokogiri'
require 'cgi'
require 'fiber'
require 'tempfile'
require 'yaml'

class Extractor
  def initialize(doc)
    @doc = doc
    @header = nil
  end

  def defineHeader(cols)
    @header = cols
  end

  # Parameter headerRow: Which row in the table (indexed from 1) contains the 
  # header. 
  def parseHtmlTable(css, headerRow = 1, combineIndentedRows = false)
    node = @doc.css(css).first
    raise "No node found using css selector #{css}" if ! node
 
    parent = nil   
    header = @header
    row = 0
    # For each <tr> element in the table
    node.css("tr").each do |node|
      row += 1
      next if row < headerRow

      if row == headerRow
        next if header
        header = []
        node.children.each do |ch|
          # From the <tr> get the <td>, and from that <td> get it's first text child node
          header.push ch.child.to_s
          #puts ch.child.to_s.strip
        end
      else
        # Not the header row.
        hash = {}
        i = 0
        node.children.each do |ch|
          break if i >= header.length
          value = CGI.unescapeHTML(ch.inner_html.strip)

          clazz = ch.attribute('class')
          if clazz.to_s == "indent" && combineIndentedRows && parent
            value = parent + ", " + value
          end

          hash[header[i]] = value
          i += 1
        end

        # If this is a "sub-header" row (a header inside the table) then save this
        # for later row processing. Some rows in the goods and services tables have item names
        # that don't make sense without this row. For example there is a header for 'Lock'
        # and then another row for 'Simple'
        parent = node.children.first.inner_html.strip if i == 1
        hash['last_parent'] = parent.gsub(/<[^>]+>/,'').strip if parent

        # Don't pass along "sub-header" rows, like 'Two-Handed Weapons'.
        yield hash if i == header.length
      end
    end
  end
end

def nvl(value, ifnull)
  value ? value : ifnull
end

# Given a scalar or a list, convert it to list.
def toList(value)
  if value.is_a?(Array)
    value
  else
    [value]
  end
end

class Filter
  def initialize
    @keyChangeRules = {}
    @ignoreRules = {}
    @keyValues = {}
    @gsubs = []
    @duplicateKey = nil
  end

  # Add a rule that changes a key from one string to a different string
  def addKeyChange(old, new)
    @keyChangeRules[old] = new
  end

  # Add a rule that ignores rows who's key 'key' has the specified value 
  def addIgnore(key, value)
    l = @ignoreRules[key]
    if ! l
      @ignoreRules[key] = [value]
    else
      l.push value
    end
  end

  # Add a global substitution performed on values
  def addGsub(pattern, replacement)
    @gsubs.push [pattern, replacement]
  end

  def filterDuplicates(key)
    @duplicateKey = key
  end

  def process(hash)
    result = :process
    @keyChangeRules.each do |oldkey,newkey|
      val = hash[oldkey]
      if val
        hash.delete oldkey
        hash[newkey] = val
      end
    end

    @ignoreRules.each do |key,value|
      value.each do |v|
        val = hash[key]
        if val && val == v
          result = :ignore 
          break
        end
      end
    end

    @gsubs.each do |l|
      pattern, replacement = l
      hash.each do |k,v|
        if v.is_a?(String)
          v.gsub! pattern, replacement
        end
      end
    end

    if @duplicateKey
      result = :ignore if @keyValues.has_key?(hash[@duplicateKey])
  
      @keyValues[hash[@duplicateKey]] = 1
    end

    result
  end

  private 
  def convertCostToCopper(cost)
    copper = 0
    if cost 
      cost = cost.gsub(",","")
      if cost =~ /(\d+)\s?([^\s]+)/
        val = $1.to_i
        type = $2
        if type == 'sp'
          val *= 10
        elsif type == 'gp'
          val *= 100
        elsif type == 'pp'
          val *= 1000
        end
        copper = val
      end
    end
    copper
  end

  # Convert a weight in pounds to units of half-pounds.
  def convertWeightToHalfpound(weight)
    result = 0
    weight = weight.strip
    if weight =~ /^(\d+) lb/
      result = $1.to_i * 2
    elsif weight =~ /^1\/2 lb/
      result = 1
    elsif weight =~ /^(\d+)-1\/2 lb/
      result = $1.to_i * 2 + 1
    end
    result
  end
end

class NullFilter
  def process(hash)
    :process
  end
end

class BaseFilter < Filter
  def initialize
    super
    addGsub(/<sup>.*<\/?sup>/,'')
  end

  def process(hash)
    result = super
    raise "Equipment has no Cost: '#{hash['Name']}' #{hash}" if ! hash.has_key?('Cost')
    hash['copper_cost'] = convertCostToCopper(hash['Cost'])
    raise "Equipment has no Weight: #{hash['Name']}" if ! hash.has_key?('Weight')
    hash['halfpound_weight'] = convertWeightToHalfpound(hash['Weight'])
    result
  end
end

class WeaponRowFilter < BaseFilter
  def initialize
    super
    addKeyChange "Simple Weapons", "Name"
    addKeyChange "Dmg (S)", "Dmg_S"
    addKeyChange "Dmg (M)", "Dmg_M"
    addIgnore "Name", "Unarmed strike"
    addIgnore "Name", "Martial Weapons"
    addIgnore "Name", "Exotic Weapons"
    addIgnore "Name", "Shield, light"
    addIgnore "Name", "Spiked shield, light"
    addIgnore "Name", "Shield, heavy"
    addIgnore "Name", "Spiked shield, heavy"
    addIgnore "Name", "Spiked armor"
    filterDuplicates "Name"
  end

  def process(hash)
    super
  end
end

class ArmorRowFilter < BaseFilter
  def initialize
    super
    addIgnore "Name", "Armor spikes"
    addIgnore "Name", "Shield spikes"
    addGsub(/&ndash;/,'-')
  end

  def process(hash)
    super
  end
end

class ItemRowFilter < BaseFilter
  def initialize
    super
    addKeyChange "Item", "Name"
    addKeyChange "Adventuring Gear", "Name"
    addKeyChange "Special Substances and Items", "Name"
    addKeyChange "Tools and Skill Kits", "Name"
    addKeyChange "Clothing","Name"
    addKeyChange "Animal-Related Gear", "Name"
    addKeyChange "Entertainment Items", "Name"

    addKeyChange "Craft DC", "Craft_DC"
  end

  def process(hash)
    super
  end
end


class Builder
  def initialize
    @fiber = Fiber.new do |hash|
      builder = Nokogiri::XML::Builder.new do |xml|
        xml.equipment do
          while hash
            #hash.each do |k,v|
            xml.item(hash)
            #end
            hash = Fiber.yield
          end
        end
      end
      Fiber.yield builder.to_xml
    end
  end

  def process(hash)
    @fiber.resume hash
  end

  def finish
    result = @fiber.resume
  end
end


class PrdProcessor
  def initialize(xmlDoc)
    @doc = xmlDoc
  end

  def processTable(tableId, outfileName, filter = NullFilter.new, headerRow = 1, combineIndentedRows = false, header = nil)
    output = Builder.new

    extractor = Extractor.new(@doc)
    extractor.defineHeader(header) if header
    extractor.parseHtmlTable(tableId, headerRow, combineIndentedRows) do |row|
      if filter.process(row) == :process
        output.process(row)
      end
    end
    xml = output.finish
  
    File.open(outfileName, "w") do |file|
      file.puts xml
    end
  end

end

conf = ARGV[0]
if ! conf
  raise "You must specify a yaml config file"
end

File.open(conf,"r"){ |io| conf = YAML::load(io) }
puts "Loading file #{conf['file']}"

doc = nil
File.open(conf['file'],'r') do |file|
  # Preprocess file: 
  # 1. We need to escape the HTML entities so that they aren't translated by Nokogiri.
  # 2. Nokogiri doesn't like colon characters in HTML element ids. Strip these out.
  xmlString = ""
  file.each_line do |line|
    line.gsub!(/&/, '&amp;')
    if line =~ /(.*id=")([^"]*)(".*)/
      a = $1
      c = $3
      b = $2.gsub(/:/,'')
      line = a + b + c
    end

    xmlString << line
  end

  doc = Nokogiri::HTML.parse(xmlString)
end

prdProcessor = PrdProcessor.new(doc)

prdProcessor.processTable(conf['weapon_table'], conf['weapon_file'], WeaponRowFilter.new, nvl(conf['weapon_table_header_row'],1))
armorHeader = ['Name','Cost', 'AC_Bonus', 'Maximum', 'Check_Penalty', 'Arcane_Failure', 'Speed_30', 'Speed_20', 'Weight']
prdProcessor.processTable(conf['armor_table'], conf['armor_file'], ArmorRowFilter.new, nvl(conf['armor_table_header_row'],1), false, armorHeader)

puts conf['goods_table']

index = 0
toList(conf['goods_table']).each do |table|
  outfile = String.new(conf['goods_file'])
  outfile.sub!(/\.xml/,"-#{index}.xml") if index > 0
  prdProcessor.processTable(table, outfile, ItemRowFilter.new, nvl(conf['goods_table_header_row'],1), true)
  index += 1
end

