
class WeightConverter
  # This function, when given a string representing a weight from the PRD text,
  # returns the weight of the item is halfs of points (as an integer).
  # More specifically since items can have a range of weights it returns a list of 
  # two weights: the lowest weight in the range, and the highest. If an item only
  # has one weight the same value is returned for both.
  # 
  # Examples:
  # 2-1/2 lbs                   (2.5 lbs)
  # 1/2 lb.&amp;ndash;2 lbs.    (between 0.5 lbs and 2 lbs)
  def self.convertWeightToHalfpound(weight)
    result = 0
    weight = weight.strip

    #match_data = /([\d\/\-]*)\s*(?:lb.)?\s*(?:&amp;ndash;)?\s*([\d\/\-]*)\s*lb/.match(weight)
    match_data = /([\d\/\-]*)\s*(?:lb.)?\s*(?:&ndash;)?\s*([\d\/\-]*)\s*lb/.match(weight)

    if ! match_data
      result = [0,0]
    elsif match_data[2].length > 0 
      # The weight is a range
      low = convertTextNumberToFloat(match_data[1])*2 
      high = convertTextNumberToFloat(match_data[2])*2
      [low.to_i, high.to_i]
    else
      # Just a single weight
      w = convertTextNumberToFloat(match_data[1]) * 2
      [w.to_i, w.to_i]
    end
  end

  def self.test
    tests = [
    "1/2 lb.&ndash;2 lbs.",
    "1/2 lb.",
    "5-1/2 lb.",
    "2 lb.&ndash;5-1/2 lb."
    ]

    tests.each do |e|
      puts "Halfpound weight of #{e}:"
      puts WeightConverter.convertWeightToHalfpound(e)
      puts
    end
  end

  private
  # Convert a textual number that may contain fractions to a float.
  def self.convertTextNumberToFloat(text)
    if text =~ /^1\/2/
      result = 0.5
    elsif text =~ /^(\d+)-1\/2/
      result = $1.to_f + 0.5
    elsif text =~ /^(\d+)/
      result = $1.to_f
    else
      result = 0
    end
    result
  end
end

class CostConverter
  # This function, when given a string representing a cost from the PRD text,
  # returns the cost of the item in copper.
  # More specifically since items can have a range of costs it returns a list of 
  # two costs: the lowest in the range, and the highest. If an item only
  # has one cost the same value is returned for both.
  def self.convertCostToCopper(cost)
    copper = [0,0]
    if cost
      cost = cost.gsub(",","").strip
      
      #match_data = /([\d\/\-]*)\s*((?:[gspc]p)?)\s*(?:&amp;ndash;)?\s*([\d\/\-]*)(?:&amp;shy;)?\s*((?:[gspc]p))/.match(cost)
      match_data = /([\d\/\-]*)\s*((?:[gspc]p)?)\s*(?:&ndash;)?\s*([\d\/\-]*)(?:&shy;)?\s*((?:[gspc]p))/.match(cost)

      if ! match_data
        copper = [0,0]
      elsif match_data[3].length > 0 
        # Cost is a range.
        cost1 = match_data[1]
        unit1 = match_data[2]
        cost2 = match_data[3]
        unit2 = match_data[4]
        # Unit 1 was ommitted in the range; it is then the same as unit 2 (for example: 10-20gp)
        unit1 = unit2 if unit1.length == 0 && unit2.length > 0
        
        cost1 = costAndUnitToCopper(cost1, unit1)
        cost2 = costAndUnitToCopper(cost2, unit2)
        copper = [cost1, cost2]
      else
        # One cost
        copper = costAndUnitToCopper(match_data[1], match_data[4])
        copper = [copper, copper]
      end
    end

    copper
  end

  private
  def self.costAndUnitToCopper(cost, unit)
    cost = cost.to_i
    if unit == 'sp'
      cost *= 10
    elsif unit == 'gp'
      cost *= 100
    elsif unit == 'pp'
      cost *= 1000
    end
    cost
  end

  def self.test
    tests = [
    "1 sp&ndash;50 gp",
    "2 sp",
    "5&ndash;10 gp",
    # One item (Hennin) has a soft-hyphen for some reason.
    "10&ndash;100&shy; gp"
    ]

    tests.each do |e|
      puts "Cost of #{e}:"
      puts CostConverter.convertCostToCopper(e)
      puts
    end
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

  # This method should return :process in order for the row to be output.
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
    # Ultimate equipment guide changed "Cost" to "Price"...
    addKeyChange "Price", "Cost"
  end

  def process(hash)
    result = super
    raise "Equipment has no Cost: '#{hash['Name']}' #{hash}" if ! hash.has_key?('Cost')
    #hash['copper_cost'] = convertCostToCopper(hash['Cost'])
    costs = CostConverter.convertCostToCopper(hash['Cost'])
    hash['copper_cost'] = costs[0]
    hash['copper_cost_high'] = costs[1]
    raise "Equipment has no Weight: #{hash['Name']}" if ! hash.has_key?('Weight')
    weights = WeightConverter.convertWeightToHalfpound(hash['Weight'])
    hash['halfpound_weight'] = weights[0]
    hash['halfpound_weight_high'] = weights[1]
    result
  end
end

class WeaponRowFilter < BaseFilter
  def initialize
    super
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
    addKeyChange "Armor/Shield Bonus", "AC_Bonus"
    addKeyChange "Armor Check Penalty", "Check_Penalty"
    addKeyChange "Arcane Spell Failure Chance", "Arcane_Failure"
    addKeyChange "Max Dex Bonus", "Maximum"
    addGsub(/&amp;ndash;/,'-')
    addGsub(/&ndash;/,'-')
    addGsub(/Tower/, "Tower shield")
    addGsub(/Heavy wooden$/, "Heavy wooden shield")
    addGsub(/Heavy steel$/, "Heavy steel shield")
    addGsub(/Light wooden$/, "Light wooden shield")
    addGsub(/Light steel$/, "Light steel shield")
    addGsub(/Light wooden quickdraw$/, "Light wooden quickdraw shield")
    addGsub(/Light steel quickdraw$/, "Light steel quickdraw shield")
    #addGsub(/&amp;mdash;/,'-')
  end

  def process(hash)
    super
  end
end

class ItemRowFilter < BaseFilter
  def initialize
    super

    addKeyChange "Craft DC", "Craft_DC"
    addKeyChange "Fort DC", "Fort_DC"
  end

  def process(hash)
    super
  end
end

