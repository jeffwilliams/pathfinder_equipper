require 'cgi'

class TableParserContext
  # Initialize with the Nokogiri node for the table.
  def initialize
    # List of names of the columns for rows.
    @header = []

    # Child handlers
    @handlers = {}

    # User Variables
    @user_var = {}

    @parser = nil
  end

  attr_accessor :header  
  attr_accessor :handlers
  attr_accessor :parser

  def get_binding
    binding()
  end

  #### Events

  # Define a block called for each child of the table with the specified element name.
  def on_child(elem_name, &block)
    @handlers[elem_name.downcase] = block
  end

  #### User Methods

  def set_header(header)
    @header = header
    puts "HEADER: #{header}"
  end

  # Given an array of field values 'row', produce a hash with the same number
  # of elements, where each key is the header for that value, and the value is the value from
  # the row.
  def apply_header(row)
    result = {}
    raise "apply_header called when the header hasn't yet been set!" if ! header
    header.zip(row).collect do |h,v| 
      result[h] = v if h && v
    end
    result
  end

  def output_item(hash)
    @parser.output_item(hash) if @parser
  end

  # Return a hash that can be used to store user-defined variables.
  def vars
    @user_var
  end

  # Return the text of the first text node found as a descendant under the specified node
  def first_text_under(node)
    node.xpath(".//text()").first.to_s
  end

  # Return a list of the text under the specified element. The list has an element for each separate text node.
  def text_under(node)
    node.xpath(".//text()").collect{ |e| e.to_s }
  end
end

class TableParser
  def initialize(context, table_node)
    @table_node = table_node
    raise "TableParserContext cannot be created with a nil node" if ! @table_node
    @context = context
    @context.parser = self

    @item_buffer = []
  end

  # Yields the completed row hashes to the block
  def go
    @table_node.children.each do |ch|
      #puts "Found node: #{ch.node_name.downcase}"
      handler = @context.handlers[ch.node_name.downcase]
      handler.call ch if handler
    end
    @item_buffer.each{ |item| yield item }
  end

  def output_item(hash)
    #puts "ROW: #{hash}"
    @item_buffer.push hash
  end
  
end
