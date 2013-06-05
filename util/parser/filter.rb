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
    # Ultimate equipment guide changed "Cost" to "Price"...
    addKeyChange "Price", "Cost"
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

