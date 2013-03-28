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
 
  # Parse the selected equipment list sent as an HTTP POST request
  # into a list of hashes. The POST body should contain only one 
  # variable, named 'data' that contains the equipment encoded using JSON.
  def self.parseEquipmentListFromRequest(request)
    request.body.rewind  # in case someone already read it
    # Ignore 'data='
    equipment = request.body.read
    equipment = equipment[5,equipment.length] if equipment =~ /^data=/
    equipment.chomp!
    JSON.parse equipment
  end
 
end

