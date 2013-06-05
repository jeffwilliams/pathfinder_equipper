#!/usr/bin/env ruby1.9.1
$: << "parser"

require 'nokogiri'
require 'table_parser'
require 'filter'
require 'yaml'
require 'fileutils'

class Builder
  def initialize
    @fiber = Fiber.new do |hash|
      builder = Nokogiri::XML::Builder.new do |xml|
        xml.equipment do
          while hash
            xml.item(hash)
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
  # Construct a new PrdProcessor. Pass either a single XML document, or an
  # array of XML documents to parse.
  def initialize(docs)
    @docs = docs
  end

  def process_table(tableId, builder, prog_path, type, filter = NullFilter.new)
    # Find which document contains the needed table.
    matched = @docs.select{ |tdoc| !tdoc.css(tableId).first.nil? }
    raise "No node found using css selector #{css}" if matched.empty?
    doc = matched.first

    context = TableParserContext.new
    context.vars[:item_type] = type
    parser = TableParser.new(context, doc.css(tableId).first)

    prog = nil
    File.open(prog_path, "r") do |file|
      prog = file.read
    end

    eval prog, context.get_binding, prog_path

    parser.go do |row|
#puts "PRE-FILTER: #{row}"
      if filter.process(row) == :process
#puts "POST-FILTER: #{row}"
        builder.process(row)
      end
    end
  end
end

# Given a scalar or a list, convert it to list.
def toList(value)
  if value.is_a?(Array)
    value
  else
    [value]
  end
end

def open_using_nokogiri(filename)
  doc = nil
  File.open(filename,'r') do |file|
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
  doc
end

def filterFor(type)
  if type == "weapons"
    WeaponRowFilter.new
  elsif type == "armor"
    ArmorRowFilter.new
  else
    ItemRowFilter.new
  end
end

def processItemType(processor, conf, type)
  if conf[type]
    index = 0
    builder = Builder.new
    toList(conf[type]['table']).each do |table|
      processor.process_table(table, builder, conf[type]['program'], type, filterFor(type))
      index += 1
    end

    xml = builder.finish
    outfile = conf[type]['outfile']
    puts "Writing #{type} output to #{outfile}"
    dir = File.dirname outfile
    FileUtils.mkdir_p dir if ! File.directory?(dir)
    File.open(outfile, "w") do |file|
      file.puts xml
    end
  else
    puts "Skipping #{type} equipment since it is not configured in config file"
  end
end

conf = ARGV[0]
if ! conf
  raise "You must specify a yaml config file"
end

File.open(conf,"r"){ |io| conf = YAML::load(io) }
puts "Loading input file(s) #{conf['infile'].inspect}"

docs = toList(conf['infile']).collect{ |filename| open_using_nokogiri(filename) }
processor = PrdProcessor.new(docs) 

processItemType(processor, conf, 'weapons')
processItemType(processor, conf, 'armor')
processItemType(processor, conf, 'goods')
