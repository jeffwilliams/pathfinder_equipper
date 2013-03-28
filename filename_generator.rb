class FilenameGenerator
  def initialize
    @mutex = Mutex.new
  end
  def generateNewFilename(base, ext)
    tries = 3
    while tries > 0
      
      filename = "#{base}-#{Thread.current.object_id}-#{rand(10000)}.#{ext}"
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


